"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BioElement } from "@/types/bio-builder";
import { ElementRenderer } from "./ElementRenderer";
import { InsertionIndicator } from "./InsertionIndicator";
import { GripVertical } from "lucide-react";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  PositionCalculator,
  createThrottledCalculator,
} from "@/lib/position-calculator";
import { useAnimationController } from "@/lib/animation-controller";

interface SortableElementProps {
  element: BioElement;
  isSelected: boolean;
  onSelect: (element: BioElement) => void;
}

interface InsertionState {
  show: boolean;
  position: "top" | "bottom";
  confidence: number;
  zone: "top" | "middle" | "bottom";
  usedDirectionHeuristic: boolean;
}

export function SortableElement({
  element,
  isSelected,
  onSelect,
}: SortableElementProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({
    id: element.id,
    data: {
      type: "element",
      element,
      index: element.position,
    },
  });

  const {
    dragState,
    setDragOverIndex,
    setInsertionPosition,
    clearDragOverState,
    getCurrentElementOrder,
  } = useBioBuilderStore();

  const { dragOverIndex } = dragState;

  // Animation controller for smooth element shifting
  const animationController = useAnimationController();

  const elementRef = useRef<HTMLDivElement>(null);

  // Enhanced insertion state with confidence and zone information
  const [insertionState, setInsertionState] = useState<InsertionState>({
    show: false,
    position: "top",
    confidence: 0,
    zone: "top",
    usedDirectionHeuristic: false,
  });

  // Create position calculator instance with memoization for performance
  const positionCalculator = useMemo(() => new PositionCalculator(), []);

  // Create throttled calculator for 60fps performance
  const throttledCalculator = useMemo(
    () => createThrottledCalculator(positionCalculator, 16), // ~60fps
    [positionCalculator]
  );

  // Performance tracking state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    calculationsPerSecond: 0,
    lastUpdateTime: 0,
    frameCount: 0,
  });

  // Enhanced position calculation with precise zone detection and performance optimization
  const handlePositionCalculation = useCallback(
    (mouseY: number) => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const draggedElementData = active?.data.current;
      const draggedIndex = draggedElementData?.index;
      const currentIndex = element.position;

      if (
        typeof draggedIndex !== "number" ||
        typeof currentIndex !== "number"
      ) {
        return;
      }

      // Use the enhanced position calculator
      const result = throttledCalculator(
        mouseY,
        rect,
        draggedIndex,
        currentIndex
      );

      if (!result) return; // Throttled, skip this update

      // Update performance metrics
      const now = Date.now();
      setPerformanceMetrics((prev) => {
        const timeDiff = now - prev.lastUpdateTime;
        const newFrameCount = prev.frameCount + 1;
        const calculationsPerSecond =
          timeDiff > 1000
            ? newFrameCount / (timeDiff / 1000)
            : prev.calculationsPerSecond;

        return {
          calculationsPerSecond:
            timeDiff > 1000
              ? calculationsPerSecond
              : prev.calculationsPerSecond,
          lastUpdateTime: now,
          frameCount: timeDiff > 1000 ? 0 : newFrameCount,
        };
      });

      // Update global state for other components
      setDragOverIndex(result.insertionIndex);
      setInsertionPosition(result.position);

      // Update local insertion state with enhanced information
      setInsertionState({
        show: true,
        position: result.position,
        confidence: result.confidence,
        zone: result.zone,
        usedDirectionHeuristic: result.usedDirectionHeuristic,
      });
    },
    [
      active,
      element.position,
      throttledCalculator,
      setDragOverIndex,
      setInsertionPosition,
    ]
  );

  // Enhanced mouse tracking with real-time position updates
  useEffect(() => {
    if (!isOver || !active || active.id === element.id) {
      setInsertionState({
        show: false,
        position: "top",
        confidence: 0,
        zone: "top",
        usedDirectionHeuristic: false,
      });
      positionCalculator.reset();
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      handlePositionCalculation(e.clientY);
    };

    // Use requestAnimationFrame for smooth 60fps updates
    let animationFrameId: number | null = null;
    let lastMouseY = 0;

    const smoothMouseMove = (e: MouseEvent) => {
      lastMouseY = e.clientY;

      if (animationFrameId) return; // Already scheduled

      animationFrameId = requestAnimationFrame(() => {
        handlePositionCalculation(lastMouseY);
        animationFrameId = null;
      });
    };

    document.addEventListener("mousemove", smoothMouseMove);

    return () => {
      document.removeEventListener("mousemove", smoothMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    isOver,
    active,
    element.id,
    handlePositionCalculation,
    positionCalculator,
  ]);

  // Enhanced cleanup with position calculator reset and animation cleanup
  useEffect(() => {
    if (!isOver) {
      setInsertionState({
        show: false,
        position: "top",
        confidence: 0,
        zone: "top",
        usedDirectionHeuristic: false,
      });

      // Clear global state if this element was responsible for it
      if (
        dragOverIndex === element.position ||
        dragOverIndex === element.position + 1
      ) {
        clearDragOverState();
      }

      // Reset position calculator for clean state
      positionCalculator.reset();

      // Cancel any active animations for this element
      animationController.cancelAnimation(element.id);
    }
  }, [
    isOver,
    dragOverIndex,
    element.position,
    clearDragOverState,
    positionCalculator,
    animationController,
    element.id,
  ]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Cancel any active animations when component unmounts
      animationController.cancelAnimation(element.id);
    };
  }, [animationController, element.id]);

  // Optimized transform and animation handling with memoization
  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition:
        transition || "transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    }),
    [transform, transition]
  );

  // Enhanced indicator visibility logic with confidence-based display
  const shouldShowTopIndicator = useMemo(
    () =>
      Boolean(
        active &&
          active.id !== element.id &&
          insertionState.show &&
          insertionState.position === "top" &&
          insertionState.confidence > 0.4 // Only show if confidence is above minimum threshold
      ),
    [active, element.id, insertionState]
  );

  const shouldShowBottomIndicator = useMemo(
    () =>
      Boolean(
        active &&
          active.id !== element.id &&
          insertionState.show &&
          insertionState.position === "bottom" &&
          insertionState.confidence > 0.4 // Only show if confidence is above minimum threshold
      ),
    [active, element.id, insertionState]
  );

  // Enhanced visual shifting logic with smooth animations
  const getElementShift = useMemo(() => {
    if (!active || active.id === element.id || dragOverIndex === null) {
      return {
        shouldAnimate: false,
        opacity: 1,
        scale: 1,
        backgroundColor: "transparent",
        borderColor: "transparent",
      };
    }

    const draggedIndex = active.data.current?.index;
    const currentIndex = element.position;

    if (typeof draggedIndex !== "number" || typeof currentIndex !== "number") {
      return {
        shouldAnimate: false,
        opacity: 1,
        scale: 1,
        backgroundColor: "transparent",
        borderColor: "transparent",
      };
    }

    // Calculate if this element should shift to make space for insertion
    let shouldShift = false;
    let shiftDirection: "up" | "down" = "down";
    let isInReorganizationZone = false;

    if (draggedIndex < currentIndex && dragOverIndex <= currentIndex) {
      // Dragging from above: elements at or after insertion point shift down
      shouldShift = currentIndex >= dragOverIndex;
      shiftDirection = "down";
      isInReorganizationZone = true;
    } else if (draggedIndex > currentIndex && dragOverIndex > currentIndex) {
      // Dragging from below: elements before insertion point shift up
      shouldShift = currentIndex < dragOverIndex;
      shiftDirection = "up";
      isInReorganizationZone = true;
    } else if (draggedIndex < currentIndex && dragOverIndex > currentIndex) {
      // Dragging from above to below: no shift needed for elements after the target
      shouldShift = false;
      isInReorganizationZone = false;
    } else if (draggedIndex > currentIndex && dragOverIndex <= currentIndex) {
      // Dragging from below to above: no shift needed for elements before the target
      shouldShift = false;
      isInReorganizationZone = false;
    }

    if (shouldShift) {
      return {
        shouldAnimate: true,
        shiftDirection,
        shiftDistance: 60, // Distance to shift elements
        opacity: 0.75,
        scale: 0.98,
        backgroundColor: "rgba(147, 51, 234, 0.05)", // Purple tint for reorganization
        borderColor: "rgba(147, 51, 234, 0.2)",
      };
    } else if (isInReorganizationZone) {
      // Elements in reorganization zone but not shifting get subtle highlight
      return {
        shouldAnimate: false,
        opacity: 0.9,
        scale: 1,
        backgroundColor: "rgba(59, 130, 246, 0.03)", // Blue tint for zone
        borderColor: "rgba(59, 130, 246, 0.1)",
      };
    }

    return {
      shouldAnimate: false,
      opacity: 1,
      scale: 1,
      backgroundColor: "transparent",
      borderColor: "transparent",
    };
  }, [active, element.id, element.position, dragOverIndex]);

  // Memoize element shift to prevent unnecessary recalculations
  const elementShift = getElementShift;

  // Effect to handle smooth element shifting animations
  useEffect(() => {
    if (
      !elementShift.shouldAnimate ||
      !elementShift.shiftDirection ||
      !elementShift.shiftDistance
    ) {
      // If element shouldn't animate, cancel any existing animation
      animationController.cancelAnimation(element.id);
      return;
    }

    // Animate the element shift
    animationController
      .animateElementShift(
        element.id,
        elementShift.shiftDirection,
        elementShift.shiftDistance,
        {
          duration: 300,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }
      )
      .catch((error) => {
        // Animation was cancelled or failed, which is normal during rapid drag changes
        if (error.message !== "Animation cancelled") {
          console.warn(`Animation failed for element ${element.id}:`, error);
        }
      });

    // Cleanup function to cancel animation if component unmounts or effect re-runs
    return () => {
      animationController.cancelAnimation(element.id);
    };
  }, [
    elementShift.shouldAnimate,
    elementShift.shiftDirection,
    elementShift.shiftDistance,
    element.id,
    animationController,
  ]);

  // Effect to handle batch animations for multiple elements
  useEffect(() => {
    if (!active || active.id === element.id || dragOverIndex === null) {
      return;
    }

    // Get all elements that need to be animated
    const currentElements = getCurrentElementOrder();
    const draggedIndex = active.data.current?.index;

    if (typeof draggedIndex !== "number") return;

    // Collect animations for elements that should shift
    const animations = currentElements
      .filter((el) => el.id !== active.id && el.id !== element.id)
      .map((el) => {
        const shouldShift =
          (draggedIndex < el.position && dragOverIndex <= el.position) ||
          (draggedIndex > el.position && dragOverIndex > el.position);

        if (!shouldShift) return null;

        const direction: "up" | "down" =
          draggedIndex < el.position ? "down" : "up";

        return {
          elementId: el.id,
          direction,
          distance: 60,
        };
      })
      .filter((anim): anim is NonNullable<typeof anim> => anim !== null);

    // Only batch animate if we have multiple elements to animate
    if (animations.length > 1) {
      animationController.batchAnimations(animations).catch((error) => {
        console.warn("Batch animation failed:", error);
      });
    }
  }, [
    active,
    element.id,
    dragOverIndex,
    getCurrentElementOrder,
    animationController,
  ]);

  return (
    <div ref={elementRef} className="relative">
      {/* Top Insertion Indicator */}
      <InsertionIndicator
        isVisible={shouldShowTopIndicator}
        position="top"
        index={element.position}
      />

      <div
        ref={setNodeRef}
        className={`group relative transition-all duration-300 ease-out ${
          isSelected
            ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg shadow-blue-500/20"
            : "hover:ring-1 hover:ring-zinc-300 hover:shadow-md"
        } ${
          isDragging
            ? "opacity-50 scale-95 z-10 shadow-2xl shadow-purple-500/30"
            : "opacity-100 scale-100"
        } ${
          isOver && !isDragging && active && active.id !== element.id
            ? "ring-2 ring-purple-300 dark:ring-purple-600 bg-purple-50 dark:bg-purple-900/10 shadow-lg shadow-purple-500/20"
            : ""
        }`}
        style={{
          ...style,
          transform: `${style.transform || ""} scale(${
            elementShift.scale
          })`.trim(),
          opacity: isDragging ? 0.5 : elementShift.opacity,
          backgroundColor: elementShift.backgroundColor,
          borderColor: elementShift.borderColor,
          borderWidth:
            elementShift.borderColor !== "transparent" ? "1px" : "0px",
          borderStyle: "solid",
          borderRadius: "8px",
          transition: isDragging
            ? "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 200ms ease, box-shadow 300ms ease, background-color 300ms ease, border-color 300ms ease"
            : "opacity 200ms ease, background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease, transform 200ms ease",
        }}
        data-element-id={element.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(element);
        }}
      >
        {/* Enhanced Drag Handle with better visual feedback */}
        <div
          className={`absolute -left-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-grab active:cursor-grabbing ${
            isDragging ? "opacity-100 scale-110" : ""
          } ${isOver && !isDragging ? "opacity-100" : ""}`}
          {...attributes}
          {...listeners}
        >
          <div
            className={`
            bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 
            rounded-md p-1.5 shadow-sm hover:shadow-lg transition-all duration-300
            ${
              isDragging
                ? "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600 shadow-purple-500/20"
                : ""
            }
          `}
          >
            <GripVertical
              className={`
              w-3 h-3 transition-colors duration-300
              ${
                isDragging
                  ? "text-purple-500 dark:text-purple-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }
            `}
            />
          </div>
        </div>

        {/* Element Content with enhanced feedback */}
        <div className="element-hover relative">
          <ElementRenderer element={element} />

          {/* Enhanced reorganization feedback overlay with smooth animations */}
          {elementShift.shouldAnimate && !isDragging && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/60 via-purple-50/40 to-purple-100/60 dark:from-purple-900/25 dark:via-purple-800/15 dark:to-purple-900/25 rounded-lg pointer-events-none transition-all duration-300">
              <div className="absolute inset-0 border border-purple-200 dark:border-purple-700 rounded-lg animate-pulse" />

              {/* Animated shift direction indicator */}
              <div
                className={`absolute inset-0 bg-gradient-to-${
                  elementShift.shiftDirection === "up" ? "t" : "b"
                } from-purple-200/30 via-transparent to-transparent dark:from-purple-700/20 rounded-lg transition-all duration-300`}
                style={{
                  animation:
                    "shift-indicator 1.5s ease-in-out infinite alternate",
                }}
              />

              {/* Pulsing reorganization indicator */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full animate-ping opacity-75" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full opacity-90" />
            </div>
          )}

          {/* Enhanced zone highlight for elements in reorganization area */}
          {elementShift.backgroundColor !== "transparent" &&
            !elementShift.shouldAnimate && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 via-blue-100/25 to-blue-50/40 dark:from-blue-900/15 dark:via-blue-800/8 dark:to-blue-900/15 rounded-lg pointer-events-none transition-all duration-300">
                {/* Subtle zone indicator */}
                <div className="absolute inset-0 border border-blue-200/50 dark:border-blue-700/50 rounded-lg" />

                {/* Zone type indicator */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-60" />

                {/* Flowing zone highlight */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 dark:via-blue-600/10 to-transparent rounded-lg"
                  style={{
                    animation: "zone-flow 3s ease-in-out infinite alternate",
                  }}
                />
              </div>
            )}
        </div>

        {/* Enhanced Selection Indicator */}
        {isSelected && (
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
          </div>
        )}

        {/* Enhanced Drag Over Indicator with sophisticated animations */}
        {isOver && !isDragging && active && active.id !== element.id && (
          <>
            {/* Primary drag over overlay with enhanced gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/70 via-purple-50/50 to-purple-100/70 dark:from-purple-900/40 dark:via-purple-800/25 dark:to-purple-900/40 border-2 border-purple-300 dark:border-purple-600 rounded-lg pointer-events-none">
              <div className="absolute inset-0 bg-purple-500/15 rounded-lg animate-pulse" />

              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/30 dark:via-purple-600/20 to-transparent opacity-70 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Pulsing border animation */}
            <div className="absolute inset-0 border-2 border-purple-400/60 dark:border-purple-500/60 rounded-lg pointer-events-none animate-pulse" />

            {/* Flowing gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/60 dark:via-purple-700/40 to-transparent opacity-70 pointer-events-none">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/50 dark:via-purple-600/30 to-transparent"
                style={{
                  animation: "flow-gradient 2s ease-in-out infinite alternate",
                }}
              />
            </div>

            {/* Enhanced corner accent indicators with staggered animations */}
            <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping opacity-80 shadow-lg shadow-purple-500/50" />
            <div
              className="absolute top-1 right-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping opacity-80 shadow-lg shadow-purple-500/50"
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping opacity-80 shadow-lg shadow-purple-500/50"
              style={{ animationDelay: "0.6s" }}
            />
            <div
              className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping opacity-80 shadow-lg shadow-purple-500/50"
              style={{ animationDelay: "0.9s" }}
            />

            {/* Center pulsing indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-60 shadow-lg shadow-purple-400/50" />

            {/* Edge glow effects */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-purple-400 rounded-full blur-sm animate-pulse opacity-70" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-1 bg-purple-400 rounded-full blur-sm animate-pulse opacity-70" />
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-purple-400 rounded-full blur-sm animate-pulse opacity-70" />
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-purple-400 rounded-full blur-sm animate-pulse opacity-70" />
          </>
        )}

        {/* Enhanced drag state indicator with operation status */}
        {isDragging && (
          <div className="absolute -top-2 -right-2 flex items-center space-x-1">
            {/* Primary drag indicator */}
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50">
              <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping" />
              <div className="absolute inset-1 bg-purple-300 rounded-full animate-pulse" />
            </div>

            {/* Drag operation status indicator */}
            <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                <span>Dragging</span>
              </div>
            </div>
          </div>
        )}

        {/* Drag operation progress indicator */}
        {active && active.id === element.id && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none z-50">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-spin" />
              <span>Moving element...</span>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 top-full">
              <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/80" />
            </div>
          </div>
        )}

        {/* Performance and confidence indicator (development mode) */}
        {process.env.NODE_ENV === "development" && insertionState.show && (
          <div className="absolute -top-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
            <div>Zone: {insertionState.zone}</div>
            <div>
              Confidence: {(insertionState.confidence * 100).toFixed(0)}%
            </div>
            <div>
              Heuristic: {insertionState.usedDirectionHeuristic ? "Yes" : "No"}
            </div>
            <div>
              FPS: {performanceMetrics.calculationsPerSecond.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Insertion Indicator */}
      <InsertionIndicator
        isVisible={shouldShowBottomIndicator}
        position="bottom"
        index={element.position}
      />
    </div>
  );
}
