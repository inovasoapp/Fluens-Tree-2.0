"use client";

import { ThemeToggle, useThemeStore } from "@/components/ThemeToggle";
import { RecoverPasswordForm } from "./recover-password-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function RecoverPassword() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const primaryOklch = "oklch(0.6726 0.2904 341.4084)";
  const shadowClass = isDark
    ? `shadow-[0_0_50px_${primaryOklch
        .replace(/oklch\(|\)/g, "")
        .replace(/ /g, ",")},0.22)]`
    : `shadow-[0_0_50px_${primaryOklch
        .replace(/oklch\(|\)/g, "")
        .replace(/ /g, ",")},0.10)]`;

  return (
    <section
      className={
        `relative w-full h-dvh  overflow-hidden pb-10 pt-32 font-light antialiased md:pb-40 md:pt-40 ` +
        (isDark ? "bg-[#0a0613] text-white" : "bg-[#f8f8fa] text-zinc-900")
      }
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0a0613 0%, #150d27 100%)"
          : "linear-gradient(135deg, #f8f8fa 0%, #e6e6f0 100%)",
      }}
    >
      <div className="w-full max-w-96 mx-auto bg-zinc-100 dark:bg-zinc-900/40 px-4 py-8 rounded-2xl shadow-2xl">
        <div className="max-w-96 w-full">
          <div className="mb-8">
            <Link
              href="/signin"
              className="text-xs font-light text-zinc-500 hover:text-primary"
            >
              Voltar para login
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex flex-col items-center mb-10">
            <h1 className="text-2xl md:text-3xl text-zinc-500 dark:text-gray-200">
              Recuperar senha
            </h1>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Informe seu e-mail para receber o link de recuperação de senha.
            </p>
          </div>

          <RecoverPasswordForm />
        </div>
      </div>
    </section>
  );
}
