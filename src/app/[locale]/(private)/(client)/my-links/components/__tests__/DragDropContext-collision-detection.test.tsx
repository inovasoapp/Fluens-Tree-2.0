import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DragDropContext } from "../DragDropContext";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { PositionCalculator } from "@/lib/position-calculator";
import { animationController } from "@/lib/animation-controller";

// Mock the store
vi.mock("@/stores/bio-builder-store");

// Mock the position calculator
const mockPositionCalculator = {
  reset: vi.fn(),
  calculate: vi.fn(),
  getLastCalculation: vi.fn(),
};

vi.mock("@/lib/position-calculator", () => ({
  PositionCalculator: vi.fn().mockImplementation(() => mockPositionCalculator),
  createThrottledCalculator: vi
    .fn()
    .mockImplementation((calculator, throttle) => {
      return vi
        .fn()
        .mockImplementation(
          (mouseY, elementRect, draggedIndex, targetIndex) => ({
            insertionIndex: targetIndex,
            position: "top",
            confidence: 0.9,
            zone: "top",
            usedDirectionHeuristic: false,
          })
        );
    }),
}));

// Mock the animation controller
vi.mock("@/lib/animation-controller", () => ({
  animationController: {
    cancelAllAnimations: vi.fn(),
  },
}));

// Mock dnd-kit with more realistic behavior
const mockDragStartEvent = {
  active: { id: "element-1" },
};

const mockDragOverEvent = {
  active: { id: "element-1" },
  over: { id: "element-2" },
  activatorEvent: { clientX: 100, clientY: 200 },
};

const mockDragEndEvent = {
  active: { id: "element-1" },
  over: { id: "element-2" },
};

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragStart, onDragOver, onDragEnd }: any) => {
    // Store handlers for testing
    (global as any).mockDragHandlers = { onDragStart, onDragOver, onDragEnd };
    return <div data-testid="dnd-context">{children}</div>;
  },
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  useSensor: vi.fn(),
  useSensors: vi.fn().mockReturnValue([]),
  PointerSensor: vi.fn(),
  rectIntersection: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  verticalListSortingStrategy: vi.fn(),
}));

describe("DragDropContext - Collision Detection Optimization", () => {
  const mockStore = {
    currentPage: {
      elements: [
        { id: "element-1", position: 0, type: "text", data: {} },
        { id: "element-2", position: 1, type: "link", data: {} },
        { id: "element-3", position: 2, type: "image", data: {} },
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
      { id: "element-3", position: 2, type: "image", data: {} },
    ]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useBioBuilderStore as any).mockReturnValue(mockStore);
    (useBioBuilderStore as any).getState = vi.fn().mockReturnValue({
      getCurrentElementOrder: () => mockStore.getCurrentElementOrder(),
    });

    // Mock DOM elements for position calculation
    const mockElement = {
      getBoundingClientRect: vi.fn().mockReturnValue({
        top: 100,
        bottom: 150,
        left: 50,
        right: 200,
        width: 150,
        height: 50,
      }),
    };

    vi.spyOn(document, "querySelector").mockReturnValue(mockElement as any);

    // Clear global handlers
    (global as any).mockDragHandlers = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Precise Position Calculation", () => {
    it("should use throttled position calculator during drag over", async () => {
      render(
        <DragDropContext>
          <div>Test content</div>
        </DragDropContext>
      );

      const handlers = (global as any).mockDragHandlers;

      // Start drag operation
      handlers.onDragStart(mockDragStartEvent);
      expect(mockStore.startDragOperation).toHaveBeenCalledWith(
        mockStore.currentPage.elements[0]
      );

      // Simulate drag over with position calculation
      handlers.onDragOver(mockDragOverEvent);

      // Verify position calculator was used
      await waitFor(() => {
        expect(mockStore.updateDragPosition).toHaveBeenCalled();
        expect(mockStore.applyTemporaryReorganization).toHaveBeenCalled();
      });
    });

    it("should handle invalid mouse positions gracefully", async () => {
      render(
        <DragDropContext>
          <div>Test content</div>
        </DragDropContext>
      );

      const handlers = (global as any).mockDragHandlers;

      // Start drag operation
      handlers.onDragStart(mockDragStartEvent);

      // Simulate drag over with invalid position
      const invalidDragOverEvent = {
        ...mockDragOverEvent,
        activatorEvent: { clientX: -100, clientY: -200 },
      };

      handlers.onDragOver(invalidDragOverEvent);

      // Should not crash and should handle gracefully
      expect(mockStore.performCleanup).not.toHaveBeenCalled();
    });
  });

  describe("Debounced State Updates", () => {
    it("should debounce rapid drag over events", async () => {
      vi.useFakeTimers();

      render(
        <DragDropContext>
          <div>Test content</div>
        </DragDropContext>
      );

      const handlers = (global as any).mockDragHandlers;

      // Start drag operation
      handlers.onDragStart(mockDragStartEvent);

      // Simulate rapid drag over events
      for (let i = 0; i < 10; i++) {
        handlers.onDragOver({
          ...mockDragOverEvent,
          activatorEvent: { clientX: 100 + i, clientY: 200 + i },
        });
      }

      // Fast-forward timers to trigger debounced updates
      vi.advanceTimersByTime(50);

      // Should have batched the updates
      await waitFor(() => {
        expect(mockStore.updateDragPosition).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });

    it("should prevent excessive re-renders with small mouse movements", async () => {
      render(
        <DragDropContext>
          <div>Test content</div>
        </DragDropContext>
      );

      const handlers = (global as any).mockDragHandlers;

      // Start drag operation
      handlers.onDragStart(mockDragStartEvent);

      // Simulate very small mouse movements (should be filtered out)
      handlers.onDragOver({
        ...mockDragOverEvent,
        activatorEvent: { clientX: 100, clientY: 200 },
      });

      handlers.onDragOver({
        ...mockDragOverEvent,
        activatorEvent: { clientX: 101, clientY: 201 }, // 1px movement
      });

      // Should not trigger multiple updates for tiny movements
      await waitFor(() => {
        expect(mockStore.updateDragPosition).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Cleanup for Interrupted Operations", () => {
    it("should cleanup interrupted operations on component unmount", () => {
      const { unmount } = render(
        <DragDropContext>
          <div>Test content</div>
        </DragDropContext>
      );

      const handlers = (global as any).mockDragHandlers;

      // Start drag operation
      handlers.onDragStart(mockDragStartEvent);

      // Unmount component (simulates interruption)
      unmount();

      // Should have called cleanup
      expect(mockStore.performCleanup).toHaveBeenCalled();
      expect(animationController.cancelAllAnimations).toHaveBeenCalled();
      expect(mockPositionCalculator.reset).toHaveBeenCalled();
    });

    it("should cleanup on invalid drop areas", async () => {
      render(
        <DragDropContext>
          <div>Test content</div>
        </DragDropContext>
      );

      const handlers = (global as any).mockDragHandlers;

      // Start drag operation
      handlers.onDragStart(mockDragStartEvent);

      // End drag on invalid area
      const invalidDragEndEvent = {
        active: { id: "element-1" },
        over: null, // No valid drop area
      };

      handlers.onDragEnd(invalidDragEndEvent);

      // Should have cleaned up the operation
      expect(mockStore.performCleanup).toHaveBeenCalled();
    });

    it("should handle consecutive invalid positions", async () => {
      render(
        <DragDropContext>
          <div>Test content</div>
        </DragDropContext>
      );

      const handlers = (global as any).mockDragHandlers;

      // Start drag operation
      handlers.onDragStart(mockDragStartEvent);

      // Simulate many invalid positions (should trigger cleanup)
      for (let i = 0; i < 15; i++) {
        handlers.onDragOver({
          active: { id: "element-1" },
          over: null, // Invalid drop area
          activatorEvent: { clientX: 100, clientY: 200 },
        });
      }

      // Should eventually cleanup due to too many invalid positions
      await waitFor(() => {
        expect(mockStore.performCleanup).toHaveBeenCalled();
      });
    });
  });

  describe("Drag Operation Validation", () => {
    it("should validate drag operation consistency", async () => {
      render(
        <DragDropContext>
          <div>Test content</div>
        </DragDropContext>
      );

      const handlers = (global as any).mockDragHandlers;

      // Start drag operation
      handlers.onDragStart(mockDragStartEvent);
      expect(mockStore.startDragOperation).toHaveBeenCalled();

      // Valid drag over
      handlers.onDragOver(mockDragOverEvent);

      // End drag operation
      handlers.onDragEnd(mockDragEndEvent);
      expect(mockStore.endDragOperation).toHaveBeenCalledWith(
        "operation-123",
        true
      );
    });

    it("should handle drag timeout scenarios", async () => {
      vi.useFakeTimers();

      render(
        <DragDropContext>
          <div>Test content</div>
        </DragDropContext>
      );

      const handlers = (global as any).mockDragHandlers;

      // Start drag operation
      handlers.onDragStart(mockDragStartEvent);

      // Fast-forward time beyond timeout (30 seconds)
      vi.advanceTimersByTime(31000);

      // Try to continue drag operation
      handlers.onDragOver(mockDragOverEvent);

      // Should handle timeout gracefully
      expect(mockStore.performCleanup).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe("Performance Monitoring", () => {
    it("should track performance metrics during drag operations", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      render(
        <DragDropContext>
          <div>Test content</div>
        </DragDropContext>
      );

      const handlers = (global as any).mockDragHandlers;

      // Start drag operation
      handlers.onDragStart(mockDragStartEvent);

      // Perform several drag over events
      for (let i = 0; i < 5; i++) {
        handlers.onDragOver({
          ...mockDragOverEvent,
          activatorEvent: { clientX: 100 + i * 10, clientY: 200 + i * 10 },
        });
      }

      // End drag operation
      handlers.onDragEnd(mockDragEndEvent);

      // Should have logged performance metrics
      expect(consoleSpy).toHaveBeenCalledWith(
        "Drag operation performance:",
        expect.objectContaining({
          operationId: expect.any(String),
          dragOverEvents: expect.any(Number),
          validPositions: expect.any(Number),
          invalidPositions: expect.any(Number),
          averageCalculationTime: expect.any(Number),
          successRate: expect.any(Number),
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
