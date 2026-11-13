"use client";

import { Children, cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import type { Locale } from "@/lib/types";
import { translate } from "@/lib/i18n";

const storageKey = "maz-language";
const tags: Record<Locale, string> = { kk: "kk-KZ", ru: "ru-RU", en: "en-US" };
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({ locale: "ru", setLocale: () => {} });

function getLocaleSnapshot(): Locale {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "kk" || saved === "ru" || saved === "en") return saved;
  } catch { /* Storage can be unavailable in restricted browser contexts. */ }
  return "ru";
}

function getServerLocaleSnapshot(): Locale {
  return "ru";
}

function subscribeToLocale(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("maz-language-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("maz-language-change", callback);
  };
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeToLocale, getLocaleSnapshot, getServerLocaleSnapshot);
  const setLocale = useCallback((nextLocale: Locale) => {
    try {
      window.localStorage.setItem(storageKey, nextLocale);
    } catch { /* Keep the choice for this session even if storage is unavailable. */ }
    window.dispatchEvent(new Event("maz-language-change"));
  }, []);
  useEffect(() => {
    document.documentElement.lang = tags[locale];
  }, [locale]);

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

const languages: { id: Locale; label: string; title: string }[] = [
  { id: "kk", label: "ҚАЗ", title: "Қазақша" },
  { id: "ru", label: "РУС", title: "Русский" },
  { id: "en", label: "ENG", title: "Английский" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  return (
    <LocalizedContent><div className="inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Язык страницы">
      {languages.map((language) => (
        <button
          key={language.id}
          type="button"
          title={language.title}
          aria-label={language.title}
          aria-pressed={locale === language.id}
          onClick={() => setLocale(language.id)}
          className={`min-h-8 min-w-10 rounded-md px-2 text-[11px] font-semibold transition-colors ${locale === language.id ? "bg-teal-800 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}
        >
          {language.label}
        </button>
      ))}
    </div></LocalizedContent>
  );
}

function localize(node: ReactNode, locale: Locale): ReactNode {
  if (typeof node === "string") return translate(locale, node);
  if (typeof node === "number" || node == null || typeof node === "boolean") return node;

  return Children.map(node, (child) => {
    if (!isValidElement<Record<string, unknown>>(child)) return child;
    const props = Object.fromEntries(Object.entries(child.props).map(([key, value]) => {
      if (key === "children") return [key, localize(value as ReactNode, locale)];
      if (typeof value === "string" && !["className", "href", "value", "id", "name", "type", "rel", "role", "autoComplete"].includes(key)) {
        return [key, translate(locale, value)];
      }
      return [key, value];
    }));
    return cloneElement(child, props);
  });
}

export function LocalizedContent({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return <>{localize(children, locale)}</>;
}
