import { en } from "./locales/en";
import { ja } from "./locales/ja";
import { zhCN } from "./locales/zh-CN";
import { zhTW } from "./locales/zh-TW";
import { LOCALES, type Dict, type Locale, type MessageKey, type MessageValues, type UiLocale } from "./types";

export { LOCALES, LOCALE_LABEL, RTL_LOCALES } from "./types";
export type { Dict, Locale, MessageKey, MessageValues, UiLocale } from "./types";

export const DEFAULT_UI_LOCALE: UiLocale = "zh-CN";
export const UI_LOCALE_STORAGE_KEY = "codex-slides-ui-locale";

/** Locale registry. New dictionaries are added here and nowhere in UI components. */
export const DICTS: Record<Locale, Dict> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  ja,
};

export function isUiLocale(value: unknown): value is UiLocale {
  return typeof value === "string" && (LOCALES as string[]).includes(value);
}

export function translate(locale: UiLocale, key: MessageKey, values: MessageValues = {}): string {
  const dictionary = DICTS[locale] ?? en;
  const template = dictionary[key] ?? en[key] ?? key;
  return template.replace(/\{\{?(\w+)\}?\}/g, (token, name) => {
    const value = values[name];
    return value == null ? token : String(value);
  });
}
