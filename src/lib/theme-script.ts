// Este script é executado antes da hidratação do React para evitar flash de tema incorreto
export function themeScript() {
  return `
    (function() {
      try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error('Error applying theme:', e);
      }
    })()
  `;
}
