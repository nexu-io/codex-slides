export type SpecificationQuestionField = "aspect" | "resolution";

export interface SemanticQuestionOption {
  value: string;
  label: string;
}

export interface SemanticQuestionLike {
  question?: string;
  field?: string | null;
  options?: SemanticQuestionOption[];
}

export interface SemanticOnboardQuestion extends SemanticQuestionLike {
  id: string;
  question: string;
  type: "single" | "multi" | "text" | "number";
  options?: SemanticQuestionOption[];
  placeholder?: string;
  recommended?: string;
  field?: string | null;
}

const ASPECT_VALUES = new Set(["16:9", "4:3", "1:1", "9:16", "3:4"]);
const RESOLUTION_VALUES = new Set(["1K", "2K", "4K"]);

function normalizedResolution(value: string) {
  const normalized = value.trim().toUpperCase();
  return RESOLUTION_VALUES.has(normalized) ? normalized : null;
}

function normalizedAspect(value: string) {
  const normalized = value.trim().replace(/\s+/g, "");
  return ASPECT_VALUES.has(normalized) ? normalized : null;
}

/**
 * Recover the semantic field even when an older/model-generated question did
 * not persist it correctly. Values are stronger evidence than translated copy.
 */
export function specificationField(question: SemanticQuestionLike): SpecificationQuestionField | null {
  if (question.field === "aspect" || question.field === "resolution") return question.field;
  const values = (question.options ?? []).map((option) => option.value);
  if (values.length >= 2 && values.every((value) => normalizedAspect(value))) return "aspect";
  if (values.length >= 2 && values.every((value) => normalizedResolution(value))) return "resolution";
  const copy = question.question ?? "";
  if (/\b(?:aspect|ratio)\b|比例|画幅|縦横比|アスペクト/i.test(copy)) return "aspect";
  if (/\b(?:resolution|quality)\b|清晰度|分辨率|画质|品質|解像度/i.test(copy)) return "resolution";
  return null;
}

/** Put the machine-meaningful value first: `16:9 · 宽屏`, `2K · 高清`. */
export function semanticOptionLabel(
  question: SemanticQuestionLike,
  option: SemanticQuestionOption,
): string {
  const field = specificationField(question);
  const token = field === "aspect"
    ? normalizedAspect(option.value)
    : field === "resolution"
      ? normalizedResolution(option.value)
      : null;
  if (!token) return option.label;

  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const descriptor = option.label
    .replace(new RegExp(escaped, "ig"), "")
    .replace(/^[\s·|/—–-]+|[\s·|/—–-]+$/g, "")
    .trim();
  return descriptor ? `${token} · ${descriptor}` : token;
}

export type QuestionCopyLocale = "zh-CN" | "zh-TW" | "en" | "ja";

/** Deterministic fallback when a model omits the required output-quality question. */
export function resolutionQuestionCopy(locale: QuestionCopyLocale) {
  if (locale === "en") {
    return {
      question: "Which output resolution do you need?",
      labels: ["Standard", "High quality", "Ultra-high quality"],
    };
  }
  if (locale === "ja") {
    return {
      question: "出力解像度はどれにしますか？",
      labels: ["標準", "高画質", "超高画質"],
    };
  }
  if (locale === "zh-TW") {
    return {
      question: "輸出清晰度要選哪一檔？",
      labels: ["標準品質", "高畫質", "超高畫質"],
    };
  }
  return {
    question: "输出清晰度选择哪档？",
    labels: ["标准质量", "高清质量", "超高清质量"],
  };
}

/** The model is steerable, not authoritative: required render quality must not disappear. */
export function ensureRequiredOnboardQuestions<T extends SemanticOnboardQuestion>(
  questions: T[],
  locale: QuestionCopyLocale = "zh-CN",
): T[] {
  if (questions.some((question) => specificationField(question) === "resolution")) {
    return questions.slice(0, 7);
  }
  const copy = resolutionQuestionCopy(locale);
  const fallback: SemanticOnboardQuestion = {
    id: "output-resolution",
    question: copy.question,
    type: "single",
    options: (["1K", "2K", "4K"] as const).map((value, index) => ({
      value,
      label: `${value} · ${copy.labels[index]}`,
    })),
    recommended: "2K",
    field: "resolution",
  };
  const next: SemanticOnboardQuestion[] = [...questions];
  const aspectIndex = next.findIndex((question) => specificationField(question) === "aspect");
  next.splice(aspectIndex >= 0 ? aspectIndex + 1 : Math.min(2, next.length), 0, fallback);
  return next.slice(0, 7) as T[];
}
