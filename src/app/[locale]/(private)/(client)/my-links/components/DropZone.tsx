"use client";

import { useDroppable } from "@dnd-kit/core";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { useEffect, useState } from "react";

interface DropZoneProps {
  children: React.ReactNode;
}

type DropState = "idle" | "drag-ready" | "drag-over" | "drag-invalid";

export function DropZone({ children }: DropZoneProps) {
  const { dragState } = useBioBuilderStore();
  const { isDragging, draggedTemplate, draggedElement } = dragState;
  const { isOver, setNodeRef } = useDroppable({
    id: "canvas-drop-zone",
    data: {
      accepts: ["template", "element"],
      isCanvasDropZone: true,
    },
  });

  const [dropState, setDropState] = useState<DropState>("idle");

  // Determine drop state and animations
  useEffect(() => {
    if (!isDragging) {
      setDropState("idle");
    } else if (isOver && (draggedTemplate || draggedElement)) {
      setDropState("drag-over");
    } else if (isDragging && (draggedTemplate || draggedElement)) {
      setDropState("drag-ready");
    } else {
      setDropState("drag-invalid");
    }
  }, [isDragging, isOver, draggedTemplate, draggedElement]);

  const getContainerClasses = () => {
    const baseClasses = "relative transition-all duration-300 ease-out";

    switch (dropState) {
      case "drag-over":
        return `${baseClasses} bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-blue-900/25 dark:via-blue-800/35 dark:to-blue-900/25 border-2 border-solid border-blue-400 dark:border-blue-500 rounded-lg shadow-xl shadow-blue-500/30`;
      case "drag-ready":
        return `${baseClasses} bg-gradient-to-br from-blue-50/60 via-blue-100/40 to-blue-50/60 dark:from-blue-900/15 dark:via-blue-800/20 dark:to-blue-900/15 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg shadow-lg shadow-blue-500/15`;
      case "drag-invalid":
        return `${baseClasses} bg-gradient-to-br from-red-50/40 via-red-100/25 to-red-50/40 dark:from-red-900/15 dark:via-red-800/20 dark:to-red-900/15 border-2 border-dashed border-red-300/60 dark:border-red-600/60 rounded-lg shadow-lg shadow-red-500/15`;
      default:
        return baseClasses;
    }
  };

  const getAnimationClasses = () => {
    switch (dropState) {
      case "drag-over":
        return "animate-pulse";
      case "drag-ready":
        return "";
      default:
        return "";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`${getContainerClasses()} ${getAnimationClasses()}`}
      style={{
        transformOrigin: "center",
      }}
    >
      {children}

      {/* Enhanced drop indicator for valid template drops */}
      {dropState === "drag-over" && draggedTemplate && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-2xl border border-blue-300 dark:border-blue-600 transform transition-all duration-300 ease-out animate-bounce"
            style={{
              boxShadow:
                "0 15px 35px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center space-x-4 text-blue-600 dark:text-blue-400">
              <div className="relative">
                <span className="text-3xl">{draggedTemplate.icon}</span>
                {/* Enhanced success indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping shadow-lg shadow-green-500/50" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/50">
                  <div className="absolute inset-1 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold animate-pulse">
                  Drop to add element
                </span>
                <span className="text-xs opacity-75 font-medium">
                  {draggedTemplate.name}
                </span>
                {/* Progress indicator */}
                <div className="mt-1 w-full h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full animate-pulse"
                    style={{
                      animation:
                        "progress-fill 1.5s ease-in-out infinite alternate",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Pulsing border effect */}
            <div className="absolute inset-0 border-2 border-blue-400/50 dark:border-blue-500/50 rounded-xl animate-pulse pointer-events-none" />
          </div>
        </div>
      )}

      {/* Enhanced drop indicator for element reordering */}
      {dropState === "drag-over" && draggedElement && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-purple-500/95 text-white backdrop-blur-sm px-5 py-3 rounded-xl shadow-2xl border border-purple-400 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="text-xl">🔄</span>
                {/* Spinning indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  Reordering elements
                </span>
                <span className="text-xs opacity-80">Drop to reorganize</span>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-2 w-full h-1 bg-purple-400/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-200 rounded-full"
                style={{
                  animation:
                    "reorder-progress 1s ease-in-out infinite alternate",
                }}
              />
            </div>

            {/* Pulsing border */}
            <div className="absolute inset-0 border-2 border-purple-300/60 rounded-xl animate-pulse pointer-events-none" />
          </div>
        </div>
      )}

      {/* Enhanced ready state indicator with pulsing animations */}
      {dropState === "drag-ready" && !isOver && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Animated dashed border */}
          <div className="absolute inset-0 border-2 border-dashed border-blue-300/70 dark:border-blue-600/70 rounded-lg animate-pulse" />

          {/* Pulsing background overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-blue-50/10 to-blue-100/20 dark:from-blue-800/10 dark:via-blue-900/5 dark:to-blue-800/10 rounded-lg"
            style={{
              animation: "ready-pulse 2s ease-in-out infinite alternate",
            }}
          />

          {/* Enhanced corner indicators with staggered pulsing */}
          <div className="absolute top-5 left-5 w-4 h-4 border-l-2 border-t-2 border-blue-400 dark:border-blue-500 rounded-tl animate-pulse" />
          <div
            className="absolute top-5 right-5 w-4 h-4 border-r-2 border-t-2 border-blue-400 dark:border-blue-500 rounded-tr animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute bottom-5 left-5 w-4 h-4 border-l-2 border-b-2 border-blue-400 dark:border-blue-500 rounded-bl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-5 right-5 w-4 h-4 border-r-2 border-b-2 border-blue-400 dark:border-blue-500 rounded-br animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />

          {/* Center pulsing indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 border-2 border-blue-400 dark:border-blue-500 rounded-full animate-ping opacity-60" />
            <div className="absolute inset-0 w-6 h-6 border-2 border-blue-300 dark:border-blue-600 rounded-full animate-pulse" />
          </div>

          {/* Edge glow effects */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-2 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-8 h-2 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
          <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-8 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-8 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
        </div>
      )}

      {/* Invalid drop state indicator */}
      {dropState === "drag-invalid" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/5 dark:bg-red-400/5 rounded-lg" />
          <div className="absolute inset-0 border-2 border-dashed border-red-300/50 dark:border-red-600/50 rounded-lg animate-pulse" />
        </div>
      )}

      {/* Overlay for enhanced visual feedback */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-300 ease-out rounded-lg" />
    </div>
  );
}
