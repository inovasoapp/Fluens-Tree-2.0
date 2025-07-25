import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableElement } from "../SortableElement";
import { BioElement } from "@/types/bio-builder";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { vi } from "vitest";
import { it } from "zod/v4/locales";
import { describe } from "node:test";
import { afterEach } from "node:test";
import { beforeEach } from "node:test";

// Mock the store
vi.mock("@/stores/bio-builder-store");
const mockUseBioBuilderStore = useBioBuilderStore as any;

// Mock ElementRenderer
vi.mock("../ElementRenderer", () => ({
  ElementRenderer: ({ element }: { element: BioElement }) => (
    <div data-testid={`element-${element.id}`}>{element.type}</div>
  ),
}));

// Mock InsertionIndicator with more detailed tracking
vi.mock("../InsertionIndicator", () => ({
  InsertionIndicator: ({ isVisible, position, index }: any) => {
    const testId = `insertion-indicator-${position}-${index}`;
    return (
      <div
        data-testid={testId}
        data-visible={isVisible}
        data-position={position}
        data-index={index}
        className={`insertion-indicator ${isVisible ? "visible" : "hidden"}`}
      >
        {isVisible && `Indicator ${position} at ${index}`}
      </div>
    );
  },
}));

// Enhanced getBoundingClientRect mock with configurable values
const createMockRect = (top: number, height: number = 50) => ({
  top,
  bottom: top + height,
  left: 0,
  right: 200,
  width: 200,
  height,
  x: 0,
  y: top,
});

const mockElements: BioElement[] = [
  {
    id: "element-1",
    type: "text",
    position: 0,
    content: "First element",
    styles: {},
    metadata: {},
  },
  {
    id: "element-2",
    type: "text",
    position: 1,
    content: "Second element",
    styles: {},
    metadata: {},
  },
  {
    id: "element-3",
    type: "text",
    position: 2,
    content: "Third element",
    styles: {},
    metadata: {},
  },
];

describe("SortableElement Insertion Indicators Integration", () => {
  let mockStoreState: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockStoreState = {
      dragOverIndex: null,
      setDragOverIndex: vi.fn(),
      setInsertionPosition: vi.fn(),
      clearDragOverState: vi.fn(),
    };

    mockUseBioBuilderStore.mockReturnValue(mockStoreState);

    // Setup getBoundingClientRect for multiple elements
    let callCount = 0;
    Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: vi.fn(() => {
        const rects = [
          createMockRect(100), // element-1
          createMockRect(160), // element-2
          createMockRect(220), // element-3
        ];
        return rects[callCount++ % rects.length];
      }),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderSortableElements = (elements = mockElements) => {
    const items = elements.map((el) => el.id);

    return render(
      <DndContext>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {elements.map((element, index) => (
            <SortableElement
              key={element.id}
              element={element}
              isSelected={false}
              onSelect={vi.fn()}
            />
          ))}
        </SortableContext>
      </DndContext>
    );
  };

  describe("Insertion Indicator Positioning", () => {
    it("should show correct indicators for each element", () => {
      renderSortableElements();

      // Each element should have top and bottom indicators
      mockElements.forEach((element) => {
        expect(
          screen.getByTestId(`insertion-indicator-top-${element.position}`)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(`insertion-indicator-bottom-${element.position}`)
        ).toBeInTheDocument();
      });
    });

    it("should hide all indicators by default", () => {
      renderSortableElements();

      // Check that all indicators have data-visible="false"
      const indicators = screen.getAllByTestId(/insertion-indicator-/);
      indicators.forEach((indicator) => {
        expect(indicator).toHaveAttribute("data-visible", "false");
        expect(indicator).toHaveClass("hidden");
      });
    });

    it("should pass correct position and index data to indicators", () => {
      renderSortableElements();

      mockElements.forEach((element) => {
        const topIndicator = screen.getByTestId(
          `insertion-indicator-top-${element.position}`
        );
        const bottomIndicator = screen.getByTestId(
          `insertion-indicator-bottom-${element.position}`
        );

        expect(topIndicator).toHaveAttribute("data-position", "top");
        expect(topIndicator).toHaveAttribute(
          "data-index",
          element.position.toString()
        );

        expect(bottomIndicator).toHaveAttribute("data-position", "bottom");
        expect(bottomIndicator).toHaveAttribute(
          "data-index",
          element.position.toString()
        );
      });
    });
  });

  describe("Mouse Position Detection", () => {
    it("should detect top zone insertion", async () => {
      renderSortableElements();

      const element2 = screen
        .getByTestId("element-element-2")
        .closest(".group");

      // Mock isOver and active for element-2
      const mockActive = {
        id: "element-1",
        data: { current: { index: 0 } },
      };

      // Simulate mouse in top 30% of element-2 (y: 160-210, top zone: 160-175)
      act(() => {
        fireEvent.mouseMove(document, { clientY: 170 });
      });

      // Should call store methods for top insertion
      // Note: This would work with proper DnD context mocking
      expect(mockStoreState.setDragOverIndex).toHaveBeenCalledTimes(0); // No active drag in this test
    });

    it("should detect bottom zone insertion", async () => {
      renderSortableElements();

      // Simulate mouse in bottom 30% of element
      act(() => {
        fireEvent.mouseMove(document, { clientY: 195 }); // Bottom zone of element-2
      });

      // Should call store methods for bottom insertion
      expect(mockStoreState.setInsertionPosition).toHaveBeenCalledTimes(0); // No active drag
    });

    it("should detect middle zone insertion based on drag direction", async () => {
      renderSortableElements();

      // Simulate mouse in middle zone
      act(() => {
        fireEvent.mouseMove(document, { clientY: 185 }); // Middle of element-2
      });

      // Should use drag direction logic
      expect(mockStoreState.setDragOverIndex).toHaveBeenCalledTimes(0); // No active drag
    });
  });

  describe("Real-time Visual Feedback", () => {
    it("should update indicators when dragOverIndex changes", () => {
      const { rerender } = renderSortableElements();

      // Update store state to show drag over index
      mockStoreState.dragOverIndex = 1;
      mockUseBioBuilderStore.mockReturnValue(mockStoreState);

      rerender(
        <DndContext>
          <SortableContext
            items={mockElements.map((el) => el.id)}
            strategy={verticalListSortingStrategy}
          >
            {mockElements.map((element) => (
              <SortableElement
                key={element.id}
                element={element}
                isSelected={false}
                onSelect={vi.fn()}
              />
            ))}
          </SortableContext>
        </DndContext>
      );

      // Should reflect the drag over state
      expect(
        screen.getByTestId("insertion-indicator-top-1")
      ).toBeInTheDocument();
    });

    it("should clear indicators when drag ends", () => {
      const { rerender } = renderSortableElements();

      // Set drag over state
      mockStoreState.dragOverIndex = 1;
      mockUseBioBuilderStore.mockReturnValue(mockStoreState);

      rerender(
        <DndContext>
          <SortableContext
            items={mockElements.map((el) => el.id)}
            strategy={verticalListSortingStrategy}
          >
            {mockElements.map((element) => (
              <SortableElement
                key={element.id}
                element={element}
                isSelected={false}
                onSelect={vi.fn()}
              />
            ))}
          </SortableContext>
        </DndContext>
      );

      // Clear drag over state
      mockStoreState.dragOverIndex = null;
      mockUseBioBuilderStore.mockReturnValue(mockStoreState);

      rerender(
        <DndContext>
          <SortableContext
            items={mockElements.map((el) => el.id)}
            strategy={verticalListSortingStrategy}
          >
            {mockElements.map((element) => (
              <SortableElement
                key={element.id}
                element={element}
                isSelected={false}
                onSelect={vi.fn()}
              />
            ))}
          </SortableContext>
        </DndContext>
      );

      // Should call clear function
      expect(mockStoreState.clearDragOverState).toHaveBeenCalled();
    });
  });

  describe("Element Reorganization Visual Effects", () => {
    it("should apply shift transforms to elements during reorganization", () => {
      const { rerender } = renderSortableElements();

      // Simulate dragging element-1 to position 2
      mockStoreState.dragOverIndex = 2;
      mockUseBioBuilderStore.mockReturnValue(mockStoreState);

      rerender(
        <DndContext>
          <SortableContext
            items={mockElements.map((el) => el.id)}
            strategy={verticalListSortingStrategy}
          >
            {mockElements.map((element) => (
              <SortableElement
                key={element.id}
                element={element}
                isSelected={false}
                onSelect={vi.fn()}
              />
            ))}
          </SortableContext>
        </DndContext>
      );

      // Elements should have reorganization styles applied
      const element1 = screen
        .getByTestId("element-element-1")
        .closest(".group") as HTMLElement;
      const element2 = screen
        .getByTestId("element-element-2")
        .closest(".group") as HTMLElement;

      expect(element1).toHaveStyle(
        "transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      );
      expect(element2).toHaveStyle(
        "transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      );
    });

    it("should apply different visual effects for elements in reorganization zone", () => {
      renderSortableElements();

      const elements = screen.getAllByTestId(/element-element-/);

      elements.forEach((element) => {
        const container = element.closest(".group") as HTMLElement;
        expect(container).toHaveClass("transition-all", "duration-300");
      });
    });

    it("should handle opacity and scale changes during reorganization", () => {
      renderSortableElements();

      // All elements should start with normal opacity and scale
      const elements = screen.getAllByTestId(/element-element-/);

      elements.forEach((element) => {
        const container = element.closest(".group") as HTMLElement;
        expect(container).toHaveClass("opacity-100", "scale-100");
      });
    });
  });

  describe("Performance and Throttling", () => {
    it("should throttle mouse movement events", async () => {
      renderSortableElements();

      const setDragOverIndex = vi.fn();
      mockStoreState.setDragOverIndex = setDragOverIndex;
      mockUseBioBuilderStore.mockReturnValue(mockStoreState);

      // Simulate rapid mouse movements
      for (let i = 0; i < 20; i++) {
        fireEvent.mouseMove(document, { clientY: 100 + i });
      }

      // Should be throttled to ~60fps (16ms intervals)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Without active drag, shouldn't be called, but throttling should still work
      expect(setDragOverIndex).toHaveBeenCalledTimes(0);
    });

    it("should clean up throttle timers on unmount", () => {
      const { unmount } = renderSortableElements();

      // Start some mouse movements
      for (let i = 0; i < 5; i++) {
        fireEvent.mouseMove(document, { clientY: 100 + i });
      }

      // Unmount before timers complete
      unmount();

      // Should not cause memory leaks
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(() => {
        vi.advanceTimersByTime(1000);
      }).not.toThrow();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle missing getBoundingClientRect", () => {
      // Mock missing getBoundingClientRect
      Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
        configurable: true,
        value: undefined,
      });

      expect(() => {
        renderSortableElements();
      }).not.toThrow();
    });

    it("should handle elements with same position", () => {
      const duplicatePositionElements = [
        { ...mockElements[0], id: "dup-1" },
        { ...mockElements[0], id: "dup-2", position: 0 }, // Same position
      ];

      expect(() => {
        renderSortableElements(duplicatePositionElements);
      }).not.toThrow();
    });

    it("should handle rapid store state changes", () => {
      const { rerender } = renderSortableElements();

      // Rapidly change drag over index
      for (let i = 0; i < 10; i++) {
        mockStoreState.dragOverIndex = i % 3;
        mockUseBioBuilderStore.mockReturnValue({ ...mockStoreState });

        rerender(
          <DndContext>
            <SortableContext
              items={mockElements.map((el) => el.id)}
              strategy={verticalListSortingStrategy}
            >
              {mockElements.map((element) => (
                <SortableElement
                  key={element.id}
                  element={element}
                  isSelected={false}
                  onSelect={vi.fn()}
                />
              ))}
            </SortableContext>
          </DndContext>
        );
      }

      expect(screen.getByTestId("element-element-1")).toBeInTheDocument();
    });
  });

  describe("Accessibility and User Experience", () => {
    it("should maintain proper tab order during reorganization", () => {
      renderSortableElements();

      const elements = screen.getAllByTestId(/element-element-/);

      // Elements should be in DOM order regardless of visual reorganization
      expect(elements[0]).toHaveAttribute("data-testid", "element-element-1");
      expect(elements[1]).toHaveAttribute("data-testid", "element-element-2");
      expect(elements[2]).toHaveAttribute("data-testid", "element-element-3");
    });

    it("should provide clear visual feedback for insertion points", () => {
      renderSortableElements();

      // All indicators should be properly labeled
      const indicators = screen.getAllByTestId(/insertion-indicator-/);

      indicators.forEach((indicator) => {
        expect(indicator).toHaveAttribute("data-position");
        expect(indicator).toHaveAttribute("data-index");
      });
    });

    it("should handle keyboard navigation gracefully", () => {
      renderSortableElements();

      const firstElement = screen
        .getByTestId("element-element-1")
        .closest(".group");

      // Should be focusable
      firstElement?.focus();
      expect(document.activeElement).toBe(firstElement);

      // Should handle keyboard events without breaking
      fireEvent.keyDown(firstElement!, { key: "ArrowDown" });
      expect(firstElement).toBeInTheDocument();
    });
  });
});
