import { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

//Root
interface InputRootProps extends ComponentProps<"div"> {
  children: ReactNode;
  className?: string;
}

export function InputRoot({ children, className, ...props }: InputRootProps) {
  return (
    <div className={cn("group relative flex flex-col", className)} {...props}>
      {children}
    </div>
  );
}

// Label
interface InputLabelProps extends ComponentProps<"span"> {
  error?: boolean;
  children: ReactNode;
}

export function InputLabel({
  error = false,
  children,
  className,
  ...props
}: InputLabelProps) {
  return (
    <span
      data-error={error}
      className={cn(
        "absolute -translate-y-2 ml-2.5 px-1 text-xs bg-background transform:translateY(-3px) font-light text-gray-400 dark:text-gray-500 group-focus-within:text-primary dark:group-focus-within:text-primary",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

//Input Container
interface InputContainerProps extends ComponentProps<"div"> {
  error?: boolean;
  children: ReactNode;
  className?: string;
}

export function InputContainer({
  error = false,
  children,
  className,
  ...props
}: InputContainerProps) {
  return (
    <div
      data-error={error}
      className={cn(
        " flex gap-2 h-12 border-[0.5px] rounded-[10px] text-sm px-3 border-zinc-300 dark:border-zinc-700 focus-within:border-primary dark:focus-within:border-primary data-[error=true]:border-red-500 bg-zinc-50/30 hover:bg-zinc-50/50 dark:bg-zinc-950/30 dark:hover:bg-zinc-950/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

//Input And Icon Wrapping
interface InputAndIconWrappingProps extends ComponentProps<"div"> {
  children: ReactNode;
}

export function InputAndIconWrapping({
  children,
  className,
  ...props
}: InputAndIconWrappingProps) {
  return (
    <div
      className={cn("flex flex-1 items-center gap-2 ", className)}
      {...props}
    >
      {children}
    </div>
  );
}

//Input Icon
interface InputIconProps extends ComponentProps<"span"> {
  error?: boolean;
  children: ReactNode;
}

export function InputIcon({
  error = false,
  children,
  className,
  ...props
}: InputIconProps) {
  return (
    <span
      data-error={error}
      className={cn(
        " group-[&:has(input:placeholder-shown)]:text-zinc-300 dark:group-[&:has(input:placeholder-shown)]:text-zinc-700 group-[&:not(:has(input:placeholder-shown))]:text-primary ",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

//Input
interface InputProps extends ComponentProps<"input"> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full py-2 outline-0 placeholder:text-xs placeholder:font-light placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-primary disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}

//Input Show Button
interface InputButtonProps extends ComponentProps<"button"> {
  children: ReactNode;
  className?: string;
}

export function InputButton({
  children,
  className,
  ...props
}: InputButtonProps) {
  return (
    <button
      className={cn(
        "text-zinc-300 hover:text-zinc-400 dark:text-zinc-700 dark:hover:text-zinc-600",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

//Input Show Button
interface InputErrorMessageProps extends ComponentProps<"button"> {
  children: ReactNode;
}

export function InputErrorMessage({
  children,
  className,
  ...props
}: InputErrorMessageProps) {
  return (
    <span
      className={cn("text-red-500 font-light text-xs mt-1", className)}
      {...props}
    >
      {children}
    </span>
  );
}
