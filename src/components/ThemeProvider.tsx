"use client";

import { useThemeStore } from "./ThemeToggle";
import { useEffect } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore();

  // Efeito para sincronizar o tema com o localStorage e o DOM
  useEffect(() => {
    // Verificar se há um tema salvo no localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark";

      if (savedTheme && savedTheme !== theme) {
        setTheme(savedTheme);
      } else if (!savedTheme) {
        // Se não houver tema salvo, salvar o tema atual
        localStorage.setItem("theme", theme);
      }

      // Aplicar o tema ao elemento root
      const root = window.document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme, setTheme]);

  // Efeito para detectar mudanças de tema em outras abas/janelas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        setTheme(e.newValue as "light" | "dark");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setTheme]);

  return <>{children}</>;
}
