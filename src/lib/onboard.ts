// Gen-UI onboarding (M2, open-design style): after the user types a topic, Codex
// generates a small set of tailored clarifying questions. The home page renders
// them as a dynamic form; answers seed the PptConfig and augment the requirement.

import { codexJson, type CodexInputAttachment } from "./codex-text";
import { CATEGORIES } from "./templates";
import type { UiLocale } from "@/i18n/messages";
import { scenarioPromptContext } from "./scenarios";
import { completeJsonArrayObjects } from "./streamingJson";
import { ensureRequiredOnboardQuestions, specificationField } from "./questionSemantics";

export type QuestionType = "single" | "multi" | "text" | "number";
export type ConfigField = "pages" | "aspect" | "resolution" | "language" | "style" | "category" | null;

export interface QuestionOption {
  value: string;
  label: string;
}
export interface QuestionSpec {
  id: string;
  question: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  recommended?: string; // recommended option value / default
  field?: ConfigField; // maps to a config field, or null = content preference
}

export function buildOnboardPrompt(
  requirement: string,
  uiLocale: UiLocale = "zh-CN",
  scenarioId?: string,
  attachmentNames: string[] = [],
): string {
  const cats = CATEGORIES.map((c) => `${c.id} (${c.labelEn})`).join(", ");
  const responseLanguage = uiLocale === "zh-CN"
    ? "Simplified Chinese"
    : uiLocale === "zh-TW"
      ? "Traditional Chinese (Taiwan)"
      : uiLocale === "ja"
        ? "Japanese"
        : "English";
  return [
    "You are an onboarding assistant for an AI slide-deck generator.",
    "Given the user's topic, produce 6-7 SHORT clarifying questions that will make the deck much better.",
    scenarioPromptContext(scenarioId),
    "",
    "Return ONLY a JSON array of question objects with this shape:",
    `{"id": "kebab-id", "question": "...", "type": "single|multi|text|number", "options": [{"value":"...","label":"..."}], "recommended": "optionValue", "field": "pages|aspect|resolution|language|style|category|null"}`,
    "",
    "Rules:",
    `- Write every visible question, option label, and placeholder in ${responseLanguage}. Keep option values language-neutral.`,
    "- ALWAYS include: a page-count question (field:\"pages\", type:\"number\", recommended a sensible number);",
    "  an aspect question (field:\"aspect\", type:\"single\", option values 16:9,4:3,1:1,9:16, recommended \"16:9\");",
    "  a resolution question (field:\"resolution\", type:\"single\", option values 1K,2K,4K, recommended \"2K\");",
    "  a language question (field:\"language\", type:\"single\", options auto,zh,en,ja, recommended \"auto\");",
    "  a visual-style question (field:\"style\", type:\"single\", 3-4 style options TAILORED to the topic, each label a vivid short phrase, value = a concise style descriptor).",
    `- Include ONE category question (field:\"category\", type:\"single\") choosing among: ${cats}. Pick the 3-4 most relevant as options, recommended the best fit.`,
    "- For aspect and resolution options, every visible label MUST start with the exact technical value, for example `16:9 · Widescreen` and `2K · High quality`. Never use only a vague label such as `Widescreen` or `High quality`.",
    "- Add ONE topic-specific CONTENT question (field:null) that clarifies audience, goal, or emphasis; type single or text.",
    "- Adapt the content questions to the selected presentation scenario. Ask only what improves that workflow and do not ask the user to repeat information already present in the scenario or attached-source request.",
    attachmentNames.length
      ? `- Read the attached Design Files before asking questions. They are: ${attachmentNames.join(", ")}. Do not ask for facts already present in them.`
      : "",
    "- Keep questions crisp. Options must be mutually exclusive. Every single-type question needs a recommended value.",
    "",
    "User topic:",
    requirement,
    "",
    "Output ONLY the JSON array.",
  ].join("\n");
}

function coerceType(t: any): QuestionType {
  return t === "multi" || t === "text" || t === "number" ? t : "single";
}

export function normalizeQuestions(raw: any): QuestionSpec[] {
  const arr = Array.isArray(raw) ? raw : raw?.questions ?? [];
  const out: QuestionSpec[] = [];
  for (const q of arr as any[]) {
    if (!q?.question) continue;
    const type = coerceType(q.type);
    const options: QuestionOption[] | undefined = Array.isArray(q.options)
      ? q.options
          .map((o: any) =>
            typeof o === "string"
              ? { value: o, label: o }
              : { value: String(o?.value ?? o?.label ?? ""), label: String(o?.label ?? o?.value ?? "") },
          )
          .filter((o: QuestionOption) => o.value)
      : undefined;
    const fieldRaw = q.field;
    let field: ConfigField =
      fieldRaw === "pages" || fieldRaw === "aspect" || fieldRaw === "resolution" || fieldRaw === "language" ||
      fieldRaw === "style" || fieldRaw === "category"
        ? fieldRaw
        : null;
    if (field === null) {
      const inferred = specificationField({ question: String(q.question), options });
      if (inferred) field = inferred;
    }
    out.push({
      id: String(q.id ?? `q${out.length + 1}`),
      question: String(q.question),
      type,
      options: type === "single" || type === "multi" ? options : undefined,
      placeholder: q.placeholder ? String(q.placeholder) : undefined,
      recommended: q.recommended != null ? String(q.recommended) : undefined,
      field,
    });
  }
  return out.slice(0, 7);
}

export async function generateOnboardQuestions(
  requirement: string,
  signal?: AbortSignal,
  uiLocale: UiLocale = "zh-CN",
  scenarioId?: string,
  onQuestion?: (question: QuestionSpec, index: number) => void,
  attachments: CodexInputAttachment[] = [],
): Promise<QuestionSpec[]> {
  let emitted = 0;
  const emitNewQuestions = (text: string) => {
    const partial = normalizeQuestions(completeJsonArrayObjects(text));
    while (emitted < partial.length) {
      onQuestion?.(partial[emitted], emitted);
      emitted += 1;
    }
  };
  const raw = await codexJson<any>(buildOnboardPrompt(
    requirement,
    uiLocale,
    scenarioId,
    attachments.map((attachment) => attachment.name),
  ), {
    signal,
    onText: emitNewQuestions,
    attachments,
  });
  const questions = ensureRequiredOnboardQuestions(normalizeQuestions(raw), uiLocale);
  while (emitted < questions.length) {
    onQuestion?.(questions[emitted], emitted);
    emitted += 1;
  }
  return questions;
}
