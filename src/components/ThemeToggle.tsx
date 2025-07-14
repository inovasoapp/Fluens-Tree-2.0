"use client";

import { useEffect } from "react";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";
import { create } from "zustand";

// Store zustand para tema
interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme:
    typeof window !== "undefined"
      ? (localStorage.getItem("theme") as "light" | "dark") || "light"
      : "light",
  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    set({ theme: newTheme });
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  },
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  },
}));

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <Button
      onClick={toggleTheme}
      className="absolute top-6 right-6 z-10 dark:text-zinc-100"
      aria-label="Alternar tema"
      variant="outline"
    >
      {theme === "dark" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </Button>
  );
}
