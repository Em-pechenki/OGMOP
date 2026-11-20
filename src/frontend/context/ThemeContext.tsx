import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "ogmop:theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function detectInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    /* ignore */
  }
  return "system";
}

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  toggle: () => void;
}

const initialTheme = detectInitialTheme();
const initialResolved = initialTheme === "system" ? getSystemTheme() : (initialTheme as ResolvedTheme);

const defaultValue: ThemeContextValue = {
  theme: initialTheme,
  resolvedTheme: initialResolved,
  setTheme: () => {},
  toggleTheme: () => {},
  toggle: () => {},
};

export const ThemeContext = createContext<ThemeContextValue>(defaultValue);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme ?? detectInitialTheme());
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme());

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : (theme as ResolvedTheme);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (resolvedTheme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [theme, resolvedTheme]);

  const setTheme = useCallback((t: ThemeMode) => {
    if (t === "light" || t === "dark" || t === "system") setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const cur = prev === "system" ? (getSystemTheme() === "dark" ? "dark" : "light") : prev;
      return cur === "dark" ? "light" : "dark";
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      toggle: toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

export default ThemeProvider;