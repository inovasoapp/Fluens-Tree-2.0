"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BioElement } from "@/types/bio-builder";
import { ElementRenderer } from "./ElementRenderer";
import { InsertionIndicator } from "./InsertionIndicator";
import { GripVertical } from "lucide-react";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { useEffect, useRef, useState } from "react";

interface SortableElementProps {
  element: BioElement;
  isSelected: boolean;
  onSelect: (element: BioElement) => void;
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
    dragOverIndex,
    setDragOverIndex,
    setInsertionPosition,
    clearDragOverState,
  } = useBioBuilderStore();

  const elementRef = useRef<HTMLDivElement>(null);
  const [localInsertionPosition, setLocalInsertionPosition] = useState<{
    show: boolean;
    position: "top" | "bottom";
  }>({ show: false, position: "top" });

  // Enhanced insertion position calculation with better precision
  useEffect(() => {
    if (!isOver || !active || active.id === element.id) {
      setLocalInsertionPosition({ show: false, position: "top" });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const mouseY = e.clientY;
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const elementHeight = rect.height;

      // Create zones for better insertion detection
      const topZone = elementTop + elementHeight * 0.3; // Top 30% of element
      const bottomZone = elementBottom - elementHeight * 0.3; // Bottom 30% of element

      const draggedElementData = active.data.current;
      const draggedIndex = draggedElementData?.index;
      const currentIndex = element.position;

      if (
        typeof draggedIndex === "number" &&
        typeof currentIndex === "number"
      ) {
        let insertionIndex: number;
        let position: "top" | "bottom";

        // Determine insertion position based on mouse position and drag direction
        if (mouseY <= topZone) {
          // Mouse is in the top zone - insert above this element
          insertionIndex = currentIndex;
          position = "top";
        } else if (mouseY >= bottomZone) {
          // Mouse is in the bottom zone - insert below this element
          insertionIndex = currentIndex + 1;
          position = "bottom";
        } else {
          // Mouse is in the middle zone - use drag direction to determine position
          if (draggedIndex < currentIndex) {
            // Dragging from above - insert below
            insertionIndex = currentIndex + 1;
            position = "bottom";
          } else {
            // Dragging from below - insert above
            insertionIndex = currentIndex;
            position = "top";
          }
        }

        // Update global state for other components
        setDragOverIndex(insertionIndex);
        setInsertionPosition(position);

        // Update local state for this component's indicators
        setLocalInsertionPosition({ show: true, position });
      }
    };

    // Add throttling to improve performance
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledMouseMove = (e: MouseEvent) => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        handleMouseMove(e);
        throttleTimeout = null;
      }, 16); // ~60fps
    };

    document.addEventListener("mousemove", throttledMouseMove);
    return () => {
      document.removeEventListener("mousemove", throttledMouseMove);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [
    isOver,
    active,
    element.id,
    element.position,
    setDragOverIndex,
    setInsertionPosition,
  ]);

  // Clear drag over state when not over this element
  useEffect(() => {
    if (!isOver) {
      setLocalInsertionPosition({ show: false, position: "top" });
      if (
        dragOverIndex === element.position ||
        dragOverIndex === element.position + 1
      ) {
        clearDragOverState();
      }
    }
  }, [isOver, dragOverIndex, element.position, clearDragOverState]);

  // Enhanced transform and animation handling
  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition || "transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  // Determine if we should show insertion indicators with improved logic
  const shouldShowTopIndicator = Boolean(
    active &&
      active.id !== element.id &&
      localInsertionPosition.show &&
      localInsertionPosition.position === "top"
  );

  const shouldShowBottomIndicator = Boolean(
    active &&
      active.id !== element.id &&
      localInsertionPosition.show &&
      localInsertionPosition.position === "bottom"
  );

  // Enhanced visual shifting logic for real-time reorganization with smooth transitions
  const getElementShift = () => {
    if (!active || active.id === element.id || dragOverIndex === null) {
      return {
        transform: "",
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
        transform: "",
        opacity: 1,
        scale: 1,
        backgroundColor: "transparent",
        borderColor: "transparent",
      };
    }

    // Calculate if this element should shift to make space for insertion
    let shouldShift = false;
    let shiftDirection = 0; // 1 for down, -1 for up
    let isInReorganizationZone = false;

    if (draggedIndex < currentIndex && dragOverIndex <= currentIndex) {
      // Dragging from above: elements at or after insertion point shift down
      shouldShift = currentIndex >= dragOverIndex;
      shiftDirection = 1;
      isInReorganizationZone = true;
    } else if (draggedIndex > currentIndex && dragOverIndex > currentIndex) {
      // Dragging from below: elements before insertion point shift up
      shouldShift = currentIndex < dragOverIndex;
      shiftDirection = -1;
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
      const shiftAmount = shiftDirection * 12; // Increased shift for better visibility
      return {
        transform: `translateY(${shiftAmount}px)`,
        opacity: 0.75,
        scale: 0.98,
        backgroundColor: "rgba(147, 51, 234, 0.05)", // Purple tint for reorganization
        borderColor: "rgba(147, 51, 234, 0.2)",
      };
    } else if (isInReorganizationZone) {
      // Elements in reorganization zone but not shifting get subtle highlight
      return {
        transform: "",
        opacity: 0.9,
        scale: 1,
        backgroundColor: "rgba(59, 130, 246, 0.03)", // Blue tint for zone
        borderColor: "rgba(59, 130, 246, 0.1)",
      };
    }

    return {
      transform: "",
      opacity: 1,
      scale: 1,
      backgroundColor: "transparent",
      borderColor: "transparent",
    };
  };

  const elementShift = getElementShift();

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
          transform: `${style.transform || ""} ${
            elementShift.transform
          } scale(${elementShift.scale})`.trim(),
          opacity: isDragging ? 0.5 : elementShift.opacity,
          backgroundColor: elementShift.backgroundColor,
          borderColor: elementShift.borderColor,
          borderWidth:
            elementShift.borderColor !== "transparent" ? "1px" : "0px",
          borderStyle: "solid",
          borderRadius: "8px",
          transition: isDragging
            ? "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 200ms ease, box-shadow 300ms ease"
            : "all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
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

          {/* Enhanced reorganization feedback overlay */}
          {elementShift.transform && !isDragging && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 via-purple-50/30 to-purple-100/50 dark:from-purple-900/20 dark:via-purple-800/10 dark:to-purple-900/20 rounded-lg pointer-events-none transition-all duration-300">
              <div className="absolute inset-0 border border-purple-200 dark:border-purple-700 rounded-lg animate-pulse" />
            </div>
          )}

          {/* Zone highlight for elements in reorganization area */}
          {elementShift.backgroundColor !== "transparent" &&
            elementShift.transform === "" && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-blue-100/20 to-blue-50/30 dark:from-blue-900/10 dark:via-blue-800/5 dark:to-blue-900/10 rounded-lg pointer-events-none transition-all duration-300" />
            )}
        </div>

        {/* Enhanced Selection Indicator */}
        {isSelected && (
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
          </div>
        )}

        {/* Enhanced Drag Over Indicator with better animations */}
        {isOver && !isDragging && active && active.id !== element.id && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/60 via-purple-50/40 to-purple-100/60 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-purple-900/30 border-2 border-purple-300 dark:border-purple-600 rounded-lg pointer-events-none">
              <div className="absolute inset-0 bg-purple-500/10 rounded-lg animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/50 dark:via-purple-700/30 to-transparent opacity-60 pointer-events-none animate-pulse" />

            {/* Corner accent indicators */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-purple-500 rounded-full animate-ping opacity-75" />
            <div
              className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping opacity-75"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute bottom-1 left-1 w-2 h-2 bg-purple-500 rounded-full animate-ping opacity-75"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute bottom-1 right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping opacity-75"
              style={{ animationDelay: "1.5s" }}
            />
          </>
        )}

        {/* Drag state indicator */}
        {isDragging && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-bounce">
            <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping" />
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
