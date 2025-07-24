"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BioElement } from "@/types/bio-builder";
import { ElementRenderer } from "./ElementRenderer";
import { GripVertical } from "lucide-react";

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
  } = useSortable({
    id: element.id,
  });

  // Não aplicar transform ao elemento original durante o drag
  // O DragOverlay será responsável por mostrar a representação visual do elemento sendo arrastado
  const style = {
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-blue-500 ring-offset-2"
          : "hover:ring-1 hover:ring-zinc-300"
      }`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent click from reaching the background
        onSelect(element);
      }}
    >
      {/* Drag Handle */}
      <div
        className={`absolute -left-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing ${
          isDragging ? "opacity-100" : ""
        }`}
        {...attributes}
        {...listeners}
      >
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-1 shadow-sm">
          <GripVertical className="w-3 h-3 text-zinc-400" />
        </div>
      </div>

      {/* Element Content */}
      <div className="element-hover">
        <ElementRenderer element={element} />
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
      )}

      {/* Hover Indicator */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-200 ${
          isDragging
            ? "bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 rounded"
            : ""
        }`}
      />
    </div>
  );
}
