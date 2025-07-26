import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useBioBuilderStore } from "../bio-builder-store";
import { BioElement, ElementTemplate } from "@/types/bio-builder";

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
  },
};
Object.defineProperty(global, "performance", {
  value: mockPerformance,
  writable: true,
});

describe("Enhanced Drag State Management", () => {
  // Helper function to get current state
  const getState = () => useBioBuilderStore.getState();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset store to initial state
    const store = getState();
    store.performCleanup();
    store.resetPerformanceMetrics();
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up any pending timeouts
    const store = getState();
    store.performCleanup();
  });

  describe("Drag Operation Lifecycle", () => {
    it("should start drag operation with unique ID", () => {
      const mockElement: BioElement = {
        id: "test-element",
        type: "text",
        position: 0,
        data: { content: "Test" },
      };

      const store = getState();
      const operationId = store.startDragOperation(mockElement);
      const currentState = getState();

      expect(operationId).toMatch(/^drag-\d+-[a-z0-9]+$/);
      expect(currentState.dragState.isDragging).toBe(true);
      expect(currentState.dragState.draggedElement).toEqual(mockElement);
      expect(currentState.dragState.dragOperationId).toBe(operationId);
      expect(currentState.dragState.dragStartTime).toBeGreaterThan(0);
    });

    it("should start drag operation with template", () => {
      const mockTemplate: ElementTemplate = {
        id: "test-template",
        type: "link",
        name: "Link Template",
        icon: "link",
        defaultData: { title: "New Link", url: "" },
      };

      const store = getState();
      const operationId = store.startDragOperation(mockTemplate);
      const currentState = getState();

      expect(currentState.dragState.isDragging).toBe(true);
      expect(currentState.dragState.draggedTemplate).toEqual(mockTemplate);
      expect(currentState.dragState.draggedElement).toBeNull();
      expect(currentState.dragState.dragOperationId).toBe(operationId);
    });

    it("should update drag position atomically", () => {
      const mockElement: BioElement = {
        id: "test-element",
        type: "text",
        position: 0,
        data: { content: "Test" },
      };

      const store = getState();
      const operationId = store.startDragOperation(mockElement);
      const initialVersion = getState().dragState.stateVersion.version;

      store.updateDragPosition(2, "bottom");
      const currentState = getState();

      expect(currentState.dragState.dragOverIndex).toBe(2);
      expect(currentState.dragState.insertionPosition).toBe("bottom");
      expect(currentState.dragState.stateVersion.version).toBeGreaterThan(
        initialVersion
      );
      expect(currentState.dragState.lastUpdateTime).toBeGreaterThan(0);
    });

    it("should end drag operation successfully", () => {
      const mockElement: BioElement = {
        id: "test-element",
        type: "text",
        position: 0,
        data: { content: "Test" },
      };

      const store = getState();
      const operationId = store.startDragOperation(mockElement);
      store.updateDragPosition(1, "top");

      store.endDragOperation(operationId, true);
      const currentState = getState();

      expect(currentState.dragState.isDragging).toBe(false);
      expect(currentState.dragState.draggedElement).toBeNull();
      expect(currentState.dragState.dragOperationId).toBeNull();
      expect(currentState.dragState.dragOverIndex).toBeNull();
      expect(currentState.dragState.insertionPosition).toBeNull();
    });

    it("should cancel drag operation and revert state", () => {
      const mockElement: BioElement = {
        id: "test-element",
        type: "text",
        position: 0,
        data: { content: "Test" },
      };

      const store = getState();
      const operationId = store.startDragOperation(mockElement);
      store.updateDragPosition(1, "top");

      store.cancelDragOperation(operationId);
      const currentState = getState();

      expect(currentState.dragState.isDragging).toBe(false);
      expect(currentState.dragState.draggedElement).toBeNull();
      expect(currentState.dragState.temporaryElementOrder).toBeNull();
      expect(currentState.dragState.isTemporaryReorganization).toBe(false);
    });
  });

  describe("Atomic State Updates", () => {
    it("should update state atomically with version increment", () => {
      const store = getState();
      const initialVersion = getState().dragState.stateVersion.version;

      store.atomicDragUpdate((state) => ({
        isDragging: true,
        dragOverIndex: 5,
      }));

      const currentState = getState();
      expect(currentState.dragState.isDragging).toBe(true);
      expect(currentState.dragState.dragOverIndex).toBe(5);
      expect(currentState.dragState.stateVersion.version).toBe(
        initialVersion + 1
      );
    });

    it("should handle concurrent atomic updates", () => {
      const store = getState();
      const initialVersion = getState().dragState.stateVersion.version;

      // Simulate concurrent updates
      store.atomicDragUpdate(() => ({ isDragging: true }));
      store.atomicDragUpdate(() => ({ dragOverIndex: 1 }));
      store.atomicDragUpdate(() => ({ insertionPosition: "bottom" }));

      const currentState = getState();
      expect(currentState.dragState.isDragging).toBe(true);
      expect(currentState.dragState.dragOverIndex).toBe(1);
      expect(currentState.dragState.insertionPosition).toBe("bottom");
      expect(currentState.dragState.stateVersion.version).toBe(
        initialVersion + 3
      );
    });
  });

  describe("Temporary Reorganization", () => {
    beforeEach(() => {
      // Set up a page with elements
      const mockPage = {
        id: "test-page",
        title: "Test Page",
        slug: "test",
        elements: [
          {
            id: "elem-1",
            type: "text" as const,
            position: 0,
            data: { content: "First" },
          },
          {
            id: "elem-2",
            type: "text" as const,
            position: 1,
            data: { content: "Second" },
          },
          {
            id: "elem-3",
            type: "text" as const,
            position: 2,
            data: { content: "Third" },
          },
        ],
        theme: {
          backgroundColor: "#ffffff",
          primaryColor: "#000000",
          secondaryColor: "#666666",
          fontFamily: "Inter",
          backgroundType: "solid" as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const store = getState();
      store.setCurrentPage(mockPage);
    });

    it("should apply temporary reorganization", () => {
      const store = getState();
      const currentPage = getState().currentPage!;
      const operationId = store.startDragOperation(currentPage.elements[0]);

      store.applyTemporaryReorganization("elem-1", 2, operationId);
      const currentState = getState();

      expect(currentState.dragState.isTemporaryReorganization).toBe(true);
      expect(currentState.dragState.temporaryElementOrder).toEqual([
        "elem-2",
        "elem-3",
        "elem-1",
      ]);
    });

    it("should revert temporary reorganization", () => {
      const store = getState();
      const currentPage = getState().currentPage!;
      const operationId = store.startDragOperation(currentPage.elements[0]);
      store.applyTemporaryReorganization("elem-1", 2, operationId);

      store.revertTemporaryReorganization(operationId);
      const currentState = getState();

      expect(currentState.dragState.isTemporaryReorganization).toBe(false);
      expect(currentState.dragState.temporaryElementOrder).toBeNull();
    });

    it("should get current element order with temporary state", () => {
      const store = getState();
      const currentPage = getState().currentPage!;
      const operationId = store.startDragOperation(currentPage.elements[0]);
      store.applyTemporaryReorganization("elem-1", 2, operationId);

      const currentOrder = store.getCurrentElementOrder();

      expect(currentOrder.map((el) => el.id)).toEqual([
        "elem-2",
        "elem-3",
        "elem-1",
      ]);
    });

    it("should get normal element order without temporary state", () => {
      const store = getState();
      const currentOrder = store.getCurrentElementOrder();

      expect(currentOrder.map((el) => el.id)).toEqual([
        "elem-1",
        "elem-2",
        "elem-3",
      ]);
    });

    it("should not apply reorganization for wrong operation ID", () => {
      const store = getState();
      const currentPage = getState().currentPage!;
      const operationId = store.startDragOperation(currentPage.elements[0]);
      const wrongOperationId = "wrong-operation-id";

      store.applyTemporaryReorganization("elem-1", 2, wrongOperationId);
      const currentState = getState();

      expect(currentState.dragState.isTemporaryReorganization).toBe(false);
      expect(currentState.dragState.temporaryElementOrder).toBeNull();
    });
  });

  describe("Performance Monitoring", () => {
    it("should record drag calculations", () => {
      const store = getState();
      const calculationTime = 16.7; // ~60fps

      store.recordDragCalculation(calculationTime);

      const metrics = store.getDragPerformanceMetrics();
      expect(metrics.totalCalculations).toBe(1);
      expect(metrics.averageCalculationTime).toBe(calculationTime);
      expect(metrics.lastCalculationTime).toBeGreaterThan(0);
    });

    it("should calculate average calculation time", () => {
      const store = getState();
      store.recordDragCalculation(10);
      store.recordDragCalculation(20);
      store.recordDragCalculation(30);

      const metrics = store.getDragPerformanceMetrics();
      expect(metrics.totalCalculations).toBe(3);
      expect(metrics.averageCalculationTime).toBe(20);
    });

    it("should cap calculations per second at 60fps", () => {
      const store = getState();
      // Simulate very fast calculations
      mockPerformance.now.mockReturnValueOnce(0).mockReturnValueOnce(1);

      store.recordDragCalculation(1);

      const metrics = store.getDragPerformanceMetrics();
      expect(metrics.calculationsPerSecond).toBeLessThanOrEqual(60);
    });

    it("should reset performance metrics", () => {
      const store = getState();
      store.recordDragCalculation(10);
      store.recordDragCalculation(20);

      store.resetPerformanceMetrics();

      const metrics = store.getDragPerformanceMetrics();
      expect(metrics.totalCalculations).toBe(0);
      expect(metrics.averageCalculationTime).toBe(0);
      expect(metrics.calculationsPerSecond).toBe(0);
    });

    it("should track memory usage", () => {
      const store = getState();
      store.recordDragCalculation(10);

      const metrics = store.getDragPerformanceMetrics();
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0); // Allow 0 in test environment
    });
  });

  describe("Cleanup Management", () => {
    it("should schedule cleanup for drag operation", () => {
      const mockElement: BioElement = {
        id: "test-element",
        type: "text",
        position: 0,
        data: { content: "Test" },
      };

      const store = getState();
      const operationId = store.startDragOperation(mockElement);
      const currentState = getState();

      expect(currentState.dragState.cleanupTimeout).not.toBeNull();
    });

    it("should cancel cleanup when operation ends normally", () => {
      const mockElement: BioElement = {
        id: "test-element",
        type: "text",
        position: 0,
        data: { content: "Test" },
      };

      const store = getState();
      const operationId = store.startDragOperation(mockElement);

      store.endDragOperation(operationId, true);
      const currentState = getState();

      expect(currentState.dragState.cleanupTimeout).toBeNull();
    });

    it("should perform automatic cleanup for abandoned operations", () => {
      const mockElement: BioElement = {
        id: "test-element",
        type: "text",
        position: 0,
        data: { content: "Test" },
      };

      const store = getState();
      const operationId = store.startDragOperation(mockElement);

      // Fast-forward time to trigger cleanup
      vi.advanceTimersByTime(30001);
      const currentState = getState();

      expect(currentState.dragState.isDragging).toBe(false);
      expect(currentState.dragState.abandonedOperations.has(operationId)).toBe(
        true
      );
    });

    it("should clean up abandoned operations set when it gets too large", () => {
      const store = getState();

      // Add many abandoned operations
      for (let i = 0; i < 15; i++) {
        const mockElement: BioElement = {
          id: `test-element-${i}`,
          type: "text",
          position: i,
          data: { content: `Test ${i}` },
        };

        const operationId = store.startDragOperation(mockElement);
        vi.advanceTimersByTime(30001); // Trigger cleanup
      }

      store.performCleanup();
      const currentState = getState();

      expect(
        currentState.dragState.abandonedOperations.size
      ).toBeLessThanOrEqual(5);
    });

    it("should handle manual cleanup", () => {
      const mockElement: BioElement = {
        id: "test-element",
        type: "text",
        position: 0,
        data: { content: "Test" },
      };

      const store = getState();
      const operationId = store.startDragOperation(mockElement);
      store.updateDragPosition(1, "top");

      store.performCleanup(operationId);
      const currentState = getState();

      expect(currentState.dragState.isDragging).toBe(false);
      expect(currentState.dragState.cleanupTimeout).toBeNull();
    });
  });

  describe("Legacy Compatibility", () => {
    it("should maintain backward compatibility with setIsDragging", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const store = getState();
      store.setIsDragging(true);
      const currentState = getState();

      expect(currentState.dragState.isDragging).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("setIsDragging is deprecated")
      );

      consoleSpy.mockRestore();
    });

    it("should maintain backward compatibility with setDraggedElement", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockElement: BioElement = {
        id: "test-element",
        type: "text",
        position: 0,
        data: { content: "Test" },
      };

      const store = getState();
      store.setDraggedElement(mockElement);
      const currentState = getState();

      expect(currentState.dragState.draggedElement).toEqual(mockElement);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("setDraggedElement is deprecated")
      );

      consoleSpy.mockRestore();
    });

    it("should maintain backward compatibility with clearDragOverState", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const store = getState();
      store.atomicDragUpdate(() => ({
        dragOverIndex: 1,
        insertionPosition: "top",
      }));

      store.clearDragOverState();
      const currentState = getState();

      expect(currentState.dragState.dragOverIndex).toBeNull();
      expect(currentState.dragState.insertionPosition).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("clearDragOverState is deprecated")
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid operation IDs gracefully", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const store = getState();
      store.endDragOperation("invalid-operation-id", true);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Attempted to end drag operation")
      );

      consoleSpy.mockRestore();
    });

    it("should handle missing current page in reorganization", () => {
      const store = getState();
      store.setCurrentPage(null as any);
      const operationId = "test-operation";

      // Should not throw error
      expect(() => {
        store.applyTemporaryReorganization("elem-1", 2, operationId);
      }).not.toThrow();
    });

    it("should handle missing element in reorganization", () => {
      const mockPage = {
        id: "test-page",
        title: "Test Page",
        slug: "test",
        elements: [
          {
            id: "elem-1",
            type: "text" as const,
            position: 0,
            data: { content: "First" },
          },
        ],
        theme: {
          backgroundColor: "#ffffff",
          primaryColor: "#000000",
          secondaryColor: "#666666",
          fontFamily: "Inter",
          backgroundType: "solid" as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const store = getState();
      store.setCurrentPage(mockPage);
      const operationId = store.startDragOperation(mockPage.elements[0]);

      // Should not throw error for non-existent element
      expect(() => {
        store.applyTemporaryReorganization(
          "non-existent-element",
          2,
          operationId
        );
      }).not.toThrow();

      const currentState = getState();
      expect(currentState.dragState.isTemporaryReorganization).toBe(false);
    });
  });
});
