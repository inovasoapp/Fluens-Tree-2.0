"use client";

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
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const recoverSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty({ message: "O email é obrigatório!" })
    .email("Digite um e-mail válido"),
});
type RecoverSchema = z.infer<typeof recoverSchema>;

export function RecoverPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverSchema>({
    resolver: zodResolver(recoverSchema),
  });

  async function handleSend(data: RecoverSchema) {
    setLoading(true);
    setError("");
    // Simulação de envio
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  }

  return sent ? (
    <div className="text-center text-green-500 mb-6">
      Um link de recuperação foi enviado para seu e-mail!
    </div>
  ) : (
    <form
      onSubmit={handleSubmit(handleSend)}
      className="flex flex-col gap-4 mb-8"
    >
      <InputRoot className="mb-6">
        <InputLabel
          error={!!errors.email || !!error}
          className="text-gray-500 bg-zinc-100 dark:bg-zinc-900"
        >
          E-mail
        </InputLabel>
        <InputContainer
          error={!!errors.email || !!error}
          className="border-zinc-700"
        >
          <InputAndIconWrapping>
            <InputIcon>
              <Mail size={20} strokeWidth={1} />
            </InputIcon>
            <Input
              type="email"
              required
              placeholder="Digite seu e-mail"
              className="placeholder:text-zinc-600"
              {...register("email")}
            />
          </InputAndIconWrapping>
        </InputContainer>
        {errors.email && (
          <InputErrorMessage>{errors.email.message}</InputErrorMessage>
        )}
        {error && <InputErrorMessage>{error}</InputErrorMessage>}
      </InputRoot>
      <Button
        type="submit"
        variant="outline"
        size="lg"
        className="w-full bg-primary/20 hover:bg-primary/30 border-primary text-primary hover:text-zinc-100 transition-all duration-300 cursor-pointer rounded-[10px]"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </Button>
    </form>
  );
}
