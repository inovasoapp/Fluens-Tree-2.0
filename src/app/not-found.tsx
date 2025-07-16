// app/not-found.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { ThemeToggle, useThemeStore } from "@/components/ThemeToggle";
import { useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [count, setCount] = useState(5);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [1, 1.2, 1],
      transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" },
    });
    const interval = setInterval(() => {
      setCount((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    const timeout = setTimeout(() => {
      router.back();
    }, 5000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [router, controls]);

  return (
    <section
      className={`relative w-full h-dvh flex flex-col items-center justify-center font-light antialiased p-6 transition-colors duration-300 ${
        isDark ? "bg-[#0a0613] text-white" : "bg-[#f8f8fa] text-zinc-900"
      }`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0a0613 0%, #150d27 100%)"
          : "linear-gradient(135deg, #f8f8fa 0%, #e6e6f0 100%)",
      }}
    >
      <div className="w-full max-w-md mx-auto bg-zinc-100 dark:bg-zinc-900/40 px-8 py-12 rounded-2xl shadow-2xl flex flex-col items-center">
        <ThemeToggle />
        <h1 className="text-4xl font-bold mb-2 text-primary">404</h1>
        <p className="text-lg font-semibold mb-4">Página não encontrada</p>
        <motion.div
          animate={controls}
          className="text-5xl font-mono font-bold mb-2 text-primary"
        >
          {count}
        </motion.div>
        <p className="text-muted-foreground mb-6 text-sm">
          Você será redirecionado para a página anterior em {count} segundo
          {count !== 1 ? "s" : ""}...
        </p>
        <button
          onClick={() => router.back()}
          className="button-gradient rounded-full px-6 py-2 font-medium text-white shadow-md hover:brightness-90 transition-all"
        >
          Voltar agora
        </button>
      </div>
    </section>
  );
}
