export const DEFAULT_CODEX_RESPONSES_MODEL = "gpt-6-luna";

export function getCodexResponsesModel(
  env: Record<string, string | undefined> = process.env,
): string {
  return env.CODEX_SLIDES_CODEX_MODEL?.trim() || DEFAULT_CODEX_RESPONSES_MODEL;
}
