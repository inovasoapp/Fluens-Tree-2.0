"use client";

import { useBioBuilderStore } from "@/stores/bio-builder-store";

export function DragFeedback() {
  const { isDragging, draggedTemplate, draggedElement } = useBioBuilderStore();

  if (!isDragging) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-2 rounded-md text-sm z-50 pointer-events-none shadow-lg">
      {draggedTemplate && (
        <div className="flex items-center space-x-2">
          <span>{draggedTemplate.icon}</span>
          <span>Arraste para o mockup do iPhone</span>
        </div>
      )}
      {draggedElement && (
        <div className="flex items-center space-x-2">
          <span>🔄</span>
          <span>Reordenando elemento</span>
        </div>
      )}
    </div>
  );
}
