# Verificação Manual do Drag and Drop

Este documento descreve os passos para verificar manualmente se a correção do problema de drag and drop está funcionando corretamente.

## Passos de Verificação

### 1. Verificar se apenas o mockup do iPhone é destacado como área dropável

- Abra o Bio Builder
- Selecione um elemento da lista de templates
- Comece a arrastar o elemento
- Observe se apenas o mockup do iPhone é destacado como área dropável
- Verifique se o resto da tela não mostra nenhuma indicação visual de que é uma área dropável

### 2. Verificar o feedback visual durante o drag

- Arraste um elemento sobre o mockup do iPhone
- Verifique se há uma indicação visual clara de que esta é uma área dropável válida
- Arraste o elemento para fora do mockup
- Verifique se a indicação visual desaparece
- Verifique se o componente de feedback no topo da tela mostra instruções claras

### 3. Verificar o comportamento quando um elemento é solto fora da área dropável

- Arraste um elemento
- Solte o elemento fora do mockup do iPhone
- Verifique se o elemento retorna à sua posição original
- Verifique se uma notificação é exibida informando que o elemento deve ser solto no mockup

### 4. Verificar o comportamento quando um elemento é solto dentro da área dropável

- Arraste um elemento
- Solte o elemento dentro do mockup do iPhone
- Verifique se o elemento é adicionado corretamente ao Canvas
- Verifique se não há notificações de erro

### 5. Verificar o comportamento de reordenação de elementos

- Adicione pelo menos dois elementos ao Canvas
- Arraste um dos elementos para reordená-lo
- Verifique se a reordenação funciona corretamente
- Verifique se não há problemas com a detecção de áreas dropáveis durante a reordenação

## Resultados Esperados

- Apenas o mockup do iPhone deve ser destacado como área dropável durante o drag
- O feedback visual deve ser claro e preciso durante o drag
- Elementos soltos fora da área dropável devem retornar à sua posição original
- Elementos soltos dentro da área dropável devem ser adicionados corretamente
- A reordenação de elementos deve funcionar corretamente
