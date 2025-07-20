# Bio Builder - Link in Bio Creator

Um construtor visual de páginas de bio para redes sociais, similar ao Elementor, com funcionalidade completa de arrastar e soltar elementos em um canvas mockup do iPhone, incluindo navegação e zoom do canvas.

## 🎯 Funcionalidades

### 🎨 Editor Visual

- **Canvas iPhone Mockup**: Preview em tempo real no formato iPhone 15 Pro
- **Canvas Navegável**: Arraste o canvas para reposicionar e zoom com scroll
- **Drag & Drop Completo**: Interface intuitiva para adicionar e reordenar elementos
- **Seleção Visual**: Clique nos elementos para selecioná-los e editá-los
- **Indicadores Visuais**: Feedback visual durante operações de drag & drop

### 🖱️ Navegação do Canvas

- **Pan (Arrastar)**:
  - **Space + drag** para mover o canvas (método principal)
  - Middle click + drag para mover o canvas (alternativo)
- **Zoom**:
  - Ctrl/Cmd + scroll para zoom in/out
  - Botões de zoom na interface
  - Zoom de 50% até 200%
- **Centralizar**: Botão para resetar posição e zoom
- **Controles Visuais**: Painel de controles flutuante no canto inferior direito

### 📱 Elementos Disponíveis

1. **Profile**: Avatar, nome e bio
2. **Link Button**: Botões de link personalizáveis
3. **Text Block**: Blocos de texto livre
4. **Social Link**: Links para redes sociais (Instagram, Twitter, YouTube, etc.)
5. **Divider**: Separadores visuais
6. **Image**: Imagens personalizadas

### 🖱️ Funcionalidades de Drag & Drop

- **Arrastar do Painel**: Arraste elementos do painel esquerdo para o canvas
- **Reordenar Elementos**: Arraste elementos dentro do canvas para reordená-los
- **Inserção Precisa**: Indicadores visuais mostram onde o elemento será inserido
- **Feedback Visual**: Elementos ficam semi-transparentes durante o arraste
- **Drop Zones**: Áreas de drop claramente definidas com feedback visual

### ⚙️ Painel de Propriedades (Estilo Figma)

- **Conteúdo**: Edição de textos, URLs e configurações específicas
- **Estilo**: Cores, bordas, espaçamento, tipografia
- **Layout**: Padding, margin, alinhamento
- **Controles Visuais**: Sliders, color pickers, dropdowns

### 🛠️ Barra de Ferramentas

- **Controles de Canvas**: Zoom in/out, centralizar, posição atual
- **Preview**: Visualização em diferentes dispositivos
- **Salvar/Carregar**: Persistência de projetos
- **Compartilhar**: Geração de links públicos
- **Exportar**: Download do código/imagem

## 🚀 Como Usar

### Navegando no Canvas

1. **Pan (Mover)**:
   - **Space + Drag**: Segure a tecla Space e arraste com o mouse (método principal)
   - **Middle Click + Drag**: Clique com o botão do meio e arraste (alternativo)
2. **Zoom**:
   - **Ctrl/Cmd + Scroll**: Zoom in/out com a roda do mouse
   - **Botões de Zoom**: Use os controles na interface
3. **Centralizar**: Clique no botão de reset para centralizar o canvas

### Adicionando Elementos

1. **Método 1 - Drag & Drop**: Arraste elementos do painel esquerdo para o canvas
2. **Método 2 - Click**: Clique nos elementos do painel para adicioná-los ao final

### Reordenando Elementos

1. **Hover**: Passe o mouse sobre um elemento no canvas para ver o handle de arraste
2. **Drag**: Clique e arraste o handle (ícone de grip) para mover o elemento
3. **Drop**: Solte o elemento na nova posição desejada

### Editando Elementos

1. **Selecionar**: Clique no elemento no canvas para selecioná-lo
2. **Editar**: Use o painel direito para modificar propriedades
3. **Visualizar**: O preview é atualizado em tempo real

## 🎨 Experiência Visual

### Controles de Canvas

- **Painel Flutuante**: Controles de zoom e posição no canto inferior direito
- **Indicadores de Status**: Posição atual e zoom exibidos em tempo real
- **Feedback Visual**: Indicador quando o canvas está sendo movido
- **Instruções**: Dicas de navegação exibidas no canvas

### Indicadores de Drag & Drop

- **Elementos Arrastados**: Ficam semi-transparentes e rotacionados
- **Drop Zones**: Áreas destacadas com bordas pontilhadas azuis
- **Indicadores de Inserção**: Linhas azuis mostram onde o elemento será inserido
- **Handles de Arraste**: Aparecem ao passar o mouse sobre elementos

### Animações e Transições

- **Transições Suaves**: Todos os movimentos são animados
- **Feedback Tátil**: Cursor muda para indicar ações possíveis
- **Estados Visuais**: Hover, seleção e arraste têm feedback visual distinto
- **Zoom Suave**: Transições animadas para operações de zoom

## 📁 Estrutura de Arquivos

```
my-links/
├── components/
│   ├── BioBuilder.tsx              # Componente principal
│   ├── Canvas.tsx                  # Canvas com mockup iPhone
│   ├── CanvasControls.tsx          # Controles de canvas (zoom, pan)
│   ├── DraggableCanvas.tsx         # Canvas arrastável
│   ├── DragDropContext.tsx         # Contexto de drag & drop
│   ├── DraggableTemplate.tsx       # Templates arrastáveis
│   ├── DropZone.tsx               # Zona de drop do canvas
│   ├── ElementsPanel.tsx          # Painel lateral de elementos
│   ├── ElementRenderer.tsx        # Renderizador de elementos
│   ├── InsertionIndicator.tsx     # Indicador de inserção
│   ├── PropertiesPanel.tsx        # Painel de propriedades
│   ├── SortableElement.tsx        # Elementos sortáveis
│   └── Toolbar.tsx                # Barra de ferramentas
├── bio-builder.css                # Estilos específicos
├── page.tsx                       # Página principal
└── README.md                      # Esta documentação
```

## 🔧 Tecnologias Utilizadas

- **React 19** + **Next.js 15**: Framework principal
- **TypeScript**: Tipagem estática
- **@dnd-kit**: Biblioteca de drag & drop
  - `@dnd-kit/core`: Funcionalidades principais
  - `@dnd-kit/sortable`: Elementos sortáveis
  - `@dnd-kit/utilities`: Utilitários CSS
- **Zustand**: Gerenciamento de estado
- **Tailwind CSS**: Estilização
- **Radix UI**: Componentes de UI
- **Lucide React**: Ícones

## 🎯 Funcionalidades de Canvas

### Navegação

- **Pan**: Movimento livre do canvas em qualquer direção
- **Zoom**: Ampliação de 50% até 200% com controles precisos
- **Reset**: Centralização instantânea com um clique
- **Posição**: Coordenadas X,Y exibidas em tempo real

### Controles

1. **Mouse/Trackpad**:
   - Middle click + drag para pan
   - Shift + drag para pan alternativo
   - Ctrl/Cmd + scroll para zoom
2. **Interface**:
   - Botões de zoom +/-
   - Botão de centralização
   - Indicador de zoom atual
3. **Teclado**:
   - Shift para modo pan
   - Ctrl/Cmd para zoom

### Estados Visuais

- **Cursor**: Muda para grab/grabbing durante pan
- **Feedback**: Indicadores visuais durante operações
- **Transições**: Animações suaves para todas as mudanças
- **Status**: Painel de informações com posição atual

## 🎨 Inspiração

O design foi inspirado em:

- **Elementor** (WordPress): Interface de drag & drop
- **Figma**: Painel de propriedades, controles visuais e navegação de canvas
- **Adobe XD**: Navegação e zoom de canvas
- **Sketch**: Controles de canvas e posicionamento
- **Notion**: Drag & drop de blocos de conteúdo
- **Webflow**: Editor visual com elementos arrastáveis
- **Linktree**: Conceito de link in bio
- **iPhone Design**: Mockup realista para preview

## 🚀 Próximas Funcionalidades

- [ ] Undo/Redo com histórico de ações
- [ ] Templates pré-definidos
- [ ] Duplicação de elementos
- [ ] Grupos de elementos
- [ ] Grid snap para alinhamento
- [ ] Rulers e guias
- [ ] Minimap para navegação
- [ ] Exportação para código HTML/CSS
- [ ] Integração com redes sociais
- [ ] Analytics de cliques
- [ ] Temas personalizados
- [ ] Responsividade para desktop
- [ ] Keyboard shortcuts
- [ ] Bulk operations
- [ ] Canvas layers
- [ ] Multi-canvas support

## 🎮 Atalhos de Teclado

| Ação           | Atalho                         |
| -------------- | ------------------------------ |
| Pan Canvas     | `Space + Drag`                 |
| Zoom In        | `Ctrl/Cmd + Scroll Up`         |
| Zoom Out       | `Ctrl/Cmd + Scroll Down`       |
| Center Canvas  | `C` (planejado)                |
| Select All     | `Ctrl/Cmd + A` (planejado)     |
| Delete Element | `Delete/Backspace` (planejado) |
| Duplicate      | `Ctrl/Cmd + D` (planejado)     |

A implementação está completa com funcionalidade completa de navegação de canvas, proporcionando uma experiência de usuário profissional similar aos melhores editores visuais do mercado!
