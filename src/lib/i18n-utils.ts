/**
 * Utilitários para internacionalização
 */

/**
 * Verifica se uma chave de tradução existe e registra um aviso no console se não existir
 * @param translations Objeto de traduções
 * @param key Chave de tradução a ser verificada
 * @param locale Idioma atual
 */
export function checkTranslationKey(
  translations: Record<string, any>,
  key: string,
  locale: string
): void {
  if (process.env.NODE_ENV === "development") {
    const keys = key.split(".");
    let current = translations;

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        console.warn(
          `[i18n] Chave de tradução ausente: "${key}" para o idioma "${locale}"`
        );
        return;
      }
    }
  }
}
