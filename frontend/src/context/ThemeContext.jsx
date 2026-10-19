import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../lib/api";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false
});

export function ThemeProvider({ children }) {
  const { profile, user } = useAuth();

  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem("app_theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch (_) {}
    return "light";
  });

  const applyTheme = useCallback((mode) => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  }, []);

  const setTheme = useCallback((newTheme) => {
    const mode = newTheme === "dark" ? "dark" : "light";
    setThemeState(mode);
    try {
      localStorage.setItem("app_theme", mode);
    } catch (_) {}
    applyTheme(mode);

    // Sync with backend profile if authenticated
    if (user?.id) {
      api.updateProfile({ theme: mode }).catch(() => {});
    }
  }, [applyTheme, user?.id]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Sync theme when profile loads
  useEffect(() => {
    if (profile?.theme && (profile.theme === "dark" || profile.theme === "light")) {
      const localTheme = localStorage.getItem("app_theme");
      if (!localTheme) {
        setThemeState(profile.theme);
        applyTheme(profile.theme);
        try {
          localStorage.setItem("app_theme", profile.theme);
        } catch (_) {}
      }
    }
  }, [profile?.theme, applyTheme]);

  // Apply on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
