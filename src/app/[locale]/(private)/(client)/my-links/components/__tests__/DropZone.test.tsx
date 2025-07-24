import { render, screen } from "@testing-library/react";
import { DropZone } from "../DropZone";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import * as dndKit from "@dnd-kit/core";

// Mock das dependências
jest.mock("@/stores/bio-builder-store");
jest.mock("@dnd-kit/core", () => ({
  ...jest.requireActual("@dnd-kit/core"),
  useDroppable: jest.fn(),
}));

describe("DropZone", () => {
  beforeEach(() => {
    // Mock do store
    (useBioBuilderStore as jest.Mock).mockReturnValue({
      isDragging: false,
      draggedTemplate: null,
    });

    // Mock do useDroppable
    (dndKit.useDroppable as jest.Mock).mockReturnValue({
      isOver: false,
      setNodeRef: jest.fn(),
    });
  });

  it("renderiza os filhos corretamente", () => {
    render(
      <DropZone>
        <div data-testid="test-child">Test Content</div>
      </DropZone>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("configura o useDroppable com os dados corretos", () => {
    render(
      <DropZone>
        <div>Test Content</div>
      </DropZone>
    );

    // Verificar se useDroppable foi chamado com os parâmetros corretos
    expect(dndKit.useDroppable).toHaveBeenCalledWith({
      id: "canvas-drop-zone",
      data: {
        accepts: ["template", "element"],
        isCanvasDropZone: true,
      },
    });
  });

  it("mostra indicador de drop quando está arrastando sobre a área", () => {
    // Configurar o mock para simular arrastando sobre a área
    (useBioBuilderStore as jest.Mock).mockReturnValue({
      isDragging: true,
      draggedTemplate: { name: "Test Template", icon: "📝" },
    });

    (dndKit.useDroppable as jest.Mock).mockReturnValue({
      isOver: true,
      setNodeRef: jest.fn(),
    });

    render(
      <DropZone>
        <div>Test Content</div>
      </DropZone>
    );

    // Verificar se o indicador de drop é mostrado
    expect(screen.getByText(/Solte para adicionar/)).toBeInTheDocument();
  });

  it("não mostra indicador de drop quando não está arrastando sobre a área", () => {
    // Configurar o mock para simular arrastando, mas não sobre a área
    (useBioBuilderStore as jest.Mock).mockReturnValue({
      isDragging: true,
      draggedTemplate: { name: "Test Template", icon: "📝" },
    });

    (dndKit.useDroppable as jest.Mock).mockReturnValue({
      isOver: false,
      setNodeRef: jest.fn(),
    });

    render(
      <DropZone>
        <div>Test Content</div>
      </DropZone>
    );

    // Verificar se o indicador de drop não é mostrado
    expect(screen.queryByText(/Solte para adicionar/)).not.toBeInTheDocument();
  });
});
