"use client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useI18n,
  useScopedI18n,
  useChangeLocale,
  useCurrentLocale,
} from "@/lib/locales/client";

const languages = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (BR)" },
  { value: "es", label: "Español" },
];

// function getCookie(name: string) {
//   if (typeof document === "undefined") return null;
//   const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
//   return match ? decodeURIComponent(match[2]) : null;
// }

// function setCookie(name: string, value: string, days = 365) {
//   if (typeof document === "undefined") return;
//   const expires = new Date(Date.now() + days * 864e5).toUTCString();
//   document.cookie = `${name}=${encodeURIComponent(
//     value
//   )}; expires=${expires}; path=/`;
// }

export function LanguageSelect() {
  const router = useRouter();
  const pathname = usePathname();
  // const [current, setCurrent] = useState<string>("en");
  const changeLocale = useChangeLocale();
  const locale = useCurrentLocale();

  // useEffect(() => {
  //   // 1. Tenta pegar do cookie
  //   const cookieLang = getCookie("lang");
  //   if (cookieLang && languages.some((l) => l.value === cookieLang)) {
  //     setCurrent(cookieLang);
  //     if (!pathname.startsWith(`/${cookieLang}`)) {
  //       const newPath = pathname.replace(/^\/(en|pt-BR|es)/, `/${cookieLang}`);
  //       router.replace(newPath);
  //     }
  //     return;
  //   }
  //   // 2. Se não, pega da URL
  //   const urlLang = languages.find((l) =>
  //     pathname.startsWith(`/${l.value}`)
  //   )?.value;
  //   if (urlLang) {
  //     setCurrent(urlLang);
  //     setCookie("lang", urlLang);
  //   }
  // }, [pathname, router]);

  function handleChange(lang: "en" | "es" | "pt-BR") {
    // setCurrent(lang);
    // setCookie("lang", lang);
    // const newPath = pathname.replace(/^\/(en|pt-BR|es)/, `/${lang}`);
    // router.push(newPath);
    changeLocale(lang);
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="min-w-36 absolute top-6 right-20 z-10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
