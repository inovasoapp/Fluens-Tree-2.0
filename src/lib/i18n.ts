import { createI18n } from "next-international";

export const { useI18n, I18nProvider } = createI18n({
  en: () => import("./locales/en.json"),
  "pt-BR": () => import("./locales/pt-BR.json"),
  es: () => import("./locales/es.json"),
});
