/**
 * Demo file showing how to use the enhanced position calculation utilities
 * This file demonstrates the key features and usage patterns
 */

import {
  PositionCalculator,
  calculateInsertionPosition,
  getElementZone,
  createThrottledCalculator,
  ZONE_CONFIG,
  CONFIDENCE_THRESHOLDS,
} from "../position-calculator";

// Mock DOMRect for demo purposes
function createDemoRect(top: number, height: number): DOMRect {
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

/**
 * Demo 1: Basic zone detection
 */
function demoZoneDetection() {
  console.log("=== Zone Detection Demo ===");

  const elementRect = createDemoRect(100, 100); // Element from y=100 to y=200

  const testPositions = [
    { y: 110, expected: "top" },
    { y: 130, expected: "top" }, // Boundary
    { y: 150, expected: "middle" },
    { y: 170, expected: "bottom" }, // Boundary
    { y: 190, expected: "bottom" },
  ];

  testPositions.forEach(({ y, expected }) => {
    const zone = getElementZone(y, elementRect);
    console.log(`Mouse at y=${y}: Zone="${zone}" (expected: ${expected})`);
  });

  console.log(
    `Zone configuration: Top ${ZONE_CONFIG.TOP_THRESHOLD * 100}%, Middle ${
      (ZONE_CONFIG.BOTTOM_THRESHOLD - ZONE_CONFIG.TOP_THRESHOLD) * 100
    }%, Bottom ${(1 - ZONE_CONFIG.BOTTOM_THRESHOLD) * 100}%`
  );
}

/**
 * Demo 2: Position calculation with confidence scoring
 */
function demoPositionCalculation() {
  console.log("\n=== Position Calculation Demo ===");

  const elementRect = createDemoRect(100, 100);

  const scenarios = [
    {
      y: 115,
      draggedIndex: 0,
      targetIndex: 2,
      description: "Top zone - high confidence",
    },
    {
      y: 185,
      draggedIndex: 0,
      targetIndex: 2,
      description: "Bottom zone - high confidence",
    },
    {
      y: 150,
      draggedIndex: 0,
      targetIndex: 2,
      description: "Middle zone - direction heuristic (drag down)",
    },
    {
      y: 150,
      draggedIndex: 3,
      targetIndex: 1,
      description: "Middle zone - direction heuristic (drag up)",
    },
    {
      y: 150,
      draggedIndex: 1,
      targetIndex: 1,
      description: "Middle zone - same position fallback",
    },
  ];

  scenarios.forEach(({ y, draggedIndex, targetIndex, description }) => {
    const result = calculateInsertionPosition(
      y,
      elementRect,
      draggedIndex,
      targetIndex
    );
    console.log(`${description}:`);
    console.log(`  Mouse Y: ${y}, Zone: ${result.zone}`);
    console.log(
      `  Insertion: ${result.position} at index ${result.insertionIndex}`
    );
    console.log(
      `  Confidence: ${result.confidence.toFixed(2)} (${
        result.usedDirectionHeuristic ? "heuristic" : "direct"
      })`
    );
    console.log("");
  });
}

/**
 * Demo 3: Using PositionCalculator class with history tracking
 */
function demoCalculatorClass() {
  console.log("=== Position Calculator Class Demo ===");

  const calculator = new PositionCalculator();
  const elementRect = createDemoRect(100, 100);

  // Simulate a drag sequence
  const dragSequence = [115, 125, 140, 155, 170, 185, 170, 155];

  console.log("Simulating drag sequence:");
  dragSequence.forEach((y, index) => {
    const result = calculator.calculate(y, elementRect, 0, 2);
    console.log(
      `Step ${index + 1}: y=${y} -> ${
        result.zone
      } zone, confidence=${result.confidence.toFixed(2)}`
    );
  });

  // Show metrics
  const metrics = calculator.getMetrics();
  console.log("\nDrag sequence metrics:");
  console.log(`Total calculations: ${metrics.totalCalculations}`);
  console.log(`Average confidence: ${metrics.averageConfidence.toFixed(2)}`);
  console.log(`Stability rate: ${(metrics.stabilityRate * 100).toFixed(1)}%`);
  console.log(`Zone distribution:`, metrics.zoneDistribution);

  // Check position stability
  console.log(`Position is stable: ${calculator.isPositionStable()}`);
}

/**
 * Demo 4: Throttled calculator for performance
 */
function demoThrottledCalculator() {
  console.log("\n=== Throttled Calculator Demo ===");

  const calculator = new PositionCalculator();
  const throttledCalculate = createThrottledCalculator(calculator, 50); // 50ms throttle
  const elementRect = createDemoRect(100, 100);

  console.log("Rapid calculations (throttled to 50ms):");

  // Simulate rapid mouse movements
  const rapidMovements = [115, 125, 135, 145, 155, 165, 175, 185];

  rapidMovements.forEach((y, index) => {
    const result = throttledCalculate(y, elementRect, 0, 2);
    console.log(
      `Movement ${index + 1}: y=${y} -> ${
        result
          ? `${result.zone} (conf: ${result.confidence.toFixed(2)})`
          : "throttled"
      }`
    );
  });

  // Show final metrics
  const metrics = calculator.getMetrics();
  console.log(
    `\nActual calculations performed: ${metrics.totalCalculations} (out of ${rapidMovements.length} requests)`
  );
}

/**
 * Demo 5: Edge cases and error handling
 */
function demoEdgeCases() {
  console.log("\n=== Edge Cases Demo ===");

  const scenarios = [
    {
      name: "Zero height element",
      rect: createDemoRect(100, 0),
      y: 100,
      draggedIndex: 0,
      targetIndex: 1,
    },
    {
      name: "Very small element",
      rect: createDemoRect(100, 5),
      y: 102,
      draggedIndex: 0,
      targetIndex: 1,
    },
    {
      name: "Mouse far above element",
      rect: createDemoRect(100, 100),
      y: -50,
      draggedIndex: 0,
      targetIndex: 1,
    },
    {
      name: "Mouse far below element",
      rect: createDemoRect(100, 100),
      y: 500,
      draggedIndex: 0,
      targetIndex: 1,
    },
  ];

  scenarios.forEach(({ name, rect, y, draggedIndex, targetIndex }) => {
    const result = calculateInsertionPosition(
      y,
      rect,
      draggedIndex,
      targetIndex
    );
    console.log(`${name}:`);
    console.log(
      `  Result: ${result.zone} zone, ${
        result.position
      } position, confidence=${result.confidence.toFixed(2)}`
    );
  });
}

/**
 * Demo 6: Confidence thresholds explanation
 */
function demoConfidenceThresholds() {
  console.log("\n=== Confidence Thresholds Demo ===");

  console.log("Confidence scoring system:");
  console.log(
    `HIGH (${CONFIDENCE_THRESHOLDS.HIGH}): Clear zone detection (top/bottom zones)`
  );
  console.log(
    `MEDIUM (${CONFIDENCE_THRESHOLDS.MEDIUM}): Direction heuristic with clear movement`
  );
  console.log(
    `LOW (${CONFIDENCE_THRESHOLDS.LOW}): Direction heuristic with ambiguous movement`
  );
  console.log(`MINIMUM (${CONFIDENCE_THRESHOLDS.MINIMUM}): Fallback scenarios`);

  const elementRect = createDemoRect(100, 100);

  // Show examples of each confidence level
  const examples = [
    { y: 115, draggedIndex: 0, targetIndex: 1, expectedLevel: "HIGH" },
    { y: 140, draggedIndex: 0, targetIndex: 2, expectedLevel: "MEDIUM/LOW" },
    { y: 150, draggedIndex: 1, targetIndex: 1, expectedLevel: "MINIMUM" },
  ];

  console.log("\nExamples:");
  examples.forEach(({ y, draggedIndex, targetIndex, expectedLevel }) => {
    const result = calculateInsertionPosition(
      y,
      elementRect,
      draggedIndex,
      targetIndex
    );
    console.log(
      `y=${y}, drag ${draggedIndex}→${targetIndex}: confidence=${result.confidence.toFixed(
        2
      )} (${expectedLevel})`
    );
  });
}

// Run all demos
export function runPositionCalculatorDemo() {
  console.log("🎯 Enhanced Position Calculator Demo\n");

  demoZoneDetection();
  demoPositionCalculation();
  demoCalculatorClass();
  demoThrottledCalculator();
  demoEdgeCases();
  demoConfidenceThresholds();

  console.log(
    "\n✅ Demo completed! The enhanced position calculator provides:"
  );
  console.log("• Zone-based detection (30%/40%/30%)");
  console.log("• Direction heuristics for middle zone");
  console.log("• Confidence scoring system");
  console.log("• History tracking and metrics");
  console.log("• Performance throttling");
  console.log("• Comprehensive edge case handling");
}

// Uncomment to run the demo
// runPositionCalculatorDemo();
