"use client";

import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";
import { ElementTemplate } from "@/types/bio-builder";

interface DraggableTemplateProps {
  template: ElementTemplate;
  onAdd: (template: ElementTemplate) => void;
}

export function DraggableTemplate({ template, onAdd }: DraggableTemplateProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `template-${template.id}`,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <Button
        variant="outline"
        className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing"
        onClick={() => onAdd(template)}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center space-x-3 w-full">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-2xl">{template.icon}</span>
          <div className="text-left flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {template.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Drag to add or click
            </div>
          </div>
          <Plus className="w-4 h-4 text-gray-400" />
        </div>
      </Button>
    </div>
  );
}
