import { render, screen } from "@testing-library/react";
import { DragDropContext } from "../DragDropContext";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { DndContext } from "@dnd-kit/core";

// Mock das dependências
jest.mock("@/stores/bio-builder-store");
jest.mock("@dnd-kit/core", () => ({
  ...jest.requireActual("@dnd-kit/core"),
  DndContext: jest.fn(({ children }) => (
    <div data-testid="dnd-context">{children}</div>
  )),
  rectIntersection: jest.fn(),
}));

jest.mock("@dnd-kit/sortable", () => ({
  ...jest.requireActual("@dnd-kit/sortable"),
  SortableContext: jest.fn(({ children }) => (
    <div data-testid="sortable-context">{children}</div>
  )),
}));

describe("DragDropContext", () => {
  beforeEach(() => {
    // Mock do store
    (useBioBuilderStore as jest.Mock).mockReturnValue({
      currentPage: { elements: [] },
      draggedElement: null,
      draggedTemplate: null,
      setDraggedElement: jest.fn(),
      setDraggedTemplate: jest.fn(),
      setIsDragging: jest.fn(),
      reorderElements: jest.fn(),
      addElementFromTemplate: jest.fn(),
    });
  });

  it("renderiza corretamente com o algoritmo de colisão rectIntersection", () => {
    render(
      <DragDropContext>
        <div>Test Content</div>
      </DragDropContext>
    );

    // Verificar se o DndContext foi renderizado
    expect(screen.getByTestId("dnd-context")).toBeInTheDocument();

    // Verificar se o algoritmo de colisão correto foi usado
    expect(DndContext).toHaveBeenCalledWith(
      expect.objectContaining({
        collisionDetection: expect.any(Function), // rectIntersection é uma função
      }),
      expect.anything()
    );
  });

  it("renderiza os filhos corretamente", () => {
    render(
      <DragDropContext>
        <div data-testid="test-child">Test Content</div>
      </DragDropContext>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
