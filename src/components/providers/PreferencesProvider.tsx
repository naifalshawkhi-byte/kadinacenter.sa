"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultPreferences,
  STORAGE_KEY,
  translations,
  type Locale,
  type StoredPreferences,
  type Theme,
  type TranslationKey,
} from "@/lib/i18n/translations";

interface PreferencesContextValue extends StoredPreferences {
  mounted: boolean;
  toggleTheme: () => void;
  toggleLocale: () => void;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function readPreferences(): StoredPreferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
    return {
      theme: parsed.theme === "dark" ? "dark" : "light",
      locale: parsed.locale === "en" ? "en" : "ar",
    };
  } catch {
    return defaultPreferences;
  }
}

export function applyPreferences({ theme, locale }: StoredPreferences) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.lang = locale;
  root.dir = locale === "ar" ? "rtl" : "ltr";
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<StoredPreferences>(defaultPreferences);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readPreferences();
    setPrefs(stored);
    applyPreferences(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyPreferences(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs, mounted]);

  const setTheme = useCallback((theme: Theme) => {
    setPrefs((p) => ({ ...p, theme }));
  }, []);

  const setLocale = useCallback((locale: Locale) => {
    setPrefs((p) => ({ ...p, locale }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPrefs((p) => ({ ...p, theme: p.theme === "light" ? "dark" : "light" }));
  }, []);

  const toggleLocale = useCallback(() => {
    setPrefs((p) => ({ ...p, locale: p.locale === "ar" ? "en" : "ar" }));
  }, []);

  const t = useCallback(
    (key: TranslationKey) =>
      translations[prefs.locale][key] ?? translations.ar[key] ?? key,
    [prefs.locale]
  );

  const value = useMemo(
    () => ({
      ...prefs,
      mounted,
      toggleTheme,
      toggleLocale,
      setTheme,
      setLocale,
      t,
    }),
    [prefs, mounted, toggleTheme, toggleLocale, setTheme, setLocale, t]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
}
