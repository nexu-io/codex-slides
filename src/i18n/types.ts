import type { Dict, MessageKey } from "./locales/en";

/** BCP-47 UI locales. Add a locale here, then register its dictionary in messages.ts. */
export type Locale = "en" | "zh-CN" | "zh-TW" | "ja";
export type UiLocale = Locale;

export const LOCALES: Locale[] = ["en", "zh-CN", "zh-TW", "ja"];
export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
};

/** Add Arabic, Persian, Hebrew, or other RTL locales here when registered. */
export const RTL_LOCALES: Locale[] = [];

export type { Dict, MessageKey };
export type MessageValues = Record<string, string | number>;
