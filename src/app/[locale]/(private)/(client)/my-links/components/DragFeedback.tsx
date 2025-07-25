"use client";

import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { useEffect, useState } from "react";

type DragState =
  | "dragging"
  | "valid-position"
  | "invalid-position"
  | "reordering";

export function DragFeedback() {
  const {
    isDragging,
    draggedTemplate,
    draggedElement,
    dragOverIndex,
    insertionPosition,
  } = useBioBuilderStore();

  const [dragState, setDragState] = useState<DragState>("dragging");
  const [isVisible, setIsVisible] = useState(false);

  // Determine drag state based on context
  useEffect(() => {
    if (!isDragging) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    if (draggedElement) {
      setDragState("reordering");
    } else if (draggedTemplate) {
      setDragState("dragging");
    }
  }, [isDragging, draggedTemplate, draggedElement, dragOverIndex]);

  // Handle smooth entrance/exit animations
  useEffect(() => {
    if (isDragging && !isVisible) {
      setIsVisible(true);
    } else if (!isDragging && isVisible) {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isDragging, isVisible]);

  if (!isVisible) return null;

  const getStateConfig = () => {
    switch (dragState) {
      case "reordering":
        return {
          bgColor: "bg-purple-500",
          borderColor: "border-purple-400",
          icon: "🔄",
          message:
            dragOverIndex !== null
              ? `Inserindo na posição ${dragOverIndex + 1}`
              : "Reordenando elemento",
          animation: "animate-pulse",
          glowColor: "shadow-purple-500/50",
        };
      case "valid-position":
        return {
          bgColor: "bg-green-500",
          borderColor: "border-green-400",
          icon: "✓",
          message: `Solte para adicionar ${draggedTemplate?.name}`,
          animation: "animate-bounce",
          glowColor: "shadow-green-500/50",
        };
      case "invalid-position":
        return {
          bgColor: "bg-red-500",
          borderColor: "border-red-400",
          icon: "⚠️",
          message: "Área inválida - arraste para o mockup",
          animation: "animate-pulse",
          glowColor: "shadow-red-500/50",
        };
      default:
        return {
          bgColor: "bg-blue-500",
          borderColor: "border-blue-400",
          icon: draggedTemplate?.icon || "📱",
          message: "Arraste para o mockup do iPhone",
          animation: "animate-pulse",
          glowColor: "shadow-blue-500/50",
        };
    }
  };

  const config = getStateConfig();

  return (
    <>
      {/* Main feedback tooltip */}
      <div
        className={`
          fixed top-4 left-1/2 transform -translate-x-1/2 
          ${config.bgColor} text-white px-4 py-2.5 rounded-lg text-sm z-50 
          pointer-events-none shadow-lg ${config.glowColor}
          transition-all duration-300 ease-out
          ${
            isDragging
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-2 scale-95"
          }
          ${config.animation}
        `}
        style={{
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{config.icon}</span>
          <span className="font-medium">{config.message}</span>
        </div>

        {/* Progress indicator for reordering */}
        {dragState === "reordering" && dragOverIndex !== null && (
          <div className="mt-1 w-full bg-purple-400/30 rounded-full h-1">
            <div
              className="bg-white h-1 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, (dragOverIndex + 1) * 20)}%` }}
            />
          </div>
        )}
      </div>

      {/* Secondary visual cues */}
      {dragState === "reordering" && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
          <div className="flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400 bg-white/90 dark:bg-zinc-800/90 px-2 py-1 rounded backdrop-blur-sm border border-purple-200 dark:border-purple-700">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span>
              {insertionPosition === "top"
                ? "↑ Inserir acima"
                : "↓ Inserir abaixo"}
            </span>
          </div>
        </div>
      )}

      {/* Drag state indicator (corner notification) */}
      <div
        className={`
          fixed top-4 right-4 z-40 pointer-events-none
          transition-all duration-300 ease-out
          ${
            isDragging ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }
        `}
      >
        <div
          className={`w-3 h-3 rounded-full ${config.bgColor} shadow-lg ${config.glowColor} ${config.animation}`}
        />
      </div>
    </>
  );
}
