// Codex Slides — Codex MCP integration.
//
// The web app remains the visual source of truth. These tools expose the same
// workflows to Codex, while open_codex_slides returns a first-class resource
// link that the bundled skill opens in the in-editor Browser.

import { spawn } from "node:child_process";
import { existsSync, openSync, closeSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, "..");
const APP_DIR = resolve(process.env.CODEX_SLIDES_APP_DIR || PLUGIN_ROOT);
const BASE = (process.env.CODEX_SLIDES_URL || "http://127.0.0.1:4311").replace(/\/$/, "");
const SERVER_LOG = process.env.CODEX_SLIDES_LOG || join(tmpdir(), "codex-slides-server.log");
const manifest = JSON.parse(
  await readFile(join(PLUGIN_ROOT, ".codex-plugin", "plugin.json"), "utf8"),
);

const CAPABILITIES = [
  ["Open and operate the full workspace", "open_codex_slides", "Browser"],
  ["Start a durable guided project before generation", "start_project", "MCP + Browser"],
  ["Start a navigation-independent project job", "start_project_run", "MCP + Browser"],
  ["Read durable project-job state", "get_project_run", "MCP + Browser"],
  ["Wait for a project job without hiding the Browser", "wait_project_run", "MCP + Browser"],
  ["Cancel a project job after navigation or reconnect", "cancel_project_run", "MCP + Browser"],
  ["Discover every Codex-callable workflow", "get_capabilities", "MCP"],
  ["Generate topic-specific onboarding questions", "get_onboarding_questions", "MCP"],
  ["Run source-backed deep research", "deep_research", "MCP"],
  ["Create a complete deck in one call", "create_deck", "MCP + Browser"],
  ["Create a draft outline before rendering", "create_outline", "MCP + Browser"],
  ["Revise or replace an outline", "revise_outline", "MCP"],
  ["Rank visual inspiration directions", "rank_inspiration", "MCP"],
  ["Render a confirmed draft", "render_deck", "MCP + Browser"],
  ["List existing decks", "list_projects", "MCP"],
  ["Read a deck and its slide state", "get_project", "MCP"],
  ["Read per-slide speaker notes", "get_speaker_notes", "MCP + Browser"],
  ["Write or clear per-slide speaker notes", "update_speaker_notes", "MCP + Browser"],
  ["Generate a slide or full-deck talk track", "generate_speaker_notes", "MCP + Browser"],
  ["Search curated templates and attributed community styles", "list_templates", "MCP"],
  ["List reusable project templates", "list_project_templates", "MCP + Browser"],
  ["Save a project as a reusable visual template", "save_project_as_template", "MCP + Browser"],
  ["Delete a reusable project template", "delete_project_template", "MCP"],
  ["Discover 24 scenario workflows and required source slots", "list_scenarios", "MCP + Browser"],
  ["List project Design Files", "list_design_files", "MCP + Browser"],
  ["Read or edit an existing text Design File", "read_design_file / write_design_file", "MCP + Browser"],
  ["Upload a file into the project Design Files workspace", "upload_design_file", "MCP + Browser"],
  ["Attach Design Files to outline and deck agent turns", "revise_outline / edit_deck", "MCP + Browser"],
  ["Inspect the always-on brand design system", "get_brand_design_system", "MCP + Browser"],
  ["Merge brand, color, type, spacing, asset, and style rules", "update_brand_design_system", "MCP + Browser"],
  ["Execute a natural-language deck edit", "edit_deck", "MCP + Browser"],
  ["Restyle and optionally redraw a whole deck", "restyle_deck", "MCP + Browser"],
  ["Add, duplicate, delete, or transition slides", "manage_slide", "MCP"],
  ["Generate or regenerate one slide", "regenerate_slide", "MCP"],
  ["Upload a reference image or document", "upload_material", "MCP"],
  ["Replace a slide with a local PNG", "upload_slide_image", "MCP"],
  ["Apply an annotated-PNG edit", "mark_edit_slide", "MCP + Browser"],
  ["Download PDF or PPTX", "export_deck", "MCP + Browser"],
  ["Play, navigate, and inspect the deck visually", "open_codex_slides", "Browser UI"],
  ["Inspect structured agent tool activity and reopen referenced files", "open_codex_slides", "Browser UI"],
];

const server = new McpServer(
  { name: manifest.name, version: manifest.version },
  {
    instructions: [
      "Codex Slides is a Codex-native presentation workspace backed by a local web app.",
      "For every normal new-deck request, call open_codex_slides without a project id first, immediately navigate the returned resource link in the Codex in-editor Browser, verify the home/create screen, and keep that Browser visible for the entire workflow.",
      "Submit the topic and sources through the Browser UI so Codex Slides creates a durable project and owns the clarify, outline, inspiration, render, and review checkpoints. If UI submission is unreliable, use start_project only as a deterministic fallback and immediately navigate its returned project link.",
      "Do not run research, outline generation, inspiration ranking, rendering, or complete-deck creation invisibly before opening the Browser. Do not leave the user watching only a Codex working message while a hidden end-to-end call runs.",
      "Use MCP tools for deterministic recovery and deck mutations while keeping the Browser project open for progress, confirmation, direct manipulation, presentation mode, and verification.",
      "Use create_deck only when the user explicitly asks for a headless, unattended, one-call result or the current Codex surface has no Browser.",
      "Use list_scenarios before scenario-led work, preserve required source-slot roles in materialContexts, and pass scenarioId through onboarding, research, and creation.",
      "Use list_project_templates before applying projectTemplateId. A project template reuses brand rules, base style, aspect, brand assets, and visual references without copying source content.",
      "Use list/read/write/upload Design File tools for the project file workspace; pass designFilePaths to outline or deck edits when those files are evidence.",
      "Use get_brand_design_system before update_brand_design_system. Brand updates are always-on project context; redraw existing slides only when requested.",
      "Use get_speaker_notes, update_speaker_notes, and generate_speaker_notes for presenter-only talk tracks. Speaker notes are project data, appear in presenter mode, and are embedded in PPTX export.",
    ].join(" "),
  },
);

let booting = null;

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function reachable() {
  try {
    const response = await fetch(`${BASE}/api/agents`, {
      signal: AbortSignal.timeout(2500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function runCommand(command, args, timeoutMs) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: APP_DIR,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    const collect = (chunk) => {
      output = `${output}${chunk}`.slice(-12000);
    };
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`${command} ${args.join(" ")} timed out`));
    }, timeoutMs);
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolvePromise(output);
      else reject(new Error(`${command} ${args.join(" ")} failed (${code})\n${output}`));
    });
  });
}

async function ensureServer() {
  if (await reachable()) return;
  if (process.env.CODEX_SLIDES_NO_AUTO_START === "1") {
    throw new Error(`Codex Slides is not reachable at ${BASE}.`);
  }
  if (!booting) {
    booting = (async () => {
      if (!existsSync(join(APP_DIR, ".next", "BUILD_ID"))) {
        await runCommand("npm", ["run", "build"], 10 * 60_000);
      }
      const fd = openSync(SERVER_LOG, "a");
      try {
        const child = spawn("npm", ["run", "start"], {
          cwd: APP_DIR,
          detached: true,
          env: process.env,
          stdio: ["ignore", fd, fd],
        });
        child.unref();
      } finally {
        closeSync(fd);
      }
      const deadline = Date.now() + 60_000;
      while (Date.now() < deadline) {
        await sleep(1000);
        if (await reachable()) return;
      }
      throw new Error(`Codex Slides did not start at ${BASE}. See ${SERVER_LOG}.`);
    })().finally(() => {
      booting = null;
    });
  }
  await booting;
}

function browserUrl(projectId, {
  view,
  filePath,
  scenarioId,
  slideIndex,
  panel,
  versionId,
  mode,
  checkpoint,
  conversationId,
  runId,
} = {}) {
  const url = new URL(projectId ? `${BASE}/project/${encodeURIComponent(projectId)}` : BASE);
  if (view && view !== "workspace") url.searchParams.set("view", view);
  if (filePath) url.searchParams.set("file", filePath);
  if (scenarioId) url.searchParams.set("scenario", scenarioId);
  if (Number.isInteger(slideIndex) && slideIndex > 0) url.searchParams.set("slide", String(slideIndex));
  if (panel) url.searchParams.set("panel", panel);
  if (versionId) url.searchParams.set("version", versionId);
  if (mode) url.searchParams.set("mode", mode);
  if (checkpoint) url.searchParams.set("checkpoint", checkpoint);
  if (conversationId) url.searchParams.set("conversation", conversationId);
  if (runId) url.searchParams.set("run", runId);
  return url.toString();
}

function interactiveProjectUrl(projectId) {
  const url = new URL(BASE);
  url.searchParams.set("resume", projectId);
  return url.toString();
}

function projectFileApiPath(projectId, filePath = "") {
  const encoded = String(filePath).split("/").filter(Boolean).map(encodeURIComponent).join("/");
  return `/api/projects/${encodeURIComponent(projectId)}/files${encoded ? `/${encoded}` : ""}`;
}

function resourceLink(uri, name, description) {
  return { type: "resource_link", uri, name, description, mimeType: "text/html" };
}

function browserHandoff(uri, context = {}) {
  return {
    required: true,
    url: uri,
    preferredMode: "codex-internal-browser",
    browserAction: "navigate",
    ...context,
  };
}

function ok(message, data = {}, links = []) {
  const handoffLink = links.find((link) => link.handoff);
  const structuredContent = handoffLink
    ? { ...data, browserHandoff: browserHandoff(handoffLink.uri, handoffLink.handoff) }
    : data;
  return {
    content: [
      { type: "text", text: message },
      ...links.map((link) => resourceLink(link.uri, link.name, link.description)),
    ],
    structuredContent,
  };
}

function failed(error) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{ type: "text", text: `Codex Slides error: ${message}` }],
    structuredContent: { error: message },
  };
}

function register(name, config, handler) {
  server.registerTool(name, config, async (args, extra) => {
    try {
      return await handler(args, extra);
    } catch (error) {
      return failed(error);
    }
  });
}

async function apiFetch(path, init = {}) {
  await ensureServer();
  return fetch(`${BASE}${path}`, init);
}

async function apiJson(path, init = {}) {
  const response = await apiFetch(path, init);
  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { raw };
  }
  if (!response.ok) {
    throw new Error(data.error || data.raw || `HTTP ${response.status}`);
  }
  return data;
}

async function postJson(path, body, signal) {
  return apiJson(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
}

async function consumeSse(response, onEvent) {
  if (!response.ok || !response.body) {
    throw new Error((await response.text().catch(() => "")) || `HTTP ${response.status}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamError = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
    let boundary;
    while ((boundary = buffer.indexOf("\n\n")) >= 0) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const dataLines = block
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim());
      if (!dataLines.length) continue;
      try {
        const event = JSON.parse(dataLines.join("\n"));
        if (event.type === "error") streamError = String(event.error || "stream failed");
        onEvent(event);
      } catch {
        // Ignore malformed progress frames, but keep consuming the operation.
      }
    }
  }
  if (streamError) throw new Error(streamError);
}

async function postSse(path, body, onEvent, signal) {
  const response = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  await consumeSse(response, onEvent);
}

function runApiPath(projectId, runId) {
  const path = `/api/projects/${encodeURIComponent(projectId)}/runs`;
  return runId ? `${path}?runId=${encodeURIComponent(runId)}` : path;
}

async function readProjectRun(projectId, runId, signal) {
  return apiJson(runApiPath(projectId, runId), { signal });
}

async function waitForProjectRun(projectId, runId, {
  timeoutSeconds = 120,
  pollIntervalMs = 750,
  signal,
} = {}) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  for (;;) {
    if (signal?.aborted) throw new Error("Run wait was cancelled by the MCP client.");
    const snapshot = await readProjectRun(projectId, runId, signal);
    if (!snapshot.run) throw new Error(`Project run not found: ${runId}`);
    if (["complete", "error", "cancelled"].includes(snapshot.run.status)) return snapshot;
    if (Date.now() >= deadline) return { ...snapshot, timedOut: true };
    await sleep(pollIntervalMs);
  }
}

async function projectRunRequest(projectId, {
  kind,
  instruction,
  conversationId,
  locale,
  slideIndex,
  materialIds = [],
  designFilePaths = [],
}) {
  const project = await apiJson(`/api/projects/${encodeURIComponent(projectId)}`);
  if (kind === "render") return { kind, conversationId, locale };
  const contextPage = slideIndex
    ? project.pages?.find((page) => page.index === slideIndex)
    : undefined;
  const materialById = new Map((project.materials || []).map((item) => [item.id, item]));
  const attachments = materialIds.flatMap((id) => {
    const item = materialById.get(id);
    if (!item) return [];
    return [{
      id,
      name: item.name,
      url: `/api/projects/${encodeURIComponent(projectId)}/materials/${encodeURIComponent(item.file)}`,
      kind: item.kind === "image" ? "image" : "file",
      mimeType: item.mimeType || "application/octet-stream",
      size: item.size || 0,
    }];
  });
  const designFiles = designFilePaths.map((filePath) => ({
    path: filePath,
    relativePath: filePath,
    name: basename(filePath),
    kind: "other",
  }));
  return {
    kind,
    conversationId,
    locale,
    request: {
      message: instruction,
      context: contextPage ? { slideIndex, title: contextPage.title } : undefined,
      attachments,
      designFiles,
    },
  };
}

function projectLink(projectId, label = "Open deck in Codex Browser", options = {}) {
  const uri = browserUrl(projectId, options);
  return {
    uri,
    name: label,
    description: "Open the live Codex Slides workspace in the Codex in-editor Browser.",
    handoff: {
      projectId,
      stage: options.checkpoint,
      focus: {
        ...(options.slideIndex ? { slideIndex: options.slideIndex } : {}),
        ...(options.panel ? { panel: options.panel } : {}),
        ...(options.filePath ? { filePath: options.filePath } : {}),
        ...(options.versionId ? { versionId: options.versionId } : {}),
        ...(options.mode ? { mode: options.mode } : {}),
        ...(options.conversationId ? { conversationId: options.conversationId } : {}),
        ...(options.runId ? { runId: options.runId } : {}),
      },
    },
  };
}

function homeLink(uri, label = "Open Codex Slides", context = {}) {
  return {
    uri,
    name: label,
    description: "Open the live Codex Slides workspace in the Codex in-editor Browser.",
    handoff: context,
  };
}

function slideSummary(page) {
  return {
    index: page.index,
    title: page.title,
    status: page.status,
    image: page.image,
    transition: page.transition || "none",
    speakerNotes: page.speakerNotes || "",
    error: page.error,
  };
}

function mimeFor(path) {
  const ext = extname(path).toLowerCase();
  return {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".csv": "text/csv",
    ".json": "application/json",
  }[ext] || "application/octet-stream";
}

async function fileForm(filePath, field = "file", maxBytes = 30 * 1024 * 1024) {
  const absolute = resolve(filePath);
  const bytes = await readFile(absolute);
  if (bytes.length > maxBytes) throw new Error(`File exceeds ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  const form = new FormData();
  form.append(field, new Blob([bytes], { type: mimeFor(absolute) }), basename(absolute));
  return { form, absolute, bytes };
}

register(
  "get_capabilities",
  {
    title: "Get Codex Slides capabilities",
    description: "Discover every MCP and in-editor Browser workflow exposed by Codex Slides.",
    inputSchema: {},
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async () => ok(
    `Codex Slides exposes ${CAPABILITIES.length} callable workflow surfaces. Use open_codex_slides for the live visual workspace.`,
    { baseUrl: BASE, capabilities: CAPABILITIES.map(([capability, tool, surface]) => ({ capability, tool, surface })) },
    [homeLink(BASE)],
  ),
);

register(
  "open_codex_slides",
  {
    title: "Open Codex Slides in the Codex Browser",
    description: "Start Codex Slides if needed and return the home or project workspace. After this tool returns, navigate its resource link in the in-editor Browser; do not only print the URL.",
    inputSchema: {
      projectId: z.string().optional().describe("Existing project id. Omit to open the home/create workspace."),
      view: z.enum(["workspace", "scenarios", "design-files", "brand-system"]).optional()
        .describe("Deep-link to a newly exposed workspace surface."),
      filePath: z.string().optional().describe("Design File path when view is design-files."),
      scenarioId: z.string().optional().describe("Scenario to preselect when view is scenarios."),
      slideIndex: z.number().int().min(1).optional().describe("Slide to focus in the live canvas."),
      panel: z.enum(["design-files", "brand-system", "speaker-notes", "versions", "export", "play"]).optional(),
      versionId: z.string().optional().describe("Version to focus when panel is versions."),
      mode: z.enum(["workspace", "play", "presenter"]).optional(),
      checkpoint: z.enum(["clarify", "research", "outline", "inspire", "render", "deck"]).optional(),
      conversationId: z.string().optional().describe("Deck Agent conversation to focus."),
      runId: z.string().optional().describe("Durable project run to surface."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ projectId, view = "workspace", filePath, scenarioId, slideIndex, panel, versionId, mode, checkpoint, conversationId, runId }) => {
    if (["design-files", "brand-system"].includes(view) && !projectId) {
      throw new Error(`${view} requires projectId.`);
    }
    await ensureServer();
    const targetProjectId = view === "scenarios" ? undefined : projectId;
    const uri = browserUrl(targetProjectId, {
      view, filePath, scenarioId, slideIndex, panel, versionId, mode, checkpoint, conversationId, runId,
    });
    const link = targetProjectId
      ? projectLink(targetProjectId, "Open deck workspace", {
          view, filePath, slideIndex, panel, versionId, mode, checkpoint, conversationId, runId,
        })
      : homeLink(uri, "Open Codex Slides", { view, stage: checkpoint });
    return ok(
      `Codex Slides is ready at ${uri}. Open this resource now in the Codex in-editor Browser and keep it visible for interaction.`,
      { url: uri, projectId: targetProjectId || null, view, browserAction: "navigate" },
      [link],
    );
  },
);

register(
  "get_onboarding_questions",
  {
    title: "Generate deck onboarding questions",
    description: "Generate tailored questions for pages, audience, language, category, style, and content emphasis before making a deck.",
    inputSchema: {
      topic: z.string().min(1),
      scenarioId: z.string().optional().describe("Scenario id from list_scenarios."),
      uiLocale: z.enum(["zh-CN", "zh-TW", "en", "ja"]).optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ topic, scenarioId, uiLocale }, extra) => {
    const data = await postJson("/api/onboard", { requirement: topic, scenarioId, uiLocale }, extra.signal);
    return ok(`Generated ${data.questions?.length || 0} onboarding questions.`, data);
  },
);

register(
  "deep_research",
  {
    title: "Deep research a deck topic",
    description: "Run Codex web research and return a source-backed editable Markdown brief.",
    inputSchema: {
      topic: z.string().min(1),
      rounds: z.number().int().min(1).max(4).optional(),
      scenarioId: z.string().optional().describe("Scenario id from list_scenarios."),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ topic, rounds = 2, scenarioId }, extra) => {
    let markdown = "";
    const queries = [];
    await postSse("/api/research", { requirement: topic, rounds, scenarioId }, (event) => {
      if (event.type === "doc") markdown = event.markdown || "";
      if (event.type === "search" && event.query) queries.push(event.query);
    }, extra.signal);
    return ok(markdown || "No research document was produced.", { topic, rounds, scenarioId, queries, markdown });
  },
);

const designSystemShape = z.object({
  version: z.literal(1).optional(),
  brand: z.object({
    name: z.string().optional(),
    tagline: z.string().optional(),
    voice: z.string().optional(),
    logoUsage: z.string().optional(),
    assetMaterialIds: z.array(z.string()).optional(),
  }).optional(),
  style: z.object({
    direction: z.string().optional(),
    keywords: z.string().optional(),
    imageTreatment: z.string().optional(),
  }).optional(),
  colors: z.object({
    primary: z.string().optional(),
    primaryTint: z.string().optional(),
    accent: z.string().optional(),
    accentTint: z.string().optional(),
    ink: z.string().optional(),
    surface: z.string().optional(),
    background: z.string().optional(),
    backgroundWarm: z.string().optional(),
  }).optional(),
  typography: z.object({
    headingFont: z.string().optional(),
    bodyFont: z.string().optional(),
    monoFont: z.string().optional(),
    headingWeight: z.number().int().optional(),
    bodyWeight: z.number().int().optional(),
    scale: z.string().optional(),
  }).optional(),
  effects: z.object({
    shadow: z.string().optional(),
    border: z.string().optional(),
    texture: z.string().optional(),
  }).optional(),
  spacing: z.object({
    density: z.enum(["compact", "balanced", "spacious"]).optional(),
    baseUnit: z.number().int().optional(),
    sectionGap: z.number().int().optional(),
  }).optional(),
  radius: z.object({
    card: z.number().int().optional(),
    control: z.number().int().optional(),
    pill: z.number().int().optional(),
  }).optional(),
});

const materialContextShape = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
});

const deckConfigShape = {
  topic: z.string().min(1).describe("What the deck is about"),
  pages: z.number().int().min(1).max(30).optional(),
  aspect: z.enum(["16:9", "4:3", "1:1", "9:16", "3:4"]).optional(),
  language: z.enum(["auto", "zh", "en", "ja"]).optional(),
  style: z.string().optional(),
  template: z.string().optional().describe("Template id from list_templates"),
  projectTemplateId: z.string().optional().describe("Reusable project template id from list_project_templates"),
  resolution: z.enum(["1K", "2K", "4K"]).optional(),
  materialIds: z.array(z.string()).optional().describe("Reference ids returned by upload_material"),
  materialContexts: z.array(materialContextShape).max(24).optional()
    .describe("Semantic source roles mapped from a scenario's file slots."),
  scenarioId: z.string().optional().describe("Scenario id from list_scenarios; its defaults and workflow contract are applied automatically."),
  designSystem: designSystemShape.optional().describe("Project-wide brand and visual rules to apply from the first slide."),
  fast: z.boolean().optional().describe("Render slide images concurrently with rate-limit-aware queuing"),
  research: z.boolean().optional(),
  researchDoc: z.string().optional().describe("An already-reviewed research brief"),
};

function deckRequest(args, researchDoc) {
  const hasPreset = Boolean(args.scenarioId || args.projectTemplateId);
  return {
    requirement: args.topic,
    pages: args.pages ?? (args.scenarioId ? undefined : 6),
    aspect: args.aspect ?? (hasPreset ? undefined : "16:9"),
    language: args.language ?? "auto",
    style: args.style ?? (hasPreset ? undefined : ""),
    template: args.template,
    projectTemplateId: args.projectTemplateId,
    resolution: args.resolution ?? (args.projectTemplateId ? undefined : "2K"),
    materialIds: args.materialIds ?? [],
    materialContexts: args.materialContexts ?? [],
    scenarioId: args.scenarioId,
    designSystem: args.designSystem,
    engine: "codex",
    ...(args.fast ? { fast: true } : {}),
    ...(args.research || researchDoc ? { mode: "research", researchDoc: researchDoc || undefined } : {}),
  };
}

register(
  "start_project",
  {
    title: "Start an interactive Codex Slides project",
    description: "Create only the durable project shell at the clarification stage and return its live Browser workspace. This is the deterministic fallback after opening the Codex Slides home screen; it does not research, outline, choose a style, or render slides.",
    inputSchema: {
      ...deckConfigShape,
      title: z.string().optional().describe("Optional project title; defaults to the first line of the topic."),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  },
  async (args, extra) => {
    const project = await postJson("/api/projects", {
      title: args.title,
      config: deckRequest(args, args.researchDoc),
    }, extra.signal);
    const uri = interactiveProjectUrl(project.id);
    return ok(
      `Started “${project.title}” at the clarification checkpoint. Navigate this resource now and continue every confirmation step in the Codex Browser.`,
      {
        projectId: project.id,
        title: project.title,
        workflowStage: project.workflow?.stage || "clarify",
        url: uri,
        browserAction: "navigate",
        interactionMode: "browser-guided",
      },
      [homeLink(uri, "Continue project in Codex Slides", {
        projectId: project.id,
        stage: project.workflow?.stage || "clarify",
        focus: { checkpoint: project.workflow?.stage || "clarify" },
      })],
    );
  },
);

register(
  "start_project_run",
  {
    title: "Start a durable Codex Slides project run",
    description: "Start a navigation-independent Deck Agent, outline, or render job and return immediately with a durable run id. Keep the returned Browser workspace open while the run proceeds.",
    inputSchema: {
      projectId: z.string(),
      kind: z.enum(["chat", "outline", "render"]),
      instruction: z.string().min(1).optional().describe("Required for chat and outline runs."),
      conversationId: z.string().optional(),
      locale: z.enum(["zh-CN", "zh-TW", "en", "ja"]).optional(),
      slideIndex: z.number().int().min(1).optional(),
      materialIds: z.array(z.string()).max(8).optional(),
      designFilePaths: z.array(z.string()).max(12).optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  },
  async (args, extra) => {
    if (args.kind !== "render" && !args.instruction?.trim()) {
      throw new Error(`${args.kind} requires instruction.`);
    }
    const input = await projectRunRequest(args.projectId, args);
    const data = await postJson(runApiPath(args.projectId), input, extra.signal);
    const runId = data.queued ? null : (data.run?.id || data.activeRun?.id || null);
    const link = projectLink(args.projectId, "Watch project run", {
      slideIndex: args.slideIndex,
      conversationId: args.conversationId,
      runId,
      checkpoint: args.kind === "outline" ? "outline" : args.kind === "render" ? "render" : "deck",
    });
    return ok(
      data.queued
        ? `The project was busy, so this request is queued as ${data.queuedRequestId}.`
        : `Started ${args.kind} run ${runId}.`,
      {
        projectId: args.projectId,
        runId,
        run: data.run || data.activeRun || null,
        queued: Boolean(data.queued),
        queuedRequestId: data.queuedRequestId || null,
        queue: data.queue || [],
      },
      [link],
    );
  },
);

register(
  "get_project_run",
  {
    title: "Get a Codex Slides project run",
    description: "Read the current or a named durable project run, including progress, target slide, and terminal outcome.",
    inputSchema: { projectId: z.string(), runId: z.string().optional() },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ projectId, runId }, extra) => {
    const data = await readProjectRun(projectId, runId, extra.signal);
    if (runId && !data.run) throw new Error(`Project run not found: ${runId}`);
    const focusRunId = data.run?.id || runId;
    return ok(
      data.run ? `Project run ${data.run.id} is ${data.run.status}.` : "This project has no active or recent run.",
      { projectId, run: data.run || null, activeRun: data.activeRun || null },
      [projectLink(projectId, "Open project run", {
        slideIndex: data.run?.targetSlide,
        runId: focusRunId,
      })],
    );
  },
);

register(
  "wait_project_run",
  {
    title: "Wait for a Codex Slides project run",
    description: "Wait for a durable project run to finish while its Browser workspace remains independently visible and resumable.",
    inputSchema: {
      projectId: z.string(),
      runId: z.string(),
      timeoutSeconds: z.number().int().min(1).max(300).optional(),
      pollIntervalMs: z.number().int().min(250).max(5000).optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ projectId, runId, timeoutSeconds = 120, pollIntervalMs = 750 }, extra) => {
    const data = await waitForProjectRun(projectId, runId, {
      timeoutSeconds,
      pollIntervalMs,
      signal: extra.signal,
    });
    const run = data.run;
    const message = data.timedOut
      ? `Project run ${runId} is still ${run.status}; the wait timed out without cancelling it.`
      : `Project run ${runId} finished with status ${run.status}.`;
    return ok(message, { projectId, run, timedOut: Boolean(data.timedOut) }, [
      projectLink(projectId, "Inspect project run result", {
        slideIndex: run.targetSlide,
        runId,
      }),
    ]);
  },
);

register(
  "cancel_project_run",
  {
    title: "Cancel a Codex Slides project run",
    description: "Request cancellation of the active durable project run without requiring the Browser tab to remain mounted.",
    inputSchema: { projectId: z.string(), runId: z.string().optional() },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  },
  async ({ projectId, runId }, extra) => {
    const data = await apiJson(runApiPath(projectId, runId), { method: "DELETE", signal: extra.signal });
    const run = data.run || data.activeRun || null;
    return ok(
      run ? `Cancellation requested for project run ${run.id}.` : "The project has no active run to cancel.",
      { projectId, run, activeRun: data.activeRun || null },
      [projectLink(projectId, "Open project after cancellation", { runId: run?.id || runId })],
    );
  },
);

register(
  "create_deck",
  {
    title: "Create a complete deck unattended",
    description: "Explicit headless fast path: research as requested, generate the outline, and render the complete deck without interactive Browser checkpoints. Do not use for a normal creation request; open the Browser and use its guided project workflow instead.",
    inputSchema: deckConfigShape,
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  },
  async (args, extra) => {
    let researchDoc = args.researchDoc;
    if (args.research && !researchDoc?.trim()) {
      await postSse("/api/research", { requirement: args.topic, rounds: 2, scenarioId: args.scenarioId }, (event) => {
        if (event.type === "doc") researchDoc = event.markdown;
      }, extra.signal);
    }
    let projectId = "";
    let title = "";
    let rendered = 0;
    let errored = 0;
    await postSse("/api/generate", deckRequest(args, researchDoc), (event) => {
      if (event.type === "project") projectId = event.id;
      if (event.type === "outline") title = event.title;
      if (event.type === "page_rendered") rendered += 1;
      if (event.type === "page_error") errored += 1;
    }, extra.signal);
    if (!projectId) throw new Error("Generation finished without creating a project.");
    return ok(
      `Created “${title || args.topic}” (${rendered} rendered${errored ? `, ${errored} failed` : ""}). Open it now in the Codex Browser.`,
      { projectId, title, rendered, errored, previewUrl: browserUrl(projectId) },
      [projectLink(projectId, "Inspect created deck", { checkpoint: "deck" })],
    );
  },
);

register(
  "create_outline",
  {
    title: "Create a draft deck outline",
    description: "Run optional research, generate an editable outline, and persist a draft without rendering slide images yet.",
    inputSchema: deckConfigShape,
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  },
  async (args, extra) => {
    let projectId = "";
    let title = "";
    let outline = [];
    let researchDoc = args.researchDoc || "";
    await postSse("/api/outline", deckRequest(args, researchDoc), (event) => {
      if (event.type === "project") projectId = event.id;
      if (event.type === "outline") {
        title = event.title;
        outline = event.outline || [];
      }
      if (event.type === "research" && event.markdown) researchDoc = event.markdown;
    }, extra.signal);
    if (!projectId) throw new Error("Outline generation finished without creating a draft.");
    return ok(
      `Created draft “${title || args.topic}” with ${outline.length} slides. Review or revise it before render_deck.`,
      { projectId, title, outline, researchDoc, previewUrl: browserUrl(projectId) },
      [projectLink(projectId, "Open draft outline", { checkpoint: "outline" })],
    );
  },
);

register(
  "revise_outline",
  {
    title: "Revise a deck outline",
    description: "Revise a draft outline with natural language, or replace it with an explicit ordered page list.",
    inputSchema: {
      projectId: z.string(),
      instruction: z.string().optional(),
      pages: z.array(z.object({ title: z.string(), points: z.array(z.string()).optional() })).optional(),
      designFilePaths: z.array(z.string()).max(12).optional()
        .describe("Project Design File paths from list_design_files to use as revision context."),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  },
  async ({ projectId, instruction, pages, designFilePaths = [] }, extra) => {
    if (!instruction?.trim() && !pages?.length) throw new Error("Provide instruction or pages.");
    const data = pages?.length
      ? await apiJson(`/api/projects/${encodeURIComponent(projectId)}/outline`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pages }),
          signal: extra.signal,
        })
      : await postJson(`/api/projects/${encodeURIComponent(projectId)}/outline`, {
          message: instruction,
          designFilePaths,
        }, extra.signal);
    return ok(
      data.reply || `Saved ${data.pages?.length || pages?.length || 0} outline pages.`,
      { projectId, ...data },
      [projectLink(projectId, "Review revised outline", { checkpoint: "outline" })],
    );
  },
);

register(
  "rank_inspiration",
  {
    title: "Rank visual inspiration",
    description: "Rank Codex Slides's community visual directions against a topic and outline.",
    inputSchema: {
      topic: z.string().optional(),
      outlineTitles: z.array(z.string()).optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ topic = "", outlineTitles = [] }, extra) => {
    if (!topic.trim() && !outlineTitles.length) throw new Error("Provide topic or outlineTitles.");
    const data = await postJson("/api/inspire", { requirement: topic, outlineTitles }, extra.signal);
    return ok(`Ranked ${data.ranked?.length || 0} visual directions.`, data);
  },
);

register(
  "render_deck",
  {
    title: "Render a draft deck",
    description: "Render every confirmed draft page as an image, then return its Browser preview.",
    inputSchema: { projectId: z.string() },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  },
  async ({ projectId }, extra) => {
    let rendered = 0;
    let errored = 0;
    await postSse(`/api/projects/${encodeURIComponent(projectId)}/render`, {}, (event) => {
      if (event.type === "page_rendered") rendered += 1;
      if (event.type === "page_error") errored += 1;
    }, extra.signal);
    return ok(
      `Rendered ${rendered} slides${errored ? `; ${errored} failed` : ""}. Open the result in the Codex Browser.`,
      { projectId, rendered, errored, previewUrl: browserUrl(projectId) },
      [projectLink(projectId, "Watch rendered deck", { checkpoint: "render" })],
    );
  },
);

register(
  "list_projects",
  {
    title: "List Codex Slides decks",
    description: "List existing decks with render state and Browser resource links.",
    inputSchema: {},
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async () => {
    const data = await apiJson("/api/projects");
    const projects = (data.projects || []).map((project) => ({ ...project, previewUrl: browserUrl(project.id) }));
    const lines = projects.map((project) => `- ${project.title} — ${project.rendered}/${project.total} slides — ${project.id}`);
    return ok(
      lines.join("\n") || "No Codex Slides decks yet.",
      { projects },
      projects.slice(0, 10).map((project) => projectLink(project.id, project.title)),
    );
  },
);

register(
  "get_project",
  {
    title: "Get a Codex Slides deck",
    description: "Read project configuration, outline, slide state, materials, and optional saved chat.",
    inputSchema: {
      projectId: z.string(),
      includeChat: z.boolean().optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ projectId, includeChat = false }) => {
    const project = await apiJson(`/api/projects/${encodeURIComponent(projectId)}`);
    if (!includeChat) delete project.chat;
    return ok(
      `“${project.title}” has ${project.pages?.length || 0} slides and is ${project.status || "ready"}.`,
      { project: { ...project, previewUrl: browserUrl(projectId) } },
      [projectLink(projectId, "Open deck workspace", { checkpoint: project.workflow?.stage })],
    );
  },
);

register(
  "get_speaker_notes",
  {
    title: "Get deck speaker notes",
    description: "Read presenter-only notes for every slide or one slide. Notes stay off-canvas, appear in presenter mode, and export into PowerPoint.",
    inputSchema: {
      projectId: z.string(),
      index: z.number().int().min(1).optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ projectId, index }) => {
    const query = index ? `?index=${index}` : "";
    const data = await apiJson(`/api/projects/${encodeURIComponent(projectId)}/speaker-notes${query}`);
    const authored = (data.notes || []).filter((item) => item.note?.trim()).length;
    return ok(
      authored
        ? `Loaded ${authored}/${data.notes?.length || 0} authored speaker note${authored === 1 ? "" : "s"}.`
        : "This selection has no speaker notes yet.",
      { ...data, previewUrl: browserUrl(projectId) },
      [projectLink(projectId, "Open speaker notes in the deck", { slideIndex: index, panel: "speaker-notes" })],
    );
  },
);

register(
  "update_speaker_notes",
  {
    title: "Update deck speaker notes",
    description: "Write, replace, or clear presenter notes without redrawing the slide. Set one index + note or send several indexed notes.",
    inputSchema: {
      projectId: z.string(),
      index: z.number().int().min(1).optional(),
      note: z.string().max(20_000).optional(),
      notes: z.array(z.object({
        index: z.number().int().min(1),
        note: z.string().max(20_000),
      })).max(100).optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  },
  async ({ projectId, index, note, notes }, extra) => {
    if (!(index && typeof note === "string") && !notes?.length) {
      throw new Error("Provide index + note or a non-empty notes array.");
    }
    const data = await apiJson(`/api/projects/${encodeURIComponent(projectId)}/speaker-notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, note, notes }),
      signal: extra.signal,
    });
    return ok(
      `Saved speaker notes for ${notes?.length || 1} slide${(notes?.length || 1) === 1 ? "" : "s"}.`,
      { ...data, previewUrl: browserUrl(projectId) },
      [projectLink(projectId, "Inspect speaker notes", { slideIndex: index, panel: "speaker-notes" })],
    );
  },
);

register(
  "generate_speaker_notes",
  {
    title: "Generate deck speaker notes",
    description: "Ask the project's selected agent to generate a natural talk track for one slide or every slide, preserving existing notes by default.",
    inputSchema: {
      projectId: z.string(),
      index: z.number().int().min(1).optional().describe("Omit to generate all missing notes."),
      overwrite: z.boolean().optional().describe("Replace existing notes. Defaults to false."),
      instruction: z.string().max(2_000).optional().describe("Optional tone, audience, or timing direction."),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  },
  async ({ projectId, index, overwrite = false, instruction }, extra) => {
    const data = await postJson(`/api/projects/${encodeURIComponent(projectId)}/speaker-notes`, {
      index,
      overwrite,
      instruction,
    }, extra.signal);
    const count = data.generated?.length || 0;
    return ok(
      count
        ? `Generated speaker notes for slide${count === 1 ? "" : "s"} ${data.generated.join(", ")}.`
        : "No notes were generated because the requested slides already have notes. Use overwrite:true to replace them.",
      { ...data, previewUrl: browserUrl(projectId) },
      [projectLink(projectId, "Review generated speaker notes", { slideIndex: index, panel: "speaker-notes" })],
    );
  },
);

register(
  "list_templates",
  {
    title: "Search Codex Slides visual styles",
    description: "List curated deck templates and attributed community styles for create_deck, inspiration ranking, or restyle_deck.",
    inputSchema: {
      categoryId: z.string().optional(),
      communityGroup: z.string().optional(),
      query: z.string().optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ categoryId, communityGroup, query }) => {
    const data = await apiJson("/api/templates");
    const needle = String(query || "").trim().toLowerCase();
    const matches = (item) => !needle || [item.name, item.description, item.categoryId, item.group, ...(item.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(needle);
    const templates = (categoryId
      ? (data.templates || []).filter((template) => template.categoryId === categoryId)
      : data.templates || []).filter(matches);
    const communityStyles = (data.communityStyles || [])
      .filter((style) => !communityGroup || style.group === communityGroup)
      .filter(matches);
    const lines = [
      templates.length ? "Curated deck templates:" : "",
      ...templates.map((template) => `- ${template.id} — ${template.name}: ${template.description}`),
      communityStyles.length ? "Community visual directions:" : "",
      ...communityStyles.map((style) => `- ${style.id} — ${style.name} [${style.group}]: ${style.description}`),
    ].filter(Boolean);
    return ok(
      lines.join("\n") || "No visual styles matched the requested filters.",
      {
        categories: data.categories,
        templates,
        communityGroups: data.communityGroups || [],
        communityStyles,
        communitySources: data.communitySources || [],
      },
    );
  },
);

register(
  "list_project_templates",
  {
    title: "List reusable Codex Slides project templates",
    description: "List visual systems saved from existing projects. Pass one returned id as projectTemplateId when starting or creating another deck.",
    inputSchema: {},
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async () => {
    const data = await apiJson("/api/templates");
    const templates = data.projectTemplates || [];
    return ok(
      templates.map((template) => `- ${template.id} — ${template.name} (${template.referenceCount} visual references)`).join("\n") || "No reusable project templates yet.",
      { projectTemplates: templates, browserUrl: BASE },
      [homeLink(BASE, "Open project template library", { panel: "project-templates" })],
    );
  },
);

register(
  "save_project_as_template",
  {
    title: "Save a project as a reusable template",
    description: "Snapshot a project's brand system, base style, aspect, brand assets, and up to six rendered slides as visual references without copying its content.",
    inputSchema: {
      projectId: z.string(),
      name: z.string().max(100).optional(),
      description: z.string().max(500).optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  },
  async ({ projectId, name, description }, extra) => {
    const data = await postJson("/api/templates", { projectId, name, description }, extra.signal);
    return ok(
      `Saved project template “${data.template?.name || name || projectId}”.`,
      { template: data.template, previewUrl: browserUrl(projectId) },
      [projectLink(projectId, "Return to source project")],
    );
  },
);

register(
  "delete_project_template",
  {
    title: "Delete a reusable project template",
    description: "Delete one saved project template. Existing projects created from it keep their copied brand rules and references.",
    inputSchema: { templateId: z.string() },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  },
  async ({ templateId }, extra) => {
    await apiJson(`/api/templates/${encodeURIComponent(templateId)}`, {
      method: "DELETE",
      signal: extra.signal,
    });
    return ok(`Deleted project template ${templateId}.`, { templateId, deleted: true });
  },
);

register(
  "list_scenarios",
  {
    title: "List Codex Slides scenarios",
    description: "Discover the product-owned presentation workflow catalog, defaults, and required or optional source-file slots before creating a deck.",
    inputSchema: {
      group: z.enum(["create", "transform", "data", "research", "optimize", "delivery"]).optional(),
      query: z.string().optional(),
      featured: z.boolean().optional(),
      locale: z.enum(["zh-CN", "zh-TW", "en", "ja"]).optional(),
      scenarioId: z.string().optional().describe("Preselect this scenario in the returned Browser link."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ group, query = "", featured = false, locale = "en", scenarioId }) => {
    const data = await apiJson("/api/scenarios");
    const normalized = query.trim().toLocaleLowerCase();
    const featuredIds = new Set(data.featuredIds || []);
    const scenarios = (data.scenarios || []).filter((scenario) => {
      if (group && scenario.group !== group) return false;
      if (featured && !featuredIds.has(scenario.id)) return false;
      return !normalized || JSON.stringify(scenario).toLocaleLowerCase().includes(normalized);
    });
    const label = (value) => value?.[locale] || value?.en || "";
    const uri = browserUrl(undefined, { view: "scenarios", scenarioId });
    return ok(
      scenarios.map((scenario) => `- ${scenario.id} — ${label(scenario.name)}: ${label(scenario.description)}`).join("\n") || "No scenarios matched.",
      { groups: data.groups, scenarios, featuredIds: data.featuredIds, browserUrl: uri },
      [homeLink(uri, "Open scenario catalog", { view: "scenarios", scenarioId })],
    );
  },
);

register(
  "list_design_files",
  {
    title: "List project Design Files",
    description: "List generated and uploaded project files, including editability, kind, size, and update time.",
    inputSchema: {
      projectId: z.string(),
      filePath: z.string().optional().describe("Optionally focus this file in the Browser link."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ projectId, filePath }) => {
    const data = await apiJson(projectFileApiPath(projectId));
    const files = (data.files || []).map((file) => ({
      ...file,
      downloadUrl: `${BASE}${projectFileApiPath(projectId, file.path)}?download=1`,
    }));
    const uri = browserUrl(projectId, { view: "design-files", filePath });
    return ok(
      files.map((file) => `- ${file.path} — ${file.kind}, ${file.size} bytes${file.editable ? ", editable" : ""}`).join("\n") || "This project has no Design Files yet.",
      { projectId, files, browserUrl: uri },
      [projectLink(projectId, "Open Design Files", { view: "design-files", filePath })],
    );
  },
);

register(
  "read_design_file",
  {
    title: "Read a project Design File",
    description: "Read an editable text Design File. Binary files return metadata and a Browser deep link for visual inspection.",
    inputSchema: { projectId: z.string(), filePath: z.string().min(1) },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ projectId, filePath }) => {
    const listing = await apiJson(projectFileApiPath(projectId));
    const found = (listing.files || []).find((item) => item.path === filePath);
    if (!found) throw new Error(`Design File not found: ${filePath}`);
    const file = {
      ...found,
      downloadUrl: `${BASE}${projectFileApiPath(projectId, found.path)}?download=1`,
    };
    const link = projectLink(projectId, `Open ${file.name}`, { view: "design-files", filePath });
    if (!file.editable) {
      return ok(`${file.path} is a ${file.kind} file. Open it in the Codex Browser to inspect it visually.`, {
        projectId, file, content: null, browserUrl: link.uri,
      }, [link]);
    }
    const response = await apiFetch(projectFileApiPath(projectId, filePath));
    if (!response.ok) throw new Error((await response.text().catch(() => "")) || `HTTP ${response.status}`);
    const content = await response.text();
    return ok(content, { projectId, file, content, browserUrl: link.uri }, [link]);
  },
);

register(
  "write_design_file",
  {
    title: "Write a project Design File",
    description: "Replace the content of an existing editable text Design File, matching the Browser workspace's Save action.",
    inputSchema: {
      projectId: z.string(),
      filePath: z.string().min(1),
      content: z.string().describe("Complete replacement content, up to 2 MB."),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  },
  async ({ projectId, filePath, content }, extra) => {
    await apiJson(projectFileApiPath(projectId, filePath), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
      signal: extra.signal,
    });
    const link = projectLink(projectId, `Inspect ${filePath}`, { view: "design-files", filePath });
    return ok(`Saved ${filePath} (${Buffer.byteLength(content)} bytes).`, {
      projectId, filePath, bytes: Buffer.byteLength(content), browserUrl: link.uri,
    }, [link]);
  },
);

register(
  "upload_design_file",
  {
    title: "Upload a project Design File",
    description: "Copy a local file into a project's uploaded Design Files area so it is visible to both Codex and the Browser workspace.",
    inputSchema: { projectId: z.string(), filePath: z.string().describe("Absolute or workspace-relative local file path") },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  },
  async ({ projectId, filePath }, extra) => {
    const { form, absolute } = await fileForm(filePath, "files", 20 * 1024 * 1024);
    const response = await apiFetch(projectFileApiPath(projectId), { method: "POST", body: form, signal: extra.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    const uploaded = (data.files || []).find((file) => file.source === "uploaded" && file.name === basename(absolute));
    const link = projectLink(projectId, `Open ${basename(absolute)}`, { view: "design-files", filePath: uploaded?.path });
    return ok(`Uploaded ${basename(absolute)} to project Design Files.`, {
      projectId, file: uploaded || null, files: data.files || [], sourcePath: absolute, browserUrl: link.uri,
    }, [link]);
  },
);

register(
  "get_brand_design_system",
  {
    title: "Get a deck brand design system",
    description: "Read the normalized always-on brand, style, color, typography, effects, spacing, radius, and asset rules for a project.",
    inputSchema: { projectId: z.string() },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ projectId }) => {
    const data = await apiJson(`/api/projects/${encodeURIComponent(projectId)}/design-system`);
    const link = projectLink(projectId, "Open brand design system", { view: "brand-system" });
    return ok(
      data.enabled ? "Loaded the project's active brand design system." : "This project has no active brand system; returning its normalized editable seed.",
      { projectId, ...data, browserUrl: link.uri },
      [link],
    );
  },
);

register(
  "update_brand_design_system",
  {
    title: "Update a deck brand design system",
    description: "Merge partial brand and visual rules, attach staged brand assets, optionally apply a template, and optionally redraw every existing slide.",
    inputSchema: {
      projectId: z.string(),
      designSystem: designSystemShape.optional().describe("Partial system patch; untouched sections are preserved."),
      template: z.string().optional(),
      style: z.string().optional(),
      materialIds: z.array(z.string()).optional().describe("Staged ids from upload_material; this brand-specific tool adds them as brand assets."),
      brandAssetMaterialIds: z.array(z.string()).optional().describe("Explicit final set of project material ids used as brand assets."),
      clear: z.boolean().optional().describe("Disable the always-on brand system."),
      redraw: z.boolean().optional().describe("Redraw all slides after saving. Defaults to false."),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  },
  async ({ projectId, designSystem, template, style, materialIds = [], brandAssetMaterialIds, clear = false, redraw = false }, extra) => {
    if (!clear && !designSystem && !template && !style && !materialIds.length && brandAssetMaterialIds === undefined) {
      throw new Error("Provide designSystem, template, style, materialIds, brandAssetMaterialIds, or clear:true.");
    }
    const versionGroupId = globalThis.crypto.randomUUID();
    const versionPrompt = style || designSystem?.style?.direction || "Update the brand design system";
    const data = await apiJson(`/api/projects/${encodeURIComponent(projectId)}/design-system`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        designSystem,
        template,
        style,
        materialIds,
        brandAssetMaterialIds,
        clear,
        versionPrompt,
        versionGroupId,
      }),
      signal: extra.signal,
    });
    const changed = [];
    if (redraw && !clear) {
      for (const page of data.project?.pages || []) {
        try {
          const generated = await postJson(`/api/projects/${encodeURIComponent(projectId)}/regenerate`, {
            index: page.index,
            versionPrompt,
            versionGroupId,
          }, extra.signal);
          changed.push(slideSummary(generated.page));
        } catch (error) {
          changed.push({ index: page.index, status: "error", error: error instanceof Error ? error.message : String(error) });
        }
      }
    }
    const { project: _project, ...systemData } = data;
    const link = projectLink(projectId, "Inspect brand design system", { view: "brand-system" });
    return ok(
      clear
        ? "Disabled the always-on brand design system."
        : redraw
          ? `Saved the brand design system and redrew ${changed.filter((page) => page.status !== "error").length}/${data.project?.pages?.length || 0} slides.`
          : "Saved the brand design system for future generation and edits without redrawing existing slides.",
      { projectId, ...systemData, changed, browserUrl: link.uri },
      [link],
    );
  },
);

register(
  "edit_deck",
  {
    title: "Edit a deck with natural language",
    description: "Plan and execute the same add/rewrite/redraw/optimize flow as the Deck Agent chat, including multi-slide edits.",
    inputSchema: {
      projectId: z.string(),
      instruction: z.string().min(1),
      slideIndex: z.number().int().min(1).optional(),
      materialIds: z.array(z.string()).optional(),
      designFilePaths: z.array(z.string()).max(12).optional()
        .describe("Project Design File paths from list_design_files to attach to this edit turn."),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  },
  async ({ projectId, instruction, slideIndex, materialIds = [], designFilePaths = [] }, extra) => {
    const project = await apiJson(`/api/projects/${encodeURIComponent(projectId)}`);
    const contextPage = slideIndex ? project.pages?.find((page) => page.index === slideIndex) : undefined;
    const { plan } = await postJson(`/api/projects/${encodeURIComponent(projectId)}/chat`, {
      message: instruction,
      context: contextPage ? { slideIndex, title: contextPage.title } : undefined,
      attachmentIds: materialIds,
      designFilePaths,
    }, extra.signal);
    const changed = [];
    const versionGroupId = globalThis.crypto.randomUUID();
    if (plan.action === "add") {
      const afterIndex = Number.isInteger(plan.afterIndex) ? plan.afterIndex : project.pages.length;
      const added = await postJson(`/api/projects/${encodeURIComponent(projectId)}/slides`, {
        action: "add",
        afterIndex,
        title: plan.title,
        versionPrompt: instruction,
        versionGroupId,
      }, extra.signal);
      const index = Math.min(Math.max(afterIndex + 1, 1), added.pages.length);
      const generated = await postJson(`/api/projects/${encodeURIComponent(projectId)}/regenerate`, {
        index,
        instruction: plan.instruction || instruction,
        title: plan.title,
        versionPrompt: instruction,
        versionGroupId,
      }, extra.signal);
      changed.push(slideSummary(generated.page));
    } else if (plan.action === "edit") {
      for (const index of plan.targets || []) {
        const generated = await postJson(`/api/projects/${encodeURIComponent(projectId)}/regenerate`, {
          index,
          instruction: plan.instruction || instruction,
          title: plan.targets?.length === 1 ? plan.title : undefined,
          versionPrompt: instruction,
          versionGroupId,
        }, extra.signal);
        changed.push(slideSummary(generated.page));
      }
    }
    return ok(
      `${plan.reply || "Deck request complete."}${changed.length ? ` Changed slide${changed.length === 1 ? "" : "s"} ${changed.map((page) => page.index).join(", ")}.` : ""}`,
      { projectId, plan, changed, previewUrl: browserUrl(projectId) },
      [projectLink(projectId, "Inspect edited deck", { slideIndex: changed[0]?.index })],
    );
  },
);

register(
  "restyle_deck",
  {
    title: "Restyle a whole deck",
    description: "Apply a template, free-text style, and reference materials; optionally redraw every slide.",
    inputSchema: {
      projectId: z.string(),
      template: z.string().optional(),
      style: z.string().optional(),
      materialIds: z.array(z.string()).optional(),
      redraw: z.boolean().optional().describe("Defaults to true"),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  },
  async ({ projectId, template, style, materialIds = [], redraw = true }, extra) => {
    const versionGroupId = globalThis.crypto.randomUUID();
    const versionPrompt = style || `Apply template ${template || "default"}`;
    const updated = await apiJson(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template, style, materialIds, versionPrompt, versionGroupId }),
      signal: extra.signal,
    });
    const changed = [];
    if (redraw) {
      for (const page of updated.pages || []) {
        try {
          const generated = await postJson(`/api/projects/${encodeURIComponent(projectId)}/regenerate`, {
            index: page.index,
            versionPrompt,
            versionGroupId,
          }, extra.signal);
          changed.push(slideSummary(generated.page));
        } catch (error) {
          changed.push({ index: page.index, status: "error", error: error instanceof Error ? error.message : String(error) });
        }
      }
    }
    return ok(
      redraw ? `Restyled ${changed.filter((page) => page.status !== "error").length}/${updated.pages?.length || 0} slides.` : "Saved the new deck style without redrawing yet.",
      { projectId, template: updated.config?.template, style: updated.config?.style, changed, previewUrl: browserUrl(projectId) },
      [projectLink(projectId, "Inspect restyled deck", { slideIndex: changed[0]?.index })],
    );
  },
);

register(
  "manage_slide",
  {
    title: "Manage deck slide structure",
    description: "Add, duplicate, delete, move, or set the transition of a slide.",
    inputSchema: {
      projectId: z.string(),
      action: z.enum(["add", "duplicate", "delete", "move", "transition"]),
      index: z.number().int().min(1).optional(),
      toIndex: z.number().int().min(1).optional(),
      afterIndex: z.number().int().min(0).optional(),
      transition: z.enum(["none", "fade", "push", "wipe", "zoom", "flip"]).optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  },
  async ({ projectId, action, index, toIndex, afterIndex, transition }, extra) => {
    if (["duplicate", "delete", "move", "transition"].includes(action) && !index) throw new Error(`${action} requires index.`);
    if (action === "move" && !toIndex) throw new Error("move action requires toIndex.");
    if (action === "transition" && !transition) throw new Error("transition action requires transition.");
    const path = `/api/projects/${encodeURIComponent(projectId)}/slides`;
    const data = action === "delete"
      ? await apiJson(path, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index }),
          signal: extra.signal,
        })
      : await postJson(path, { action, index, toIndex, afterIndex, transition }, extra.signal);
    return ok(
      `${action} complete. The deck now has ${data.pages?.length || 0} slides.`,
      { projectId, action, pages: (data.pages || []).map(slideSummary) },
      [projectLink(projectId, "Inspect slide structure", {
        slideIndex: action === "move" ? toIndex : action === "add" ? Math.max(1, (afterIndex ?? data.pages?.length ?? 1) + 1) : index,
      })],
    );
  },
);

register(
  "regenerate_slide",
  {
    title: "Generate or regenerate one slide",
    description: "Draw a blank slide or redraw an existing slide with an optional instruction.",
    inputSchema: {
      projectId: z.string(),
      index: z.number().int().min(1),
      instruction: z.string().optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  },
  async ({ projectId, index, instruction }, extra) => {
    const data = await postJson(`/api/projects/${encodeURIComponent(projectId)}/regenerate`, { index, instruction }, extra.signal);
    return ok(
      `Slide ${index} is rendered.`,
      { projectId, page: slideSummary(data.page), previewUrl: browserUrl(projectId) },
      [projectLink(projectId, `Inspect slide ${index}`, { slideIndex: index })],
    );
  },
);

register(
  "upload_material",
  {
    title: "Upload a deck reference",
    description: "Stage a supported local image, document, deck, spreadsheet, data, text, or code file for scenario slots, creation, editing, restyling, or brand assets.",
    inputSchema: { filePath: z.string().describe("Absolute or workspace-relative local file path") },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  },
  async ({ filePath }, extra) => {
    const { form, absolute } = await fileForm(filePath, "file", 20 * 1024 * 1024);
    const response = await apiFetch("/api/materials", { method: "POST", body: form, signal: extra.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return ok(`Uploaded ${basename(absolute)} as material ${data.id}.`, { material: data, filePath: absolute });
  },
);

register(
  "upload_slide_image",
  {
    title: "Replace a slide with a local PNG",
    description: "Upload a normalized PNG as the visual for one slide. Use the Browser UI for JPG/WebP normalization.",
    inputSchema: {
      projectId: z.string(),
      index: z.number().int().min(1),
      imagePath: z.string(),
      title: z.string().optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  },
  async ({ projectId, index, imagePath, title }, extra) => {
    const { form, absolute, bytes } = await fileForm(imagePath, "image");
    if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("upload_slide_image requires a valid PNG.");
    form.set("image", new Blob([bytes], { type: "image/png" }), basename(absolute));
    if (title) form.append("title", title);
    const response = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}/slides/${index}/image`, {
      method: "POST",
      body: form,
      signal: extra.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return ok(`Replaced slide ${index} with ${basename(absolute)}.`, { projectId, page: slideSummary(data.page) }, [projectLink(projectId, `Inspect slide ${index}`, { slideIndex: index })]);
  },
);

register(
  "mark_edit_slide",
  {
    title: "Edit a slide from an annotated PNG",
    description: "Cowart-style visual editing: persist an annotated slide screenshot, read its marks and note, and generate a clean revised slide.",
    inputSchema: {
      projectId: z.string(),
      index: z.number().int().min(1),
      annotatedImagePath: z.string(),
      note: z.string().optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  },
  async ({ projectId, index, annotatedImagePath, note = "" }, extra) => {
    const { form, absolute, bytes } = await fileForm(annotatedImagePath, "image");
    if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("mark_edit_slide requires a valid annotated PNG.");
    form.set("image", new Blob([bytes], { type: "image/png" }), basename(absolute));
    form.append("index", String(index));
    const sourceResponse = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}/mark/source`, {
      method: "POST",
      body: form,
      signal: extra.signal,
    });
    const sourceData = await sourceResponse.json().catch(() => ({}));
    if (!sourceResponse.ok) throw new Error(sourceData.error || `HTTP ${sourceResponse.status}`);
    const editForm = new FormData();
    editForm.append("index", String(index));
    editForm.append("source", sourceData.image);
    editForm.append("note", note);
    const editResponse = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}/mark`, {
      method: "POST",
      body: editForm,
      signal: extra.signal,
    });
    const editData = await editResponse.json().catch(() => ({}));
    if (!editResponse.ok) throw new Error(editData.error || `HTTP ${editResponse.status}`);
    return ok(
      `Applied the annotations to slide ${index}; the marked source remains saved as ${sourceData.image}.`,
      { projectId, markedSource: sourceData.image, page: slideSummary(editData.page), previewUrl: browserUrl(projectId) },
      [projectLink(projectId, `Inspect edited slide ${index}`, { slideIndex: index })],
    );
  },
);

register(
  "export_deck",
  {
    title: "Export a Codex Slides deck",
    description: "Return a downloadable PDF or PPTX resource link for a rendered deck.",
    inputSchema: {
      projectId: z.string(),
      format: z.enum(["pdf", "pptx"]).optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ projectId, format = "pdf" }) => {
    await apiJson(`/api/projects/${encodeURIComponent(projectId)}`);
    const uri = `${BASE}/api/projects/${encodeURIComponent(projectId)}/export?format=${format}`;
    return ok(
      `${format.toUpperCase()} export is ready: ${uri}`,
      { projectId, format, downloadUrl: uri },
      [
        projectLink(projectId, "Review deck export", { panel: "export" }),
        { uri, name: `Download ${format.toUpperCase()}`, description: `Exported ${format.toUpperCase()} presentation.` },
      ],
    );
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
