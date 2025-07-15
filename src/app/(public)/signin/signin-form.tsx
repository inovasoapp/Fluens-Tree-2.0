"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Input,
  InputAndIconWrapping,
  InputButton,
  InputContainer,
  InputErrorMessage,
  InputIcon,
  InputLabel,
  InputRoot,
} from "@/components/Input";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useRouter } from "next/navigation";

const signInSchema = z
  .object({
    email: z
      .string()
      .trim()
      .nonempty({ message: "O email é obrigatório!" })
      .email("Digite seu e-mail cadastrado"),
    password: z
      .string()
      .min(6, "Informe a senha cadastrada")
      .nonempty({ message: "Informe sua senha" })
      .refine((val) => /[A-Z]/.test(val), {
        message: "A senha deve conter ao menos uma letra maiúscula.",
      })
      .refine((val) => /[0-9]/.test(val), {
        message: "A senha deve conter ao menos um número.",
      })
      .refine((val) => /[^A-Za-z0-9]/.test(val), {
        message: "A senha deve conter ao menos um caractere especial.",
      }),
  })
  .strict();

type SignInSchema = z.infer<typeof signInSchema>;

export function SigninForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const [show, setShow] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [isSignin, setIsSignin] = useState(false);

  const router = useRouter();

  async function onSignIn(data: SignInSchema) {
    const { email, password } = data;

    setIsSignin(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // evita redirecionamento automático
    });

    if (result?.error) {
      setIsSignin(false);

      if (result?.error) {
        if (result.error === "Configuration") {
          setSignInError("E-mail ou Senha inválidos. Tente novamente.");
        } else {
          setSignInError(result.error);
        }
      }
      console.log("-----EPAAAA-----: ", result);
    } else {
      console.log("*****SignIn result****", result);
      setIsSignin(false);

      return router.push("/dashboard"); // redireciona manualmente
    }
  }

  function handleShowPassword() {
    setShow(!show);
  }

  return (
    <form onSubmit={handleSubmit(onSignIn)} className="w-full flex flex-col  ">
      <InputRoot className="mb-6">
        <InputLabel
          error={errors.email || signInError.length > 0 ? true : false}
          className="text-gray-500 bg-zinc-100 dark:bg-zinc-900"
        >
          E-mail
        </InputLabel>

        <InputContainer
          error={errors.email || signInError ? true : false}
          className="border-zinc-700"
        >
          <InputAndIconWrapping>
            <InputIcon className="group-[&:has(input:placeholder-shown)]:text-zinc-700">
              <Mail size={20} strokeWidth={1} />
            </InputIcon>

            <Input
              type="email"
              placeholder="Digite seu e-mail cadastrado..."
              className="placeholder:text-zinc-600"
              {...register("email")}
            />
          </InputAndIconWrapping>
        </InputContainer>

        {errors.email && (
          <InputErrorMessage>{errors.email.message}</InputErrorMessage>
        )}
      </InputRoot>

      <InputRoot className="mb-2">
        <InputLabel className="text-gray-500 bg-zinc-100 dark:bg-zinc-900">
          Senha
        </InputLabel>

        <InputContainer
          error={errors.password ? true : false}
          className="border-zinc-700"
        >
          <InputAndIconWrapping>
            <InputIcon className="group-[&:has(input:placeholder-shown)]:text-zinc-700">
              <Lock size={20} strokeWidth={1} />
            </InputIcon>

            <Input
              type={show ? "text" : "password"}
              placeholder="Digite sua senha..."
              className="placeholder:text-zinc-600"
              {...register("password")}
            />
          </InputAndIconWrapping>

          <InputButton
            type="button"
            onClick={handleShowPassword}
            className="text-zinc-700"
          >
            {show ? (
              <EyeOff size={20} strokeWidth={1} />
            ) : (
              <Eye size={20} strokeWidth={1} />
            )}
          </InputButton>
        </InputContainer>

        {errors.password && (
          <InputErrorMessage>{errors.password.message}</InputErrorMessage>
        )}
        {signInError && <InputErrorMessage>{signInError}</InputErrorMessage>}
      </InputRoot>

      <div className="flex items-center justify-center mb-6">
        <Link
          href="/recover-password"
          className="text-xs text-purple-500 outline-0 hover:text-purple-600"
        >
          Esqueceu a senha?
        </Link>
      </div>

      <Button
        disabled={isSignin}
        className="cursor-pointer button-gradient hover:brightness-90 transition-all duration-300 rounded-[10px] mb-4"
        size="lg"
      >
        {isSignin ? <Loader2 className="animate-spin" /> : <LogIn />}
        {isSignin ? "Autenticando..." : "Entrar"}
      </Button>

      <span className="text-sm text-gray-500 w-full text-center">
        Ainda não tem uma conta
        <Link
          href="/signup"
          className="text-purple-500 outline-0 hover:text-purple-600 ml-1"
        >
          Cadastrar-se
        </Link>
      </span>
    </form>
  );
}
