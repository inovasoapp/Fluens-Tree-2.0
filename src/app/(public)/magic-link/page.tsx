"use client";

import { ThemeToggle, useThemeStore } from "@/components/ThemeToggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wand } from "lucide-react";
import { useState } from "react";
import {
  Input,
  InputAndIconWrapping,
  InputContainer,
  InputErrorMessage,
  InputIcon,
  InputLabel,
  InputRoot,
} from "@/components/Input";
import { Mail } from "lucide-react";

export default function SignupMagicLink() {
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

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Simulação de envio
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  }

  return (
    <section
      className={
        `relative w-full h-dvh overflow-hidden pb-10 pt-32 font-light antialiased md:pb-40 md:pt-40 ` +
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
              href="/signup"
              className="text-xs font-light text-zinc-500 hover:text-primary"
            >
              Voltar para cadastro
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex flex-col items-center mb-10">
            <h1 className="text-2xl md:text-3xl text-zinc-500 dark:text-gray-200">
              Cadastro via Magic Link
            </h1>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Informe seu e-mail para receber um link mágico de cadastro.
            </p>
          </div>

          {sent ? (
            <div className="text-center text-green-500 mb-6">
              Um link de cadastro foi enviado para seu e-mail!
            </div>
          ) : (
            <form
              onSubmit={handleSendMagicLink}
              className="flex flex-col gap-4 mb-6"
            >
              <InputRoot className="mb-2">
                <InputLabel
                  error={!!error}
                  className="text-gray-500 bg-zinc-100 dark:bg-zinc-900"
                >
                  E-mail
                </InputLabel>
                <InputContainer error={!!error} className="border-zinc-700">
                  <InputAndIconWrapping>
                    <InputIcon>
                      <Mail size={20} strokeWidth={1} />
                    </InputIcon>
                    <Input
                      type="email"
                      required
                      placeholder="Digite seu e-mail"
                      className="placeholder:text-zinc-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputAndIconWrapping>
                </InputContainer>
                {error && <InputErrorMessage>{error}</InputErrorMessage>}
              </InputRoot>
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="cursor-pointer text-zinc-50 button-gradient hover:brightness-90 transition-all duration-300 rounded-[10px] mb-4"
                disabled={loading}
              >
                <Wand />
                {loading ? "Enviando..." : "Enviar Magic Link"}
              </Button>
            </form>
          )}

          <div className="w-full relative flex items-center gap-2 my-6">
            <hr className="text-zinc-700 border-zinc-300 dark:border-zinc-800 border-[0.3px] w-full" />
            <span className="text-zinc-400 dark:text-zinc-700">ou</span>
            <hr className="text-zinc-700 border-zinc-300 dark:border-zinc-800 border-[0.3px] w-full" />
          </div>

          <span className="text-sm text-gray-500 w-full text-center">
            Já tem uma conta?
            <Link
              href="/signin"
              className="text-purple-500 outline-0 hover:text-purple-600 ml-1"
            >
              Entrar
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
}
