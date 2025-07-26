import { describe, it, expect, beforeEach, afterEach, vi, Mock } from "vitest";
import {
  AnimationController,
  animationController,
} from "../animation-controller";

// Mock DOM methods
const mockElement = {
  style: {} as CSSStyleDeclaration,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  getBoundingClientRect: vi.fn(() => ({
    top: 100,
    left: 0,
    width: 200,
    height: 50,
    right: 200,
    bottom: 150,
  })),
};

// Mock document methods
Object.defineProperty(global, "document", {
  value: {
    getElementById: vi.fn(),
    querySelector: vi.fn(),
  },
  writable: true,
});

// Mock performance API
Object.defineProperty(global, "performance", {
  value: {
    now: vi.fn(() => Date.now()),
  },
  writable: true,
});

// Mock requestAnimationFrame
Object.defineProperty(global, "requestAnimationFrame", {
  value: vi.fn((callback: FrameRequestCallback) => {
    setTimeout(callback, 16); // ~60fps
    return 1;
  }),
  writable: true,
});

describe("AnimationController", () => {
  let controller: AnimationController;
  let mockGetElementById: Mock;
  let mockQuerySelector: Mock;

  beforeEach(() => {
    controller = new AnimationController();
    mockGetElementById = document.getElementById as Mock;
    mockQuerySelector = document.querySelector as Mock;

    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock element behavior
    mockGetElementById.mockReturnValue(mockElement);
    mockQuerySelector.mockReturnValue(mockElement);

    // Reset mock element
    mockElement.style = {} as CSSStyleDeclaration;
    mockElement.addEventListener.mockClear();
    mockElement.removeEventListener.mockClear();
  });

  afterEach(() => {
    controller.cleanup();
  });

  describe("animateElementShift", () => {
    it("should animate element shift with correct transform", async () => {
      const elementId = "test-element";
      const direction = "down";
      const distance = 50;

      // Mock successful animation
      mockElement.addEventListener.mockImplementation((event, callback) => {
        if (event === "transitionend") {
          setTimeout(
            () => callback({ target: mockElement, propertyName: "transform" }),
            100
          );
        }
      });

      const promise = controller.animateElementShift(
        elementId,
        direction,
        distance
      );

      // Check that element styles are set correctly
      expect(mockElement.style.transform).toBe("translate3d(0, 50px, 0)");
      expect(mockElement.style.transition).toContain("transform");
      expect(mockElement.style.willChange).toBe("transform");

      await promise;

      // Check cleanup
      expect(mockElement.style.willChange).toBe("auto");
    });

    it("should animate element shift upward with negative transform", async () => {
      const elementId = "test-element";
      const direction = "up";
      const distance = 30;

      mockElement.addEventListener.mockImplementation((event, callback) => {
        if (event === "transitionend") {
          setTimeout(
            () => callback({ target: mockElement, propertyName: "transform" }),
            100
          );
        }
      });

      await controller.animateElementShift(elementId, direction, distance);

      expect(mockElement.style.transform).toBe("translate3d(0, -30px, 0)");
    });

    it("should handle element not found gracefully", async () => {
      mockGetElementById.mockReturnValue(null);
      mockQuerySelector.mockReturnValue(null);

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await controller.animateElementShift("non-existent", "down", 50);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Element with id non-existent not found for animation"
      );

      consoleSpy.mockRestore();
    });

    it("should cancel existing animation before starting new one", async () => {
      const elementId = "test-element";

      // Mock successful animation for second call
      mockElement.addEventListener.mockImplementation((event, callback) => {
        if (event === "transitionend") {
          setTimeout(
            () => callback({ target: mockElement, propertyName: "transform" }),
            50
          );
        }
      });

      // Start first animation (will be cancelled)
      const promise1 = controller.animateElementShift(elementId, "down", 50);

      // Check that animation is active
      expect(controller.getAnimationState(elementId)).toBeDefined();

      // Start second animation (should cancel first)
      const promise2 = controller.animateElementShift(elementId, "up", 30);

      // Wait for second animation to complete
      await promise2;

      // First animation should have been cancelled (we can't easily test the rejection in this setup)
      expect(controller.getAnimationState(elementId)).toBeUndefined();
    });

    it("should use custom animation config", async () => {
      const customConfig = {
        duration: 500,
        easing: "ease-in-out",
      };

      mockElement.addEventListener.mockImplementation((event, callback) => {
        if (event === "transitionend") {
          setTimeout(
            () => callback({ target: mockElement, propertyName: "transform" }),
            100
          );
        }
      });

      await controller.animateElementShift(
        "test-element",
        "down",
        50,
        customConfig
      );

      expect(mockElement.style.transition).toContain("500ms");
      expect(mockElement.style.transition).toContain("ease-in-out");
    });
  });

  describe("animateStaggeredShifts", () => {
    it("should animate multiple elements with stagger delay", async () => {
      const animations = [
        { elementId: "element-1", direction: "down" as const, distance: 50 },
        { elementId: "element-2", direction: "down" as const, distance: 50 },
        { elementId: "element-3", direction: "down" as const, distance: 50 },
      ];

      // Mock multiple elements
      const mockElements = animations.map(() => ({ ...mockElement }));
      mockGetElementById.mockImplementation((id) => {
        const index = parseInt(id.split("-")[1]) - 1;
        return mockElements[index] || null;
      });

      // Mock successful animations
      mockElements.forEach((element) => {
        element.addEventListener = vi
          .fn()
          .mockImplementation((event, callback) => {
            if (event === "transitionend") {
              setTimeout(
                () => callback({ target: element, propertyName: "transform" }),
                100
              );
            }
          });
      });

      const startTime = Date.now();
      await controller.animateStaggeredShifts(animations, { stagger: 100 });
      const endTime = Date.now();

      // Should take at least the stagger time for multiple elements
      expect(endTime - startTime).toBeGreaterThan(150); // Some buffer for timing

      // All elements should have been animated
      mockElements.forEach((element) => {
        expect(element.style.transform).toBe("translate3d(0, 50px, 0)");
      });
    });

    it("should handle empty animations array", async () => {
      await expect(
        controller.animateStaggeredShifts([])
      ).resolves.toBeUndefined();
    });

    it("should continue with other animations if one fails", async () => {
      const animations = [
        { elementId: "element-1", direction: "down" as const, distance: 50 },
        { elementId: "non-existent", direction: "down" as const, distance: 50 },
        { elementId: "element-3", direction: "down" as const, distance: 50 },
      ];

      mockGetElementById.mockImplementation((id) => {
        if (id === "non-existent") return null;
        return mockElement;
      });

      mockElement.addEventListener.mockImplementation((event, callback) => {
        if (event === "transitionend") {
          setTimeout(
            () => callback({ target: mockElement, propertyName: "transform" }),
            50
          );
        }
      });

      // Should not throw an error even if some elements don't exist
      await expect(
        controller.animateStaggeredShifts(animations)
      ).resolves.toBeUndefined();
    });
  });

  describe("animateInsertionIndicator", () => {
    it("should show indicator with scale and opacity animation", async () => {
      const elementId = "indicator-1";

      mockElement.addEventListener.mockImplementation((event, callback) => {
        if (event === "transitionend") {
          setTimeout(callback, 100);
        }
      });

      await controller.animateInsertionIndicator(elementId, true);

      expect(mockElement.style.display).toBe("block");
      expect(mockElement.style.transform).toBe("scale(1)");
      expect(mockElement.style.opacity).toBe("1");
      expect(mockElement.style.willChange).toBe("auto");
    });

    it("should hide indicator with scale and opacity animation", async () => {
      const elementId = "indicator-1";

      mockElement.addEventListener.mockImplementation((event, callback) => {
        if (event === "transitionend") {
          setTimeout(callback, 100);
        }
      });

      await controller.animateInsertionIndicator(elementId, false);

      expect(mockElement.style.transform).toBe("scale(0.8)");
      expect(mockElement.style.opacity).toBe("0");
      expect(mockElement.style.display).toBe("none");
    });

    it("should handle indicator element not found", async () => {
      mockGetElementById.mockReturnValue(null);
      mockQuerySelector.mockReturnValue(null);

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await controller.animateInsertionIndicator("non-existent", true);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Indicator element with id non-existent not found"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("cancelAnimation", () => {
    it("should cancel active animation and reset element styles", () => {
      const elementId = "test-element";

      // Start animation
      controller.animateElementShift(elementId, "down", 50);

      // Verify animation is active
      expect(controller.getAnimationState(elementId)).toBeDefined();

      // Cancel animation
      controller.cancelAnimation(elementId);

      // Check that animation state is removed
      expect(controller.getAnimationState(elementId)).toBeUndefined();

      // Check that element styles are reset
      expect(mockElement.style.transition).toBe("none");
      expect(mockElement.style.willChange).toBe("auto");
      expect(mockElement.style.transform).toBe("translate3d(0, 0, 0)");
    });

    it("should handle cancelling non-existent animation", () => {
      expect(() => controller.cancelAnimation("non-existent")).not.toThrow();
    });
  });

  describe("cancelAllAnimations", () => {
    it("should cancel all active animations", () => {
      const elementIds = ["element-1", "element-2", "element-3"];

      // Start multiple animations
      elementIds.forEach((id) => {
        controller.animateElementShift(id, "down", 50);
      });

      // Verify animations are active
      elementIds.forEach((id) => {
        expect(controller.getAnimationState(id)).toBeDefined();
      });

      // Cancel all animations
      controller.cancelAllAnimations();

      // Check that all animation states are removed
      elementIds.forEach((id) => {
        expect(controller.getAnimationState(id)).toBeUndefined();
      });
    });

    it("should clear animation queue", () => {
      const animations = [
        { elementId: "element-1", direction: "down" as const, distance: 50 },
        { elementId: "element-2", direction: "down" as const, distance: 50 },
      ];

      controller.batchAnimations(animations);
      controller.cancelAllAnimations();

      // Queue should be cleared (we can't directly test this, but it shouldn't process)
      expect(controller.getActiveAnimations().size).toBe(0);
    });
  });

  describe("batchAnimations", () => {
    it("should process batched animations", async () => {
      const animations = [
        { elementId: "element-1", direction: "down" as const, distance: 50 },
        { elementId: "element-2", direction: "up" as const, distance: 30 },
      ];

      mockElement.addEventListener.mockImplementation((event, callback) => {
        if (event === "transitionend") {
          setTimeout(
            () => callback({ target: mockElement, propertyName: "transform" }),
            100
          );
        }
      });

      await controller.batchAnimations(animations);

      // Should have processed all animations
      expect(mockGetElementById).toHaveBeenCalledWith("element-1");
      expect(mockGetElementById).toHaveBeenCalledWith("element-2");
    });
  });

  describe("performance metrics", () => {
    it("should track active animations count", () => {
      const metrics = controller.getPerformanceMetrics();
      expect(metrics.activeAnimations).toBe(0);

      // Start an animation
      controller.animateElementShift("test-element", "down", 50);

      const updatedMetrics = controller.getPerformanceMetrics();
      expect(updatedMetrics.activeAnimations).toBe(1);
    });

    it("should reset performance metrics", () => {
      controller.resetPerformanceMetrics();
      const metrics = controller.getPerformanceMetrics();

      expect(metrics.frameRate).toBe(60);
      expect(metrics.droppedFrames).toBe(0);
      expect(metrics.lastFrameTime).toBeGreaterThan(0);
    });
  });

  describe("getActiveAnimations", () => {
    it("should return map of active animations", () => {
      const activeAnimations = controller.getActiveAnimations();
      expect(activeAnimations).toBeInstanceOf(Map);
      expect(activeAnimations.size).toBe(0);

      // Start an animation
      controller.animateElementShift("test-element", "down", 50);

      const updatedAnimations = controller.getActiveAnimations();
      expect(updatedAnimations.size).toBe(1);
      expect(updatedAnimations.has("test-element")).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("should clean up all resources", () => {
      // Start some animations
      controller.animateElementShift("element-1", "down", 50);
      controller.animateElementShift("element-2", "up", 30);

      expect(controller.getActiveAnimations().size).toBe(2);

      controller.cleanup();

      expect(controller.getActiveAnimations().size).toBe(0);
    });
  });
});

describe("animationController singleton", () => {
  it("should provide singleton instance", () => {
    expect(animationController).toBeInstanceOf(AnimationController);
  });

  it("should maintain state across imports", () => {
    animationController.animateElementShift("test", "down", 50);
    expect(animationController.getActiveAnimations().size).toBe(1);
  });
});
