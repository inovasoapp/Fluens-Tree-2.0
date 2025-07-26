import { render, screen, waitFor } from "@testing-library/react";
import { DragOperationStatus } from "../DragOperationStatus";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { vi } from "vitest";

// Mock the store
vi.mock("@/stores/bio-builder-store");
const mockUseBioBuilderStore = useBioBuilderStore as any;

describe("DragOperationStatus", () => {
  const mockDragState = {
    isDragging: false,
    draggedElement: null,
    draggedTemplate: null,
    dragOverIndex: null,
    insertionPosition: null,
    temporaryElementOrder: null,
    isTemporaryReorganization: false,
    dragStartTime: null,
    dragOperationId: null,
    lastUpdateTime: 0,
    stateVersion: {
      version: 1,
      timestamp: Date.now(),
      operationId: "test-op",
    },
    performanceMetrics: {
      calculationsPerSecond: 0,
      lastCalculationTime: 0,
      totalCalculations: 0,
      averageCalculationTime: 0,
      memoryUsage: 0,
      activeAnimations: 0,
    },
    cleanupTimeout: null,
    abandonedOperations: new Set(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBioBuilderStore.mockReturnValue({
      dragState: mockDragState,
    });
  });

  it("should not render when drag operation is idle", () => {
    render(<DragOperationStatus />);

    expect(screen.queryByText("Ready")).not.toBeInTheDocument();
    expect(screen.queryByText("Dragging element")).not.toBeInTheDocument();
  });

  it("should render starting status when operation starts", () => {
    mockUseBioBuilderStore.mockReturnValue({
      dragState: {
        ...mockDragState,
        dragOperationId: "test-operation",
        draggedTemplate: {
          id: "text",
          name: "Text Element",
          icon: "📝",
        },
      },
    });

    render(<DragOperationStatus />);

    expect(screen.getByText("Starting drag operation...")).toBeInTheDocument();
    expect(screen.getByText("Text Element")).toBeInTheDocument();
  });

  it("should render dragging status when actively dragging", () => {
    mockUseBioBuilderStore.mockReturnValue({
      dragState: {
        ...mockDragState,
        isDragging: true,
        draggedElement: {
          id: "test-element",
          type: "text",
          data: { text: "Test Element" },
          position: 0,
        },
      },
    });

    render(<DragOperationStatus />);

    expect(screen.getByText("Dragging element")).toBeInTheDocument();
    expect(screen.getByText("Test Element")).toBeInTheDocument();
  });

  it("should render positioning status when finding position", () => {
    mockUseBioBuilderStore.mockReturnValue({
      dragState: {
        ...mockDragState,
        isDragging: true,
        dragOverIndex: 1,
        insertionPosition: "top",
        draggedElement: {
          id: "test-element",
          type: "text",
          data: { text: "Test Element" },
          position: 0,
        },
      },
    });

    render(<DragOperationStatus />);

    expect(screen.getByText("Finding position...")).toBeInTheDocument();
    expect(screen.getByText("Position: top")).toBeInTheDocument();
  });

  it("should apply correct CSS classes for different statuses", () => {
    const { rerender } = render(<DragOperationStatus />);

    // Test starting status
    mockUseBioBuilderStore.mockReturnValue({
      dragState: {
        ...mockDragState,
        dragOperationId: "test-operation",
        draggedTemplate: { id: "text", name: "Text", icon: "📝" },
      },
    });

    rerender(<DragOperationStatus />);

    const container = screen
      .getByText("Starting drag operation...")
      .closest("div")?.parentElement;
    expect(container).toHaveClass(
      "bg-blue-50",
      "border-blue-300",
      "animate-pulse"
    );
  });

  it("should handle missing element names gracefully", () => {
    mockUseBioBuilderStore.mockReturnValue({
      dragState: {
        ...mockDragState,
        isDragging: true,
        draggedElement: {
          id: "test-element",
          type: "text",
          data: {},
          position: 0,
        },
      },
    });

    render(<DragOperationStatus />);

    expect(screen.getByText("Dragging element")).toBeInTheDocument();
    expect(screen.getByText("Element")).toBeInTheDocument();
  });
});
