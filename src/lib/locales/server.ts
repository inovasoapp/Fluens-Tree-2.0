import { createI18nServer } from "next-international/server";

export const { getI18n, getScopedI18n, getStaticParams } = createI18nServer({
  en: () => import("./en.json"),
  pt: () => import("./pt-BR.json"),
  es: () => import("./es.json"),
});
