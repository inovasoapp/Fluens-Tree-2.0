import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getElementZone,
  shouldUseDirectionHeuristic,
  calculateDirectionHeuristic,
  calculateInsertionPosition,
  PositionCalculator,
  createThrottledCalculator,
  ZONE_CONFIG,
  CONFIDENCE_THRESHOLDS,
  type ElementZone,
  type PositionCalculationResult,
} from "../position-calculator";

// Mock DOMRect for testing
function createMockRect(top: number, height: number): DOMRect {
  return {
    top,
    height,
    bottom: top + height,
    left: 0,
    right: 100,
    width: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}

describe("getElementZone", () => {
  const elementRect = createMockRect(100, 100); // Element from y=100 to y=200

  it('should return "top" for mouse position in top 30% of element', () => {
    // Top zone: y=100 to y=130 (30% of 100px height)
    expect(getElementZone(100, elementRect)).toBe("top");
    expect(getElementZone(115, elementRect)).toBe("top");
    expect(getElementZone(130, elementRect)).toBe("top");
  });

  it('should return "bottom" for mouse position in bottom 30% of element', () => {
    // Bottom zone: y=170 to y=200 (bottom 30% of 100px height)
    expect(getElementZone(170, elementRect)).toBe("bottom");
    expect(getElementZone(185, elementRect)).toBe("bottom");
    expect(getElementZone(200, elementRect)).toBe("bottom");
  });

  it('should return "middle" for mouse position in middle 40% of element', () => {
    // Middle zone: y=130 to y=170 (middle 40% of 100px height)
    expect(getElementZone(131, elementRect)).toBe("middle");
    expect(getElementZone(150, elementRect)).toBe("middle");
    expect(getElementZone(169, elementRect)).toBe("middle");
  });

  it("should handle edge cases at zone boundaries", () => {
    // Exact boundary cases
    expect(getElementZone(130, elementRect)).toBe("top"); // Exactly at 30%
    expect(getElementZone(170, elementRect)).toBe("bottom"); // Exactly at 70%
  });

  it("should clamp mouse position to element bounds", () => {
    // Mouse above element
    expect(getElementZone(50, elementRect)).toBe("top");

    // Mouse below element
    expect(getElementZone(250, elementRect)).toBe("bottom");
  });

  it("should handle zero height elements", () => {
    const zeroHeightRect = createMockRect(100, 0);
    expect(getElementZone(100, zeroHeightRect)).toBe("top");
  });

  it("should handle very small elements", () => {
    const smallRect = createMockRect(100, 10);
    expect(getElementZone(100, smallRect)).toBe("top"); // y=100, top zone ends at 103
    expect(getElementZone(103, smallRect)).toBe("top");
    expect(getElementZone(104, smallRect)).toBe("middle");
    expect(getElementZone(106, smallRect)).toBe("middle");
    expect(getElementZone(107, smallRect)).toBe("bottom");
    expect(getElementZone(110, smallRect)).toBe("bottom");
  });
});

describe("shouldUseDirectionHeuristic", () => {
  it("should return true for middle zone with valid indices", () => {
    expect(shouldUseDirectionHeuristic("middle", 0, 1)).toBe(true);
    expect(shouldUseDirectionHeuristic("middle", 2, 0)).toBe(true);
  });

  it("should return false for non-middle zones", () => {
    expect(shouldUseDirectionHeuristic("top", 0, 1)).toBe(false);
    expect(shouldUseDirectionHeuristic("bottom", 0, 1)).toBe(false);
  });

  it("should return false for invalid indices", () => {
    expect(shouldUseDirectionHeuristic("middle", NaN, 1)).toBe(false);
    expect(shouldUseDirectionHeuristic("middle", 0, NaN)).toBe(false);
    expect(shouldUseDirectionHeuristic("middle", 0, undefined as any)).toBe(
      false
    );
  });

  it("should return false when dragging to same position", () => {
    expect(shouldUseDirectionHeuristic("middle", 1, 1)).toBe(false);
  });
});

describe("calculateDirectionHeuristic", () => {
  const elementRect = createMockRect(100, 100); // Element from y=100 to y=200, center at y=150

  it("should insert below when dragging from above to below", () => {
    const result = calculateDirectionHeuristic(0, 2, 150, elementRect);
    expect(result.position).toBe("bottom");
    expect(result.insertionIndex).toBe(3); // targetIndex + 1
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLDS.LOW);
  });

  it("should insert above when dragging from below to above", () => {
    const result = calculateDirectionHeuristic(3, 1, 150, elementRect);
    expect(result.position).toBe("top");
    expect(result.insertionIndex).toBe(1); // targetIndex
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLDS.LOW);
  });

  it("should have higher confidence when mouse is closer to element edges", () => {
    // Mouse near top edge (y=110)
    const topResult = calculateDirectionHeuristic(0, 2, 110, elementRect);

    // Mouse near bottom edge (y=190)
    const bottomResult = calculateDirectionHeuristic(0, 2, 190, elementRect);

    // Mouse at center (y=150)
    const centerResult = calculateDirectionHeuristic(0, 2, 150, elementRect);

    expect(topResult.confidence).toBeGreaterThan(centerResult.confidence);
    expect(bottomResult.confidence).toBeGreaterThan(centerResult.confidence);
  });

  it("should maintain minimum confidence threshold", () => {
    const result = calculateDirectionHeuristic(0, 2, 150, elementRect);
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLDS.LOW);
  });
});

describe("calculateInsertionPosition", () => {
  const elementRect = createMockRect(100, 100);

  it("should return high confidence for top zone", () => {
    const result = calculateInsertionPosition(115, elementRect, 1, 2);
    expect(result.zone).toBe("top");
    expect(result.position).toBe("top");
    expect(result.insertionIndex).toBe(2);
    expect(result.confidence).toBe(CONFIDENCE_THRESHOLDS.HIGH);
    expect(result.usedDirectionHeuristic).toBe(false);
  });

  it("should return high confidence for bottom zone", () => {
    const result = calculateInsertionPosition(185, elementRect, 1, 2);
    expect(result.zone).toBe("bottom");
    expect(result.position).toBe("bottom");
    expect(result.insertionIndex).toBe(3);
    expect(result.confidence).toBe(CONFIDENCE_THRESHOLDS.HIGH);
    expect(result.usedDirectionHeuristic).toBe(false);
  });

  it("should use direction heuristic for middle zone", () => {
    const result = calculateInsertionPosition(150, elementRect, 0, 2);
    expect(result.zone).toBe("middle");
    expect(result.usedDirectionHeuristic).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLDS.LOW);
  });

  it("should handle invalid element rect gracefully", () => {
    const invalidRect = createMockRect(100, 0);
    const result = calculateInsertionPosition(150, invalidRect, 0, 2);
    expect(result.confidence).toBe(CONFIDENCE_THRESHOLDS.MINIMUM);
    expect(result.position).toBe("top");
    expect(result.insertionIndex).toBe(2);
  });

  it("should provide fallback for middle zone when heuristic cannot be used", () => {
    // Same index scenario
    const result = calculateInsertionPosition(150, elementRect, 2, 2);
    expect(result.zone).toBe("middle");
    expect(result.usedDirectionHeuristic).toBe(false);
    expect(result.confidence).toBe(CONFIDENCE_THRESHOLDS.MINIMUM);
    expect(result.position).toBe("top");
  });
});

describe("PositionCalculator", () => {
  let calculator: PositionCalculator;
  const elementRect = createMockRect(100, 100);

  beforeEach(() => {
    calculator = new PositionCalculator();
  });

  it("should track calculation history", () => {
    calculator.calculate(115, elementRect, 0, 1);
    calculator.calculate(185, elementRect, 0, 1);

    const history = calculator.getCalculationHistory();
    expect(history).toHaveLength(2);
    expect(history[0].zone).toBe("top");
    expect(history[1].zone).toBe("bottom");
  });

  it("should limit history size", () => {
    // Add more than the history limit (10)
    for (let i = 0; i < 15; i++) {
      calculator.calculate(115, elementRect, 0, 1);
    }

    const history = calculator.getCalculationHistory();
    expect(history).toHaveLength(10);
  });

  it("should return last calculation", () => {
    const result = calculator.calculate(115, elementRect, 0, 1);
    const lastResult = calculator.getLastCalculation();
    expect(lastResult).toEqual(result);
  });

  it("should calculate average confidence", () => {
    calculator.calculate(115, elementRect, 0, 1); // High confidence (top zone)
    calculator.calculate(185, elementRect, 0, 1); // High confidence (bottom zone)
    calculator.calculate(150, elementRect, 0, 1); // Lower confidence (middle zone)

    const avgConfidence = calculator.getAverageConfidence(3);
    expect(avgConfidence).toBeGreaterThan(0);
    expect(avgConfidence).toBeLessThanOrEqual(1);
  });

  it("should detect position stability", () => {
    // Add consistent calculations
    calculator.calculate(115, elementRect, 0, 1);
    calculator.calculate(115, elementRect, 0, 1);
    calculator.calculate(115, elementRect, 0, 1);

    expect(calculator.isPositionStable(3)).toBe(true);

    // Add different calculation
    calculator.calculate(185, elementRect, 0, 1);
    expect(calculator.isPositionStable(3)).toBe(false);
  });

  it("should reset state correctly", () => {
    calculator.calculate(115, elementRect, 0, 1);
    calculator.reset();

    expect(calculator.getLastCalculation()).toBeNull();
    expect(calculator.getCalculationHistory()).toHaveLength(0);
  });

  it("should provide comprehensive metrics", () => {
    calculator.calculate(115, elementRect, 0, 1); // top
    calculator.calculate(150, elementRect, 0, 1); // middle
    calculator.calculate(185, elementRect, 0, 1); // bottom
    calculator.calculate(115, elementRect, 0, 1); // top
    calculator.calculate(115, elementRect, 0, 1); // top (stable)

    const metrics = calculator.getMetrics();
    expect(metrics.totalCalculations).toBe(5);
    expect(metrics.averageConfidence).toBeGreaterThan(0);
    expect(metrics.stabilityRate).toBeGreaterThanOrEqual(0);
    expect(metrics.zoneDistribution.top).toBe(3);
    expect(metrics.zoneDistribution.middle).toBe(1);
    expect(metrics.zoneDistribution.bottom).toBe(1);
  });

  it("should handle empty state in metrics", () => {
    const metrics = calculator.getMetrics();
    expect(metrics.totalCalculations).toBe(0);
    expect(metrics.averageConfidence).toBe(0);
    expect(metrics.stabilityRate).toBe(0);
    expect(metrics.zoneDistribution).toEqual({ top: 0, middle: 0, bottom: 0 });
  });
});

describe("createThrottledCalculator", () => {
  let calculator: PositionCalculator;
  const elementRect = createMockRect(100, 100);

  beforeEach(() => {
    calculator = new PositionCalculator();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should throttle calculations based on time interval", () => {
    const throttledCalculator = createThrottledCalculator(calculator, 100);

    // First call should execute
    const result1 = throttledCalculator(115, elementRect, 0, 1);
    expect(result1).not.toBeNull();
    expect(result1?.zone).toBe("top");

    // Immediate second call should return cached result
    const result2 = throttledCalculator(185, elementRect, 0, 1);
    expect(result2).toEqual(result1); // Same result, not recalculated

    // Advance time and call again
    vi.advanceTimersByTime(100);
    const result3 = throttledCalculator(185, elementRect, 0, 1);
    expect(result3?.zone).toBe("bottom"); // New calculation
  });

  it("should use default throttle interval of 16ms", () => {
    const throttledCalculator = createThrottledCalculator(calculator);

    const result1 = throttledCalculator(115, elementRect, 0, 1);
    const result2 = throttledCalculator(185, elementRect, 0, 1);
    expect(result2).toEqual(result1);

    vi.advanceTimersByTime(16);
    const result3 = throttledCalculator(185, elementRect, 0, 1);
    expect(result3?.zone).toBe("bottom");
  });

  it("should return null initially if no calculation has been made", () => {
    const throttledCalculator = createThrottledCalculator(calculator, 100);

    // Don't call the throttled calculator yet
    vi.advanceTimersByTime(50);

    // First call should still execute even after time advancement
    const result = throttledCalculator(115, elementRect, 0, 1);
    expect(result).not.toBeNull();
  });
});

describe("Edge Cases and Error Handling", () => {
  const elementRect = createMockRect(100, 100);

  it("should handle negative mouse positions", () => {
    const result = calculateInsertionPosition(-50, elementRect, 0, 1);
    expect(result.zone).toBe("top");
    expect(result.confidence).toBe(CONFIDENCE_THRESHOLDS.HIGH);
  });

  it("should handle very large mouse positions", () => {
    const result = calculateInsertionPosition(1000, elementRect, 0, 1);
    expect(result.zone).toBe("bottom");
    expect(result.confidence).toBe(CONFIDENCE_THRESHOLDS.HIGH);
  });

  it("should handle negative indices gracefully", () => {
    const result = calculateInsertionPosition(150, elementRect, -1, 1);
    expect(result).toBeDefined();
    expect(result.insertionIndex).toBeGreaterThanOrEqual(0);
  });

  it("should handle very large indices", () => {
    const result = calculateInsertionPosition(150, elementRect, 1000, 1001);
    expect(result).toBeDefined();
    expect(typeof result.insertionIndex).toBe("number");
  });

  it("should handle floating point mouse positions", () => {
    const result = calculateInsertionPosition(115.7, elementRect, 0, 1);
    expect(result.zone).toBe("top");
    expect(result.confidence).toBe(CONFIDENCE_THRESHOLDS.HIGH);
  });

  it("should handle elements with fractional dimensions", () => {
    const fractionalRect = createMockRect(100.5, 99.7);
    const result = calculateInsertionPosition(150.3, fractionalRect, 0, 1);
    expect(result).toBeDefined();
    expect(result.zone).toBeOneOf(["top", "middle", "bottom"]);
  });
});

describe("Performance and Consistency", () => {
  const elementRect = createMockRect(100, 100);

  it("should produce consistent results for same inputs", () => {
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(calculateInsertionPosition(115, elementRect, 0, 1));
    }

    // All results should be identical
    const firstResult = results[0];
    results.forEach((result) => {
      expect(result).toEqual(firstResult);
    });
  });

  it("should handle rapid successive calculations efficiently", () => {
    const calculator = new PositionCalculator();
    const startTime = Date.now();

    // Perform many calculations
    for (let i = 0; i < 1000; i++) {
      calculator.calculate(115 + (i % 50), elementRect, 0, 1);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(100); // 100ms for 1000 calculations
  });

  it("should maintain accuracy across different element sizes", () => {
    const sizes = [10, 50, 100, 200, 500];

    sizes.forEach((size) => {
      const rect = createMockRect(100, size);
      const topResult = calculateInsertionPosition(
        100 + size * 0.1,
        rect,
        0,
        1
      );
      const bottomResult = calculateInsertionPosition(
        100 + size * 0.9,
        rect,
        0,
        1
      );

      expect(topResult.zone).toBe("top");
      expect(bottomResult.zone).toBe("bottom");
      expect(topResult.confidence).toBe(CONFIDENCE_THRESHOLDS.HIGH);
      expect(bottomResult.confidence).toBe(CONFIDENCE_THRESHOLDS.HIGH);
    });
  });
});

describe("Integration Tests", () => {
  it("should work correctly with real-world drag scenarios", () => {
    const calculator = new PositionCalculator();
    const elementRect = createMockRect(100, 100);

    // Simulate a drag from top to bottom
    const positions = [115, 125, 135, 145, 155, 165, 175, 185];
    const results = positions.map((y) =>
      calculator.calculate(y, elementRect, 0, 2)
    );

    // Should transition from top zone to middle to bottom
    expect(results[0].zone).toBe("top");
    expect(results[results.length - 1].zone).toBe("bottom");

    // Should maintain reasonable confidence throughout
    results.forEach((result) => {
      expect(result.confidence).toBeGreaterThanOrEqual(
        CONFIDENCE_THRESHOLDS.MINIMUM
      );
    });
  });

  it("should handle rapid position changes smoothly", () => {
    const calculator = new PositionCalculator();
    const elementRect = createMockRect(100, 100);

    // Simulate rapid back-and-forth movement
    const positions = [115, 185, 115, 185, 150, 115, 185];
    const results = positions.map((y) =>
      calculator.calculate(y, elementRect, 0, 2)
    );

    // Should produce consistent results for same positions
    expect(results[0]).toEqual(results[2]);
    expect(results[1]).toEqual(results[3]);
    expect(results[1]).toEqual(results[6]);
  });

  it("should provide meaningful metrics for complex drag patterns", () => {
    const calculator = new PositionCalculator();
    const elementRect = createMockRect(100, 100);

    // Create a complex pattern: top -> middle -> bottom -> middle -> top
    const pattern = [115, 140, 160, 185, 160, 140, 115];
    pattern.forEach((y) => calculator.calculate(y, elementRect, 0, 2));

    const metrics = calculator.getMetrics();
    expect(metrics.totalCalculations).toBe(7);
    expect(metrics.zoneDistribution.top).toBeGreaterThan(0);
    expect(metrics.zoneDistribution.middle).toBeGreaterThan(0);
    expect(metrics.zoneDistribution.bottom).toBeGreaterThan(0);
  });
});

describe("Boundary Value Analysis", () => {
  it("should handle exact zone boundary values correctly", () => {
    const elementRect = createMockRect(100, 100);

    // Test exact 30% boundary (y = 130)
    const topBoundary = calculateInsertionPosition(130, elementRect, 0, 1);
    expect(topBoundary.zone).toBe("top");

    // Test just above 30% boundary (y = 130.1)
    const justAboveTop = calculateInsertionPosition(130.1, elementRect, 0, 1);
    expect(justAboveTop.zone).toBe("middle");

    // Test exact 70% boundary (y = 170)
    const bottomBoundary = calculateInsertionPosition(170, elementRect, 0, 1);
    expect(bottomBoundary.zone).toBe("bottom");

    // Test just below 70% boundary (y = 169.9)
    const justBelowBottom = calculateInsertionPosition(
      169.9,
      elementRect,
      0,
      1
    );
    expect(justBelowBottom.zone).toBe("middle");
  });

  it("should handle minimum and maximum possible values", () => {
    const elementRect = createMockRect(0, Number.MAX_SAFE_INTEGER);

    const minResult = calculateInsertionPosition(
      Number.MIN_SAFE_INTEGER,
      elementRect,
      0,
      1
    );
    expect(minResult).toBeDefined();
    expect(minResult.zone).toBe("top");

    const maxResult = calculateInsertionPosition(
      Number.MAX_SAFE_INTEGER,
      elementRect,
      0,
      1
    );
    expect(maxResult).toBeDefined();
    expect(maxResult.zone).toBe("bottom");
  });
});

describe("Confidence Scoring Validation", () => {
  it("should assign appropriate confidence levels for different scenarios", () => {
    const elementRect = createMockRect(100, 100);

    // Top zone should have high confidence
    const topResult = calculateInsertionPosition(115, elementRect, 0, 1);
    expect(topResult.confidence).toBe(CONFIDENCE_THRESHOLDS.HIGH);

    // Bottom zone should have high confidence
    const bottomResult = calculateInsertionPosition(185, elementRect, 0, 1);
    expect(bottomResult.confidence).toBe(CONFIDENCE_THRESHOLDS.HIGH);

    // Middle zone with direction heuristic should have medium/low confidence
    const middleResult = calculateInsertionPosition(150, elementRect, 0, 2);
    expect(middleResult.confidence).toBeLessThan(CONFIDENCE_THRESHOLDS.HIGH);
    expect(middleResult.confidence).toBeGreaterThanOrEqual(
      CONFIDENCE_THRESHOLDS.LOW
    );
  });

  it("should never return confidence below minimum threshold", () => {
    const calculator = new PositionCalculator();
    const elementRect = createMockRect(100, 100);

    // Test various scenarios including edge cases
    const testCases = [
      { y: 115, draggedIndex: 0, targetIndex: 1 },
      { y: 150, draggedIndex: 0, targetIndex: 1 },
      { y: 185, draggedIndex: 0, targetIndex: 1 },
      { y: 150, draggedIndex: 1, targetIndex: 1 }, // Same index
      { y: -100, draggedIndex: 0, targetIndex: 1 }, // Negative position
      { y: 1000, draggedIndex: 0, targetIndex: 1 }, // Large position
    ];

    testCases.forEach(({ y, draggedIndex, targetIndex }) => {
      const result = calculator.calculate(
        y,
        elementRect,
        draggedIndex,
        targetIndex
      );
      expect(result.confidence).toBeGreaterThanOrEqual(
        CONFIDENCE_THRESHOLDS.MINIMUM
      );
    });
  });
});

describe("Memory and Performance", () => {
  it("should not leak memory with extensive usage", () => {
    const calculator = new PositionCalculator();
    const elementRect = createMockRect(100, 100);

    // Simulate extensive usage
    for (let i = 0; i < 1000; i++) {
      calculator.calculate(100 + (i % 100), elementRect, 0, 1);
    }

    // History should be limited
    const history = calculator.getCalculationHistory();
    expect(history.length).toBeLessThanOrEqual(10);

    // Metrics should still be accurate
    const metrics = calculator.getMetrics();
    expect(metrics.totalCalculations).toBe(10); // Limited by history
  });

  it("should handle concurrent calculations efficiently", () => {
    const calculators = Array.from(
      { length: 10 },
      () => new PositionCalculator()
    );
    const elementRect = createMockRect(100, 100);

    const startTime = performance.now();

    // Simulate concurrent usage
    calculators.forEach((calc, index) => {
      for (let i = 0; i < 100; i++) {
        calc.calculate(100 + (i % 100), elementRect, index, index + 1);
      }
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time
    expect(duration).toBeLessThan(50); // 50ms for 1000 calculations across 10 calculators
  });
});
