"use client";

import Link from "next/link";
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
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Loader2,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const signupSchema = z
  .object({
    name: z.string().min(2, "Nome obrigatório"),
    email: z
      .string()
      .trim()
      .nonempty({ message: "O email é obrigatório!" })
      .email("Digite um e-mail válido"),
    password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .refine((val) => /[A-Z]/.test(val), {
        message: "A senha deve conter ao menos uma letra maiúscula.",
      })
      .refine((val) => /[0-9]/.test(val), {
        message: "A senha deve conter ao menos um número.",
      })
      .refine((val) => /[^A-Za-z0-9]/.test(val), {
        message: "A senha deve conter ao menos um caractere especial.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })
  .strict();

type SignupSchema = z.infer<typeof signupSchema>;

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  });

  const [show, setShow] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const router = useRouter();

  // Requisitos de senha
  const requirements = [
    {
      label: "Pelo menos 8 caracteres",
      test: (val: string) => val.length >= 8,
    },
    {
      label: "Pelo menos uma letra minúscula",
      test: (val: string) => /[a-z]/.test(val),
    },
    {
      label: "Pelo menos uma letra maiúscula",
      test: (val: string) => /[A-Z]/.test(val),
    },
    {
      label: "Pelo menos um número",
      test: (val: string) => /[0-9]/.test(val),
    },
    {
      label: "Pelo menos um caractere especial",
      test: (val: string) => /[^A-Za-z0-9]/.test(val),
    },
  ];

  const passed = requirements.filter((r) => r.test(passwordValue)).length;
  const percent = (passed / requirements.length) * 100;
  let strengthLabel = "Fraca";
  let strengthColor = "bg-red-500";
  if (passed >= 5) {
    strengthLabel = "Forte";
    strengthColor = "bg-green-500";
  } else if (passed >= 3) {
    strengthLabel = "Razoável";
    strengthColor = "bg-yellow-500";
  } else if (passed >= 1) {
    strengthLabel = "Fraca";
    strengthColor = "bg-orange-500";
  }

  async function onSignup(data: SignupSchema) {
    setIsSignup(true);
    // Aqui você faria a chamada para criar o usuário na sua API
    // Exemplo fictício:
    // const result = await api.signup(data);
    // if (result.error) { setSignupError(result.error); setIsSignup(false); return; }
    setTimeout(() => {
      setIsSignup(false);
      router.push("/dashboard");
    }, 1500);
  }

  function handleShowPassword() {
    setShow(!show);
  }

  function handleConfirmShowPassword() {
    setShowConfirmPass(!showConfirmPass);
  }

  return (
    <form onSubmit={handleSubmit(onSignup)} className="w-full flex flex-col  ">
      <InputRoot className="mb-6">
        <InputLabel
          error={errors.name || signupError.length > 0 ? true : false}
          className="text-gray-500 bg-zinc-100 dark:bg-zinc-900"
        >
          Nome
        </InputLabel>
        <InputContainer error={!!errors.name} className="border-zinc-700">
          <InputAndIconWrapping>
            <InputIcon>
              <User size={20} strokeWidth={1} />
            </InputIcon>
            <Input
              type="text"
              placeholder="Digite seu nome completo"
              className="placeholder:text-zinc-600"
              {...register("name")}
            />
          </InputAndIconWrapping>
        </InputContainer>
        {errors.name && (
          <InputErrorMessage>{errors.name.message}</InputErrorMessage>
        )}
      </InputRoot>

      <InputRoot className="mb-6">
        <InputLabel
          error={errors.email || signupError.length > 0 ? true : false}
          className="text-gray-500 bg-zinc-100 dark:bg-zinc-900"
        >
          E-mail
        </InputLabel>
        <InputContainer error={!!errors.email} className="border-zinc-700">
          <InputAndIconWrapping>
            <InputIcon>
              <Mail size={20} strokeWidth={1} />
            </InputIcon>
            <Input
              type="email"
              placeholder="Digite seu e-mail"
              className="placeholder:text-zinc-600"
              {...register("email")}
            />
          </InputAndIconWrapping>
        </InputContainer>
        {errors.email && (
          <InputErrorMessage>{errors.email.message}</InputErrorMessage>
        )}
      </InputRoot>

      <InputRoot className="mb-6">
        <InputLabel
          error={errors.password ? true : false}
          className="text-gray-500 bg-zinc-100 dark:bg-zinc-900"
        >
          Senha
        </InputLabel>
        <InputContainer error={!!errors.password} className="border-zinc-700">
          <InputAndIconWrapping>
            <InputIcon>
              <Lock size={20} strokeWidth={1} />
            </InputIcon>
            <Input
              type={show ? "text" : "password"}
              placeholder="Digite sua senha"
              className="placeholder:text-zinc-600"
              {...register("password")}
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
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
        {/* Barra de força da senha */}
        {passwordValue.length > 0 && (
          <>
            <div className="mt-2 mb-1">
              <div className="w-full h-2 bg-zinc-800/40 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-xs text-zinc-400">
                <span
                  className={
                    passed >= 5
                      ? "text-green-500"
                      : passed >= 3
                      ? "text-yellow-500"
                      : "text-orange-500"
                  }
                >
                  {strengthLabel}
                </span>
                <span>
                  {passed} de {requirements.length} requisitos atendidos
                </span>
              </div>
            </div>
            {/* Lista de requisitos */}
            <ul className="mt-2 space-y-1 text-xs">
              {requirements.map((req, idx) => (
                <li key={req.label} className="flex items-center gap-2">
                  {req.test(passwordValue) ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-zinc-400" />
                  )}
                  <span
                    className={
                      req.test(passwordValue)
                        ? "text-green-500"
                        : "text-zinc-400"
                    }
                  >
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </InputRoot>

      <InputRoot className="mb-6">
        <InputLabel className="text-gray-500 bg-zinc-100 dark:bg-zinc-900">
          Confirmar Senha
        </InputLabel>
        <InputContainer
          error={!!errors.confirmPassword}
          className="border-zinc-700"
        >
          <InputAndIconWrapping>
            <InputIcon>
              <Lock size={20} strokeWidth={1} />
            </InputIcon>
            <Input
              type={showConfirmPass ? "text" : "password"}
              placeholder="Confirme sua senha"
              className="placeholder:text-zinc-600"
              {...register("confirmPassword")}
            />
          </InputAndIconWrapping>
          <InputButton
            type="button"
            onClick={handleConfirmShowPassword}
            className="text-zinc-700"
          >
            {showConfirmPass ? (
              <EyeOff size={20} strokeWidth={1} />
            ) : (
              <Eye size={20} strokeWidth={1} />
            )}
          </InputButton>
        </InputContainer>
        {errors.confirmPassword && (
          <InputErrorMessage>
            {errors.confirmPassword.message}
          </InputErrorMessage>
        )}
      </InputRoot>

      {signupError && <InputErrorMessage>{signupError}</InputErrorMessage>}

      <Button
        disabled={isSignup}
        className="cursor-pointer button-gradient hover:brightness-90 transition-all duration-300 rounded-[10px] mb-4"
        size="lg"
      >
        {isSignup ? <Loader2 className="animate-spin" /> : <UserPlus />}
        {isSignup ? "Cadastrando..." : "Cadastrar"}
      </Button>

      <span className="text-sm text-gray-500 w-full text-center">
        Já tem uma conta?
        <Link
          href="/signin"
          className="text-purple-500 outline-0 hover:text-purple-600 ml-1"
        >
          Entrar
        </Link>
      </span>
    </form>
  );
}
