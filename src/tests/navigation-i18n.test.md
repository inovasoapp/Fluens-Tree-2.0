# Teste de Internacionalização do Componente de Navegação

## Objetivo

Verificar se os textos do componente de navegação são traduzidos corretamente ao mudar o idioma e se o idioma persiste entre navegações.

## Passos de Teste

### Teste 1: Verificação de Tradução

1. Iniciar a aplicação com o comando `npm run dev`
2. Acessar a página inicial da aplicação em http://localhost:3000
3. Verificar se o componente de navegação está exibindo os textos no idioma padrão (inglês)
4. Clicar no seletor de idioma e selecionar "Português (BR)"
5. Verificar se os textos do componente de navegação foram traduzidos para português
6. Clicar no seletor de idioma e selecionar "Español"
7. Verificar se os textos do componente de navegação foram traduzidos para espanhol
8. Clicar no seletor de idioma e selecionar "English"
9. Verificar se os textos do componente de navegação voltaram para inglês

### Teste 2: Persistência do Idioma

1. Acessar a página inicial da aplicação em http://localhost:3000
2. Clicar no seletor de idioma e selecionar "Português (BR)"
3. Verificar se os textos do componente de navegação foram traduzidos para português
4. Clicar no link "Entrar" para navegar para a página de login
5. Verificar se os textos do componente de navegação continuam em português na página de login
6. Voltar para a página inicial
7. Verificar se os textos do componente de navegação continuam em português
8. Recarregar a página (F5)
9. Verificar se os textos do componente de navegação continuam em português após o recarregamento

## Resultados Esperados

- Ao selecionar o idioma inglês, os textos do componente de navegação devem ser exibidos em inglês:

  - Home
  - Problems
  - Solutions
  - About
  - Plans
  - FAQ
  - Login
  - Get Started
  - Start Trading
  - Close

- Ao selecionar o idioma português, os textos do componente de navegação devem ser exibidos em português:

  - Início
  - Problemas
  - Soluções
  - Sobre
  - Planos
  - FAQ
  - Entrar
  - Começar
  - Começar a Negociar
  - Fechar

- Ao selecionar o idioma espanhol, os textos do componente de navegação devem ser exibidos em espanhol:

  - Inicio
  - Problemas
  - Soluciones
  - Acerca de
  - Planes
  - FAQ
  - Iniciar sesión
  - Comenzar
  - Comenzar a operar
  - Cerrar

- O idioma selecionado deve persistir entre navegações e recarregamentos de página
