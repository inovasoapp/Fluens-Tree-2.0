"use client";

import { useDroppable } from "@dnd-kit/core";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { useEffect, useState } from "react";

interface DropZoneProps {
  children: React.ReactNode;
}

type DropState = "idle" | "drag-ready" | "drag-over" | "drag-invalid";

export function DropZone({ children }: DropZoneProps) {
  const { isDragging, draggedTemplate, draggedElement } = useBioBuilderStore();
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
        return `${baseClasses} bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-blue-900/20 border-2 border-solid border-blue-400 dark:border-blue-500 rounded-lg shadow-lg shadow-blue-500/20`;
      case "drag-ready":
        return `${baseClasses} bg-blue-50/50 dark:bg-blue-900/10 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg shadow-blue-500/10`;
      case "drag-invalid":
        return `${baseClasses} bg-red-50/30 dark:bg-red-900/10 border-2 border-dashed border-red-300/50 dark:border-red-600/50 rounded-lg shadow-red-500/10`;
      default:
        return baseClasses;
    }
  };

  const getAnimationClasses = () => {
    switch (dropState) {
      case "drag-over":
        return "animate-pulse";
      case "drag-ready":
        return "animate-pulse";
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

      {/* Enhanced drop indicator for valid drops */}
      {dropState === "drag-over" && draggedTemplate && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-xl border border-blue-300 dark:border-blue-600 transform transition-all duration-300 ease-out animate-bounce"
            style={{
              boxShadow:
                "0 10px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)",
            }}
          >
            <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
              <div className="relative">
                <span className="text-2xl">{draggedTemplate.icon}</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  Solte para adicionar
                </span>
                <span className="text-xs opacity-75">
                  {draggedTemplate.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced drop indicator for reordering */}
      {dropState === "drag-over" && draggedElement && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-purple-500/90 text-white backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-purple-400 animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔄</span>
              <span className="text-sm font-medium">
                Reorganizando elementos
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subtle ready state indicator */}
      {dropState === "drag-ready" && !isOver && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-dashed border-blue-300/60 dark:border-blue-600/60 rounded-lg" />

          {/* Corner indicators */}
          <div className="absolute top-5 left-5 w-3 h-3 border-l-2 border-t-2 border-blue-400 dark:border-blue-500 rounded-tl" />
          <div className="absolute top-5 right-5 w-3 h-3 border-r-2 border-t-2 border-blue-400 dark:border-blue-500 rounded-tr" />
          <div className="absolute bottom-5 left-5 w-3 h-3 border-l-2 border-b-2 border-blue-400 dark:border-blue-500 rounded-bl" />
          <div className="absolute bottom-5 right-5 w-3 h-3 border-r-2 border-b-2 border-blue-400 dark:border-blue-500 rounded-br" />
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
