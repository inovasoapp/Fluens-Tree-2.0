"use client";

import { useDroppable } from "@dnd-kit/core";
import { useBioBuilderStore } from "@/stores/bio-builder-store";

interface DropZoneProps {
  children: React.ReactNode;
}

export function DropZone({ children }: DropZoneProps) {
  const { isDragging, draggedTemplate } = useBioBuilderStore();
  const { isOver, setNodeRef } = useDroppable({
    id: "canvas-drop-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative transition-all duration-200 ${
        isDragging && draggedTemplate
          ? "bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg"
          : ""
      } ${
        isOver && draggedTemplate
          ? "bg-blue-100 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500"
          : ""
      }`}
    >
      {children}

      {/* Drop Indicator */}
      {isDragging && draggedTemplate && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-blue-300 dark:border-blue-600">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <span className="text-lg">{draggedTemplate.icon}</span>
              <span className="text-sm font-medium">
                Drop to add {draggedTemplate.name}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
