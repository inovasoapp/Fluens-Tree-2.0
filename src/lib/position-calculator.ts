/**
 * Enhanced position calculation utilities for drag and drop operations
 * Implements zone-based position detection with confidence scoring
 */

export interface DragPosition {
  mouseX: number;
  mouseY: number;
  elementRect: DOMRect;
  insertionIndex: number;
  insertionPosition: "top" | "bottom";
  confidence: number;
  timestamp: number;
}

export interface PositionCalculationResult {
  insertionIndex: number;
  position: "top" | "bottom";
  confidence: number;
  zone: "top" | "middle" | "bottom";
  usedDirectionHeuristic: boolean;
}

export type ElementZone = "top" | "middle" | "bottom";

/**
 * Zone configuration for position detection
 * Top 30%, Middle 40%, Bottom 30%
 */
export const ZONE_CONFIG = {
  TOP_THRESHOLD: 0.3,
  BOTTOM_THRESHOLD: 0.7, // 1 - 0.3
  MIDDLE_START: 0.3,
  MIDDLE_END: 0.7,
} as const;

/**
 * Confidence scoring thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 1.0, // Clear zone detection (top/bottom zones)
  MEDIUM: 0.8, // Direction heuristic with clear movement
  LOW: 0.6, // Direction heuristic with ambiguous movement
  MINIMUM: 0.4, // Fallback scenarios
} as const;

/**
 * Calculate which zone the mouse position falls into relative to an element
 */
export function getElementZone(
  mouseY: number,
  elementRect: DOMRect
): ElementZone {
  const elementTop = elementRect.top;
  const elementHeight = elementRect.height;

  // Handle zero or negative height elements
  if (elementHeight <= 0) {
    return "top";
  }

  // Calculate relative position within the element (0 to 1)
  const relativeY = (mouseY - elementTop) / elementHeight;

  // Clamp to valid range to handle edge cases
  const clampedY = Math.max(0, Math.min(1, relativeY));

  if (clampedY <= ZONE_CONFIG.TOP_THRESHOLD) {
    return "top";
  } else if (clampedY >= ZONE_CONFIG.BOTTOM_THRESHOLD) {
    return "bottom";
  } else {
    return "middle";
  }
}

/**
 * Determine if direction heuristic should be used for middle zone positioning
 */
export function shouldUseDirectionHeuristic(
  zone: ElementZone,
  draggedIndex: number,
  targetIndex: number
): boolean {
  // Only use direction heuristic for middle zone
  if (zone !== "middle") {
    return false;
  }

  // Ensure we have valid indices
  if (
    typeof draggedIndex !== "number" ||
    typeof targetIndex !== "number" ||
    isNaN(draggedIndex) ||
    isNaN(targetIndex)
  ) {
    return false;
  }

  // Don't use heuristic if dragging to same position
  if (draggedIndex === targetIndex) {
    return false;
  }

  return true;
}

/**
 * Calculate insertion position using drag direction heuristic
 */
export function calculateDirectionHeuristic(
  draggedIndex: number,
  targetIndex: number,
  mouseY: number,
  elementRect: DOMRect
): {
  position: "top" | "bottom";
  insertionIndex: number;
  confidence: number;
} {
  const elementCenter = elementRect.top + elementRect.height / 2;
  const distanceFromCenter = Math.abs(mouseY - elementCenter);
  const maxDistance = elementRect.height / 2;

  // Calculate confidence based on distance from center
  // Closer to edges = higher confidence in direction
  const centerConfidence = 1 - distanceFromCenter / maxDistance;
  const directionConfidence = Math.max(
    CONFIDENCE_THRESHOLDS.LOW,
    CONFIDENCE_THRESHOLDS.MEDIUM * (1 - centerConfidence)
  );

  if (draggedIndex < targetIndex) {
    // Dragging from above to below - insert after target
    return {
      position: "bottom",
      insertionIndex: targetIndex + 1,
      confidence: directionConfidence,
    };
  } else {
    // Dragging from below to above - insert before target
    return {
      position: "top",
      insertionIndex: targetIndex,
      confidence: directionConfidence,
    };
  }
}

/**
 * Main position calculation function with enhanced zone-based detection
 */
export function calculateInsertionPosition(
  mouseY: number,
  elementRect: DOMRect,
  draggedIndex: number,
  targetIndex: number
): PositionCalculationResult {
  // Validate inputs
  if (!elementRect || elementRect.height <= 0) {
    return {
      insertionIndex: targetIndex,
      position: "top",
      confidence: CONFIDENCE_THRESHOLDS.MINIMUM,
      zone: "top",
      usedDirectionHeuristic: false,
    };
  }

  // Determine which zone the mouse is in
  const zone = getElementZone(mouseY, elementRect);

  // Handle top zone - high confidence insertion above
  if (zone === "top") {
    return {
      insertionIndex: targetIndex,
      position: "top",
      confidence: CONFIDENCE_THRESHOLDS.HIGH,
      zone: "top",
      usedDirectionHeuristic: false,
    };
  }

  // Handle bottom zone - high confidence insertion below
  if (zone === "bottom") {
    return {
      insertionIndex: targetIndex + 1,
      position: "bottom",
      confidence: CONFIDENCE_THRESHOLDS.HIGH,
      zone: "bottom",
      usedDirectionHeuristic: false,
    };
  }

  // Handle middle zone - use direction heuristic
  if (shouldUseDirectionHeuristic(zone, draggedIndex, targetIndex)) {
    const heuristicResult = calculateDirectionHeuristic(
      draggedIndex,
      targetIndex,
      mouseY,
      elementRect
    );

    return {
      insertionIndex: heuristicResult.insertionIndex,
      position: heuristicResult.position,
      confidence: heuristicResult.confidence,
      zone: "middle",
      usedDirectionHeuristic: true,
    };
  }

  // Fallback for middle zone when heuristic can't be used
  // Default to inserting above for consistency
  return {
    insertionIndex: targetIndex,
    position: "top",
    confidence: CONFIDENCE_THRESHOLDS.MINIMUM,
    zone: "middle",
    usedDirectionHeuristic: false,
  };
}

/**
 * Enhanced position calculator class for managing drag state and calculations
 */
export class PositionCalculator {
  private lastCalculation: PositionCalculationResult | null = null;
  private calculationHistory: PositionCalculationResult[] = [];
  private readonly historyLimit = 10;

  /**
   * Calculate insertion position with history tracking
   */
  public calculate(
    mouseY: number,
    elementRect: DOMRect,
    draggedIndex: number,
    targetIndex: number
  ): PositionCalculationResult {
    const result = calculateInsertionPosition(
      mouseY,
      elementRect,
      draggedIndex,
      targetIndex
    );

    // Store calculation in history
    this.lastCalculation = result;
    this.calculationHistory.push(result);

    // Limit history size
    if (this.calculationHistory.length > this.historyLimit) {
      this.calculationHistory.shift();
    }

    return result;
  }

  /**
   * Get the last calculation result
   */
  public getLastCalculation(): PositionCalculationResult | null {
    return this.lastCalculation;
  }

  /**
   * Get calculation history for analysis
   */
  public getCalculationHistory(): PositionCalculationResult[] {
    return [...this.calculationHistory];
  }

  /**
   * Calculate average confidence from recent calculations
   */
  public getAverageConfidence(sampleSize: number = 5): number {
    const recentCalculations = this.calculationHistory.slice(-sampleSize);

    if (recentCalculations.length === 0) {
      return 0;
    }

    const totalConfidence = recentCalculations.reduce(
      (sum, calc) => sum + calc.confidence,
      0
    );

    return totalConfidence / recentCalculations.length;
  }

  /**
   * Check if position has stabilized (consistent results)
   */
  public isPositionStable(sampleSize: number = 3): boolean {
    const recentCalculations = this.calculationHistory.slice(-sampleSize);

    if (recentCalculations.length < sampleSize) {
      return false;
    }

    // Check if all recent calculations have the same insertion index and position
    const firstResult = recentCalculations[0];
    return recentCalculations.every(
      (calc) =>
        calc.insertionIndex === firstResult.insertionIndex &&
        calc.position === firstResult.position
    );
  }

  /**
   * Reset calculator state
   */
  public reset(): void {
    this.lastCalculation = null;
    this.calculationHistory = [];
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): {
    totalCalculations: number;
    averageConfidence: number;
    stabilityRate: number;
    zoneDistribution: Record<ElementZone, number>;
  } {
    const total = this.calculationHistory.length;

    if (total === 0) {
      return {
        totalCalculations: 0,
        averageConfidence: 0,
        stabilityRate: 0,
        zoneDistribution: { top: 0, middle: 0, bottom: 0 },
      };
    }

    const averageConfidence = this.getAverageConfidence(total);

    // Calculate stability rate (percentage of stable positions)
    let stableCount = 0;
    for (let i = 2; i < total; i++) {
      const sample = this.calculationHistory.slice(i - 2, i + 1);
      const firstResult = sample[0];
      const isStable = sample.every(
        (calc) =>
          calc.insertionIndex === firstResult.insertionIndex &&
          calc.position === firstResult.position
      );
      if (isStable) stableCount++;
    }

    const stabilityRate = total > 2 ? stableCount / (total - 2) : 0;

    // Calculate zone distribution
    const zoneDistribution = this.calculationHistory.reduce(
      (dist, calc) => {
        dist[calc.zone]++;
        return dist;
      },
      { top: 0, middle: 0, bottom: 0 }
    );

    return {
      totalCalculations: total,
      averageConfidence,
      stabilityRate,
      zoneDistribution,
    };
  }
}

/**
 * Utility function to create a throttled position calculator
 */
export function createThrottledCalculator(
  calculator: PositionCalculator,
  throttleMs: number = 16 // ~60fps
): (
  mouseY: number,
  elementRect: DOMRect,
  draggedIndex: number,
  targetIndex: number
) => PositionCalculationResult | null {
  let lastCallTime = 0;
  let lastResult: PositionCalculationResult | null = null;

  return (mouseY, elementRect, draggedIndex, targetIndex) => {
    const now = Date.now();

    if (now - lastCallTime >= throttleMs) {
      lastResult = calculator.calculate(
        mouseY,
        elementRect,
        draggedIndex,
        targetIndex
      );
      lastCallTime = now;
    }

    return lastResult;
  };
}
