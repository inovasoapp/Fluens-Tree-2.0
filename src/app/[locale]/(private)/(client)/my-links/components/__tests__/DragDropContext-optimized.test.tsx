import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DragDropContext } from "../DragDropContext";
import { useBioBuilderStore } from "@/stores/bio-builder-store";

// Mock the store
vi.mock("@/stores/bio-builder-store");

// Mock the position calculator
vi.mock("@/lib/position-calculator", () => ({
  PositionCalculator: vi.fn().mockImplementation(() => ({
    reset: vi.fn(),
    calculate: vi.fn(),
    getLastCalculation: vi.fn(),
  })),
  createThrottledCalculator: vi.fn().mockImplementation(() => vi.fn()),
}));

// Mock the animation controller
vi.mock("@/lib/animation-controller", () => ({
  animationController: {
    cancelAllAnimations: vi.fn(),
  },
}));

// Mock dnd-kit
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
  PointerSensor: vi.fn(),
  rectIntersection: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  verticalListSortingStrategy: vi.fn(),
}));

describe("DragDropContext - Optimized Implementation", () => {
  const mockStore = {
    currentPage: {
      elements: [
        { id: "element-1", position: 0, type: "text", data: {} },
        { id: "element-2", position: 1, type: "link", data: {} },
      ],
    },
    dragState: {
      draggedElement: null,
      draggedTemplate: null,
      isDragging: false,
    },
    startDragOperation: vi.fn().mockReturnValue("operation-123"),
    endDragOperation: vi.fn(),
    updateDragPosition: vi.fn(),
    applyTemporaryReorganization: vi.fn(),
    revertTemporaryReorganization: vi.fn(),
    performCleanup: vi.fn(),
    reorderElements: vi.fn(),
    addElementFromTemplate: vi.fn(),
    getCurrentElementOrder: vi.fn().mockReturnValue([
      { id: "element-1", position: 0, type: "text", data: {} },
      { id: "element-2", position: 1, type: "link", data: {} },
    ]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useBioBuilderStore as any).mockReturnValue(mockStore);
    (useBioBuilderStore as any).getState = vi.fn().mockReturnValue({
      getCurrentElementOrder: mockStore.getCurrentElementOrder,
    });
  });

  it("renders without crashing", () => {
    render(
      <DragDropContext>
        <div>Test content</div>
      </DragDropContext>
    );

    expect(screen.getByTestId("dnd-context")).toBeInTheDocument();
    expect(screen.getByTestId("sortable-context")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("initializes with correct store methods", () => {
    render(
      <DragDropContext>
        <div>Test content</div>
      </DragDropContext>
    );

    // Verify that the component uses the correct store methods
    expect(useBioBuilderStore).toHaveBeenCalled();
  });

  it("provides drag overlay functionality", () => {
    render(
      <DragDropContext>
        <div>Test content</div>
      </DragDropContext>
    );

    expect(screen.getByTestId("drag-overlay")).toBeInTheDocument();
  });
});
