"use client";

import { ThemeToggle, useThemeStore } from "@/components/ThemeToggle";
import { SigninForm } from "./signin-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { FaGoogle } from "react-icons/fa";
import { Wand } from "lucide-react";

export default function SignIn() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const radialGradient = isDark
    ? "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)"
    : "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.18) 0%, rgba(255, 255, 255, 0) 60%)";
  // Extrair cor primária do CSS para usar nos shadows
  const primaryOklch = "oklch(0.6726 0.2904 341.4084)";
  // Sombra para container principal
  const shadowClass = isDark
    ? `shadow-[0_0_50px_${primaryOklch
        .replace(/oklch\(|\)/g, "")
        .replace(/ /g, ",")},0.22)]`
    : `shadow-[0_0_50px_${primaryOklch
        .replace(/oklch\(|\)/g, "")
        .replace(/ /g, ",")},0.10)]`;
  // Sombra para botão "Get Started"
  const buttonShadow = isDark
    ? `shadow-[0_0_20px_${primaryOklch
        .replace(/oklch\(|\)/g, "")
        .replace(/ /g, ",")},0.32)]`
    : `shadow-[0_0_20px_${primaryOklch
        .replace(/oklch\(|\)/g, "")
        .replace(/ /g, ",")},0.13)]`;

  function handleAuth() {}

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
              href="/"
              className="text-xs font-light text-zinc-500 hover:text-primary"
            >
              Voltar para a Home
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex flex-col items-center mb-10">
            <h1 className="text-2xl md:text-3xl text-zinc-500 dark:text-gray-200">
              Login
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Digite suas credenciais para acessar sua conta
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            <form action={handleAuth} className="">
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="w-full bg-primary/20 hover:bg-primary/30 border-primary text-primary hover:text-zinc-100 transition-all duration-300 cursor-pointer rounded-[10px]"
              >
                <FaGoogle />
                Entrar com o Google
              </Button>
            </form>

            <Link href="/magic-link" className="">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full bg-primary/20 hover:bg-primary/30 border-primary text-primary hover:text-zinc-100 transition-all duration-300 cursor-pointer rounded-[10px]"
              >
                <Wand />
                Entrar com Magic Link
              </Button>
            </Link>
          </div>

          <div className="w-full relative flex items-center gap-2 my-6">
            <hr className="text-zinc-700 border-zinc-300 dark:border-zinc-800 border-[0.3px] w-full" />
            <span className="text-zinc-400 dark:text-zinc-700">ou</span>
            <hr className="text-zinc-700 border-zinc-300 dark:border-zinc-800 border-[0.3px] w-full" />
          </div>

          <SigninForm />
        </div>
      </div>
    </section>
  );
}
