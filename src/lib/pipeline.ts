// The closed loop: requirement -> outline -> per-page copy -> per-slide image.
//
//  - TEXT stages run on the selected engine: the zero-config Codex Responses
//    endpoint (engine "codex") OR a detected local agent CLI (codex/claude/gemini).
//  - IMAGE stages use the configured image backend.
//  - One image call per slide (the html-video lesson: never ask for the whole
//    deck in one shot), each isolated so one failure doesn't sink the deck.

import { generateSlideImage as generateCodexSlideImage } from "./codex-image";
import { generateSlideImage, imageProviderSupportsReferences } from "./image";
import { codexJson, codexText, parseLooseJson, type CodexInputAttachment } from "./codex-text";
import { loadCommunityStyleReference } from "./communityReference";
import { ensureCurrentDeckVersion } from "./deckVersions";
import { runCliAgentText } from "./agents";
import {
  attachMaterialsToProject,
  loadProjectInputAttachments,
  loadProjectMaterialBuffers,
  loadStagedInputAttachments,
} from "./materials";
import { applyProjectTemplateAssets } from "./projectTemplates";
import {
  buildImagePrompt,
  buildMarkEditPrompt,
  buildOutlinePrompt,
  buildOutlineRevisePrompt,
  buildPageDescriptionPrompt,
  extractSlideText,
} from "./prompts";
import {
  loadProject,
  newProjectId,
  replaceProjectPages,
  saveProject,
  saveSlideImage,
} from "./store";
import type {
  DesignFileReference,
  Engine,
  OutlinePage,
  PptConfig,
  ProgressEvent,
  Project,
  SlidePage,
} from "./types";
import { completeJsonArrayObjects } from "./streamingJson";
import { isAbortError, sleep, withRetry } from "./retry";

type Emit = (e: ProgressEvent) => void;

async function generateText(
  engine: Engine,
  prompt: string,
  opts: {
    json?: boolean;
    signal?: AbortSignal;
    attachments?: CodexInputAttachment[];
    onText?: (text: string) => void;
  } = {},
): Promise<string> {
  if (engine === "codex") {
    return opts.json
      ? JSON.stringify(await codexJson(prompt, {
          signal: opts.signal,
          attachments: opts.attachments,
          onText: opts.onText,
        }))
      : codexText(prompt, {
          signal: opts.signal,
          attachments: opts.attachments,
          onText: opts.onText,
        });
  }
  const localItems = (opts.attachments ?? []).filter((item) => item.path);
  const localPrompt = localItems.length
    ? [
        prompt,
        "",
        "These project Design Files are available as context. Read the files relevant to this task from disk and use their real contents and visuals:",
        ...localItems.map((item) => `- ${item.name}: ${item.path}`),
      ].join("\n")
    : prompt;
  const { text } = await runCliAgentText(engine, localPrompt, { signal: opts.signal });
  opts.onText?.(text);
  return text;
}

async function generateJson<T>(
  engine: Engine,
  prompt: string,
  signal?: AbortSignal,
  attachments?: CodexInputAttachment[],
  onText?: (text: string) => void,
): Promise<T> {
  const text = await generateText(engine, prompt, {
    json: engine === "codex",
    signal,
    attachments,
    onText,
  });
  return parseLooseJson<T>(text);
}

function normalizeOutline(raw: any): OutlinePage[] {
  // Accept [{title,points}] or {slides:[...]} / {outline:[...]}
  const arr = Array.isArray(raw) ? raw : raw?.slides ?? raw?.outline ?? raw?.pages ?? [];
  return (arr as any[])
    .map((p) => ({
      title: String(p?.title ?? p?.heading ?? "").trim(),
      points: Array.isArray(p?.points)
        ? p.points.map((x: any) => String(x).trim()).filter(Boolean)
        : [],
    }))
    .filter((p) => p.title);
}

export interface RunOptions {
  signal?: AbortSignal;
  /** Reuse the project shell created before clarification instead of creating a second project. */
  projectId?: string;
}

/**
 * How many slides render concurrently in fast mode. The Codex Responses endpoint
 * rate-limits (HTTP 429) under heavy fan-out, so we cap in-flight work and let the
 * rest queue; `postCodexResponses` already retries 429/5xx with backoff, so any
 * page that still trips a limit recovers instead of failing the deck. Kept modest
 * because each page is TWO calls (copy + image).
 */
export const FAST_CONCURRENCY = 4;

/**
 * How many times each generation STAGE (copy, then image) is attempted for a
 * single page inside one render pass before the page is declared failed. The
 * low-level HTTP client (`postCodexResponses`) already retries transient
 * 429/5xx/network errors; this second layer additionally recovers the failures
 * that survive a "successful" HTTP call — an empty image stream, a content-
 * safety block, or a flaky copy stage — so a single blip never fails a page.
 */
export const PAGE_MAX_ATTEMPTS = 3;

/**
 * After the main pass, how many additional verification sweeps re-render pages
 * that are still missing an image. Each sweep re-runs the full per-page retry
 * with a longer inter-round backoff, so a sustained outage (rate-limit storm)
 * gets a real chance to clear. This is the "确保每一页都生成" guarantee.
 */
export const VERIFY_MAX_ROUNDS = 2;

/**
 * Run `worker` over `items` with at most `limit` in flight at once (the rest
 * queue). Resolves when every item has settled; individual failures are the
 * worker's responsibility (each per-page worker isolates its own errors).
 */
async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}

function outlineToPages(outline: OutlinePage[]): SlidePage[] {
  return outline.map((o, i) => ({
    index: i + 1,
    title: o.title,
    points: [...o.points],
    status: "pending" as const,
  }));
}

/**
 * Stage 1 only (搜索/写大纲 → 草稿): write the outline and persist a DRAFT project
 * with every slide still `pending`. No images are drawn yet — the caller can let
 * the user edit and confirm the outline before rendering. Emits `project` + `outline`.
 */
export async function planOutline(
  config: PptConfig,
  emit: Emit,
  opts: RunOptions = {},
): Promise<Project> {
  const { signal } = opts;
  const engineLabel = config.engine;
  emit({ type: "agent", agent: engineLabel, engine: config.engine });

  emit({ type: "log", message: "Writing the outline…" });
  const checkpoint = opts.projectId ? loadProject(opts.projectId) : null;
  if (opts.projectId && !checkpoint) throw new Error("project checkpoint not found");
  // The home submit creates the project shell and archives its context items
  // before any agent call. Local engines therefore receive stable Design Files
  // paths; the staging path remains only for one-shot/API callers without a shell.
  const inputAttachments = checkpoint
    ? loadProjectInputAttachments(checkpoint.id, checkpoint.materials)
    : loadStagedInputAttachments(config.materialIds);
  let emittedPages = 0;
  const emitNewPages = (text: string) => {
    const partial = normalizeOutline(completeJsonArrayObjects(text));
    while (emittedPages < partial.length) {
      emit({ type: "outline_page", page: partial[emittedPages], index: emittedPages });
      emittedPages += 1;
    }
  };
  const outlineRaw = await generateJson<any>(
    config.engine,
    buildOutlinePrompt(config),
    signal,
    inputAttachments,
    emitNewPages,
  );
  const outline = normalizeOutline(outlineRaw);
  if (!outline.length) throw new Error("Outline generation returned no slides");
  while (emittedPages < outline.length) {
    emit({ type: "outline_page", page: outline[emittedPages], index: emittedPages });
    emittedPages += 1;
  }

  const title = outline[0]?.title || config.requirement.slice(0, 40) || "Untitled deck";
  const id = checkpoint?.id ?? newProjectId(title);
  const now = new Date().toISOString();
  const project: Project = checkpoint ?? {
    id,
    createdAt: now,
    updatedAt: now,
    config,
    agent: engineLabel,
    title,
    outline: [],
    pages: [],
    status: "draft",
  };
  project.config = config;
  project.agent = engineLabel;
  project.title = title;
  project.outline = outline;
  project.pages = outlineToPages(outline);
  project.researchDoc = config.researchDoc;
  project.status = "draft";
  project.workflow = { ...(project.workflow ?? {}), stage: "outline" };
  // Copy staged context items into the project now so the draft owns them durably
  // (the user may spend minutes editing the outline before rendering).
  if (config.materialIds?.length) {
    const existingIds = new Set((project.materials ?? []).map((material) => material.id));
    const attached = attachMaterialsToProject(id, config.materialIds.filter((materialId) => !existingIds.has(materialId)));
    project.materials = [...(project.materials ?? []), ...attached];
    project.config.materialIds = project.materials.map((material) => material.id);
  }
  applyProjectTemplateAssets(project);
  saveProject(project);
  emit({ type: "project", id });
  emit({ type: "outline", outline, title });
  return project;
}

/**
 * Stages 2+3 (一页页生成): render every not-yet-rendered slide of an existing
 * project, one image per slide, each isolated so one failure doesn't sink the deck.
 * Sets status rendering → ready. Emits `page_*` + `done`.
 */
export async function renderProject(
  id: string,
  emit: Emit,
  opts: RunOptions = {},
): Promise<Project> {
  const { signal } = opts;
  const project = loadProject(id);
  if (!project) throw new Error("project not found");
  const { config } = project;

  const includeImageReferences = imageProviderSupportsReferences();
  const materialBuffers = includeImageReferences
    ? loadProjectMaterialBuffers(id, project.materials)
    : [];
  const styleReference = includeImageReferences
    ? await loadCommunityStyleReference(config.template, signal)
    : null;
  const referenceBuffers = styleReference ? [styleReference, ...materialBuffers] : materialBuffers;
  const projectAttachments = loadProjectInputAttachments(id, project.materials);
  if (projectAttachments.length) {
    emit({ type: "log", message: `Using ${projectAttachments.length} context item(s)` });
  }
  const hasMaterials = materialBuffers.length > 0;

  project.status = "rendering";
  project.workflow = { ...(project.workflow ?? {}), stage: "rendering" };
  saveProject(project);

  const total = project.pages.length;

  // One slide's full copy→image chain, isolated so one failure never sinks the
  // deck. Every page reads the SAME `config` (requirement, style, template,
  // materials), so whether pages run serially or in parallel the deck stays on a
  // single unified requirement / style / brand — parallelism only reorders when
  // the identical work happens, never what it produces. Mutates the shared
  // `project`; `saveProject` is a synchronous full-state write, so concurrent
  // per-page saves in fast mode each persist everyone's latest status without
  // losing updates.
  const renderPage = async (page: SlidePage): Promise<void> => {
    if (signal?.aborted) throw new Error("aborted");
    if (page.status === "rendered") return;
    emit({ type: "page_start", index: page.index, total, title: page.title });
    const onRetry = (stage: "copy" | "image") => (attempt: number, error: unknown) => {
      emit({
        type: "page_retry",
        index: page.index,
        attempt,
        maxAttempts: PAGE_MAX_ATTEMPTS,
        stage,
        error: String((error as any)?.message ?? error),
      });
    };
    try {
      // Copy stage — skip if a prior attempt (or verify sweep) already produced
      // the body text, so a retry that only needs a new image doesn't waste a
      // text call.
      if (!page.description) {
        const descRaw = await withRetry(
          () => {
            const descPrompt = buildPageDescriptionPrompt(config, project.outline, page, page.index, total);
            return generateText(config.engine, descPrompt, { signal, attachments: projectAttachments });
          },
          { attempts: PAGE_MAX_ATTEMPTS, signal, onRetry: onRetry("copy") },
        );
        page.description = extractSlideText(descRaw);
        page.status = "described";
        saveProject(project);
        emit({ type: "page_described", index: page.index });
      }

      const imgPrompt = buildImagePrompt(config, page, page.index, total, hasMaterials, Boolean(styleReference));
      page.imagePrompt = imgPrompt;
      const bytes = await withRetry(
        () => generateSlideImage(imgPrompt, {
          refImages: referenceBuffers,
          aspect: config.aspect,
          resolution: config.resolution,
          signal,
        }),
        { attempts: PAGE_MAX_ATTEMPTS, signal, onRetry: onRetry("image") },
      );
      page.image = saveSlideImage(id, page.index, bytes);
      page.imageUpdatedAt = Date.now();
      page.status = "rendered";
      page.error = undefined;
      saveProject(project);
      emit({ type: "page_rendered", index: page.index, image: page.image });
    } catch (e: any) {
      // A cancel isn't a page failure: leave the page's status untouched and let
      // the enclosing pass observe the aborted signal and stop.
      if (isAbortError(e, signal)) return;
      page.status = "error";
      page.error = String(e?.message ?? e);
      saveProject(project);
      emit({ type: "page_error", index: page.index, error: page.error });
    }
  };

  const pending = project.pages.filter((p) => p.status !== "rendered");
  if (config.fast) {
    // Fast mode: fan every page out at once, capped at FAST_CONCURRENCY in flight
    // (the overflow queues) so we accelerate the deck without tripping rate limits.
    emit({
      type: "log",
      message: `Fast mode: rendering ${pending.length} pages in parallel (up to ${FAST_CONCURRENCY} at once)`,
    });
    await runPool(pending, FAST_CONCURRENCY, renderPage);
    if (signal?.aborted) throw new Error("aborted");
  } else {
    // Default: one page at a time.
    for (const page of pending) {
      if (signal?.aborted) throw new Error("aborted");
      await renderPage(page);
    }
  }

  // Verification sweep: every page MUST end with a rendered image. Any page that
  // is still missing one — a stage that exhausted its per-page retries, usually
  // a sustained rate-limit or a content-safety block — is re-rendered from where
  // it left off, for a few rounds with a growing backoff so a transient outage
  // has time to clear. The deck is only declared done once no page is left
  // failed, or the sweep budget is spent (partial decks stay usable, and the
  // caller still surfaces the remaining failures).
  const unfinished = () => project.pages.filter((p) => p.status !== "rendered");
  emit({
    type: "verify",
    phase: "start",
    round: 0,
    total,
    pending: unfinished().length,
    rendered: total - unfinished().length,
  });
  for (let round = 1; round <= VERIFY_MAX_ROUNDS; round++) {
    if (signal?.aborted) throw new Error("aborted");
    const failing = unfinished();
    if (!failing.length) break;
    emit({
      type: "verify",
      phase: "round",
      round,
      total,
      pending: failing.length,
      rendered: total - failing.length,
    });
    emit({
      type: "log",
      message: `Verify round ${round}/${VERIFY_MAX_ROUNDS}: re-rendering ${failing.length} unfinished page(s)`,
    });
    // Let a transient outage settle before hammering the endpoint again.
    await sleep(Math.min(20_000, 2_000 * round));
    // Clear stale error state so renderPage restarts these pages cleanly. A
    // page that already has body copy keeps it (renderPage skips the copy
    // stage) and only its image is redrawn.
    for (const page of failing) {
      if (page.status === "error") {
        page.status = page.description ? "described" : "pending";
        page.error = undefined;
      }
    }
    saveProject(project);
    if (config.fast) {
      await runPool(failing, FAST_CONCURRENCY, renderPage);
    } else {
      for (const page of failing) {
        if (signal?.aborted) throw new Error("aborted");
        await renderPage(page);
      }
    }
  }
  const stillFailed = unfinished().length;
  emit({
    type: "verify",
    phase: "done",
    round: VERIFY_MAX_ROUNDS,
    total,
    pending: stillFailed,
    rendered: total - stillFailed,
  });

  project.status = "ready";
  project.workflow = { ...(project.workflow ?? {}), stage: "deck" };
  saveProject(project);
  await ensureCurrentDeckVersion(project, {
    prompt: project.config.requirement,
    promptSource: "project",
    source: "ai",
    label: "Generated deck",
  });
  emit({ type: "done", id });
  return project;
}

/**
 * Full one-shot generation (outline → render), kept for `/api/generate` and the
 * Codex MCP plugin. The staged web flow uses planOutline + renderProject instead.
 */
export async function runGeneration(
  config: PptConfig,
  emit: Emit,
  opts: RunOptions = {},
): Promise<Project> {
  const project = await planOutline(config, emit, opts);
  return renderProject(project.id, emit, opts);
}

/**
 * Rewrite a DRAFT project's outline from a natural-language instruction (编辑大纲
 * via chat). Returns the new pages + a short reply. Drops any images and keeps the
 * project a draft, since a changed outline invalidates rendered slides.
 */
export async function reviseOutline(
  id: string,
  instruction: string,
  opts: {
    signal?: AbortSignal;
    attachments?: CodexInputAttachment[];
    designFiles?: DesignFileReference[];
  } = {},
): Promise<{ pages: SlidePage[]; reply: string }> {
  const project = loadProject(id);
  if (!project) throw new Error("project not found");
  const designFileContext = opts.designFiles?.length
    ? [
        "",
        "<design_file_references>",
        "The user referenced these local project files with @. Use the relevant contents while revising the outline:",
        ...opts.designFiles.map((file) => `- ${file.name}: ${file.path}`),
        "</design_file_references>",
      ].join("\n")
    : "";
  const raw = await generateJson<any>(
    project.config.engine,
    `${buildOutlineRevisePrompt(project, instruction)}${designFileContext}`,
    opts.signal,
    opts.attachments,
  );
  const outline = normalizeOutline(raw?.outline ?? raw);
  if (!outline.length) throw new Error("Outline revision returned no slides");
  project.status = "draft";
  project.workflow = { ...(project.workflow ?? {}), stage: "outline" };
  replaceProjectPages(project, outlineToPages(outline));
  const reply = String(raw?.reply ?? "已更新大纲。").trim() || "已更新大纲。";
  return { pages: project.pages, reply };
}

// ---- multi-round edits -------------------------------------------------

/** Regenerate one slide from scratch, optionally folding in an edit instruction. */
export async function regeneratePage(
  id: string,
  index: number,
  instruction?: string,
  requestedTitle?: string,
  signal?: AbortSignal,
): Promise<SlidePage> {
  const project = loadProject(id);
  if (!project) throw new Error("project not found");
  const page = project.pages.find((p) => p.index === index);
  if (!page) throw new Error("page not found");
  const total = project.pages.length;
  const projectAttachments = loadProjectInputAttachments(id, project.materials);

  const exactTitle = requestedTitle?.trim().slice(0, 80);
  if (exactTitle) page.title = exactTitle;
  if (instruction) {
    const isBlank = !page.image && page.status === "pending" && page.points.length === 0;
    if (isBlank) {
      if (!exactTitle && /^Slide \d+$/i.test(page.title)) {
        const explicitTitle = instruction.match(/(?:标题(?:为|是|[:：])?|title(?:d)?(?:\s+is|[:：])?)\s*[「『“"']([^」』”"'\n]{1,80})[」』”"']/i)?.[1]?.trim();
        page.title = explicitTitle || `Slide ${index}`;
      }
      page.points = [instruction.trim()];
      project.outline[index - 1] = { title: page.title, points: [...page.points] };
    } else {
      page.points = [...page.points, `(edit) ${instruction}`];
    }
  }
  if (exactTitle && project.outline[index - 1]) {
    project.outline[index - 1] = { ...project.outline[index - 1], title: exactTitle };
  }
  const descPrompt = buildPageDescriptionPrompt(
    project.config,
    project.outline,
    page,
    index,
    total,
  );
  const descRaw = await withRetry(
    () => generateText(project.config.engine, descPrompt, {
      signal,
      attachments: projectAttachments,
    }),
    { attempts: PAGE_MAX_ATTEMPTS, signal },
  );
  page.description = extractSlideText(descRaw);

  const includeImageReferences = imageProviderSupportsReferences();
  const materialBuffers = includeImageReferences
    ? loadProjectMaterialBuffers(id, project.materials)
    : [];
  const styleReference = includeImageReferences
    ? await loadCommunityStyleReference(project.config.template, signal)
    : null;
  const referenceBuffers = styleReference ? [styleReference, ...materialBuffers] : materialBuffers;
  const imgPrompt = buildImagePrompt(
    project.config,
    page,
    index,
    total,
    materialBuffers.length > 0,
    Boolean(styleReference),
  );
  page.imagePrompt = imgPrompt;
  const bytes = await withRetry(
    () => generateSlideImage(imgPrompt, {
      refImages: referenceBuffers,
      aspect: project.config.aspect,
      resolution: project.config.resolution,
      signal,
    }),
    { attempts: PAGE_MAX_ATTEMPTS, signal },
  );
  page.image = saveSlideImage(id, index, bytes);
  page.imageUpdatedAt = Date.now();
  page.status = "rendered";
  page.error = undefined;
  // Text/image generation can take minutes while chat persistence continues in
  // parallel. Commit only this page into the latest project snapshot so those
  // background saves cannot be lost (and a stale snapshot cannot drop pages).
  const latest = loadProject(id);
  if (!latest) throw new Error("project not found");
  const latestPage = latest.pages.find((candidate) => candidate.index === index);
  if (!latestPage) throw new Error("page not found");
  Object.assign(latestPage, page);
  latest.outline[index - 1] = { title: latestPage.title, points: [...latestPage.points] };
  saveProject(latest);
  return latestPage;
}

/**
 * Mark-driven edit (cowart-style): the annotated screenshot is passed as a
 * reference image; the model returns a clean, revised slide honoring the marks.
 */
export async function markEditPage(
  id: string,
  index: number,
  annotatedPng: Buffer,
  note: string,
  signal?: AbortSignal,
): Promise<SlidePage> {
  const project = loadProject(id);
  if (!project) throw new Error("project not found");
  const page = project.pages.find((p) => p.index === index);
  if (!page) throw new Error("page not found");

  const prompt = buildMarkEditPrompt(project.config, note);
  const bytes = await generateCodexSlideImage(prompt, {
    // The annotation canvas already contains the complete original slide. A
    // second, clean copy used to compete with it and frequently made the model
    // return the untouched original instead of following the red marks.
    refImages: [annotatedPng],
    aspect: project.config.aspect,
    resolution: project.config.resolution,
    signal,
  });
  page.image = saveSlideImage(id, index, bytes);
  page.imageUpdatedAt = Date.now();
  page.status = "rendered";
  page.error = undefined;
  const latest = loadProject(id);
  if (!latest) throw new Error("project not found");
  const latestPage = latest.pages.find((candidate) => candidate.index === index);
  if (!latestPage) throw new Error("page not found");
  latestPage.image = page.image;
  latestPage.imageUpdatedAt = page.imageUpdatedAt;
  latestPage.status = page.status;
  latestPage.error = undefined;
  saveProject(latest);
  return latestPage;
}
