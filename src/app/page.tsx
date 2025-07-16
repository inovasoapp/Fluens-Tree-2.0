"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ThemeToggle";
import LandingPage from "./(public)/page";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.div>
      <ThemeToggle />
      <LandingPage />
    </motion.div>
  );
}
