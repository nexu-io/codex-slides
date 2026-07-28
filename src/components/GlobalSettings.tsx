"use client";

import { CaretRight, Check, GearSix, Terminal, Translate, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useCodexSetup } from "@/components/CodexSetupProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES, LOCALE_LABEL } from "@/i18n/messages";

export default function GlobalSettings() {
  const { locale, setLocale, t } = useI18n();
  const { openSetup } = useCodexSetup();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="global-settings" ref={rootRef}>
      <button
        type="button"
        className={`global-settings-trigger${open ? " active" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label={t("settings.open")}
        aria-expanded={open}
        aria-controls="global-settings-popover"
        title={t("settings.title")}
      >
        <GearSix size={16} weight={open ? "fill" : "regular"} />
      </button>
      {open && (
        <div id="global-settings-popover" className="global-settings-popover" role="dialog" aria-label={t("settings.title")}>
          <div className="global-settings-head">
            <div>
              <strong>{t("settings.title")}</strong>
              <span>{t("settings.language")}</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t("settings.close")}>
              <X size={16} />
            </button>
          </div>
          <button
            type="button"
            className="global-settings-codex"
            onClick={() => {
              setOpen(false);
              openSetup();
            }}
          >
            <span className="global-settings-codex-icon" aria-hidden="true">
              <Terminal size={16} weight="bold" />
            </span>
            <span className="global-settings-codex-copy">
              <b>{t("settings.codex")}</b>
              <small>{t("settings.codexHelp")}</small>
            </span>
            <CaretRight size={15} aria-hidden="true" />
          </button>
          <div className="global-settings-copy">
            <Translate size={18} aria-hidden="true" />
            <span>{t("settings.languageHelp")}</span>
          </div>
          <div className="global-settings-options" role="radiogroup" aria-label={t("settings.language")}>
            {LOCALES.map((value) => (
              <button
                type="button"
                role="radio"
                aria-checked={locale === value}
                className={locale === value ? "selected" : ""}
                key={value}
                onClick={() => setLocale(value)}
              >
                <span>
                  <b>{value === "zh-CN" ? "简" : value === "zh-TW" ? "繁" : value === "ja" ? "日" : value.slice(0, 2).toUpperCase()}</b>
                  <span>{LOCALE_LABEL[value]}</span>
                </span>
                {locale === value && <Check size={16} weight="bold" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
