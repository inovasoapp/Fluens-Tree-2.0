"use client";

import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
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

  // Get template preview based on type
  const getTemplatePreview = () => {
    switch (template.type) {
      case "profile":
        return (
          <div className="space-y-2">
            <div className="w-8 h-8 bg-zinc-600 rounded-full mx-auto"></div>
            <div className="space-y-1">
              <div className="h-2 bg-zinc-600 rounded w-3/4 mx-auto"></div>
              <div className="h-1.5 bg-zinc-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        );
      case "link":
        return (
          <div className="space-y-2">
            <div className="h-8 bg-zinc-600 rounded-md flex items-center justify-between px-2">
              <div className="h-1.5 bg-zinc-400 rounded w-1/2"></div>
              <div className="w-3 h-3 bg-zinc-400 rounded"></div>
            </div>
          </div>
        );
      case "text":
        return (
          <div className="space-y-1">
            <div className="h-1.5 bg-zinc-600 rounded w-full"></div>
            <div className="h-1.5 bg-zinc-600 rounded w-3/4"></div>
            <div className="h-1.5 bg-zinc-600 rounded w-1/2"></div>
          </div>
        );
      case "social":
        return (
          <div className="space-y-2">
            <div className="h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-md flex items-center justify-between px-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white rounded"></div>
                <div className="h-1.5 bg-white rounded w-12"></div>
              </div>
              <div className="w-3 h-3 bg-white rounded"></div>
            </div>
          </div>
        );
      case "divider":
        return (
          <div className="py-4">
            <div className="h-px bg-zinc-600 w-full"></div>
          </div>
        );
      case "image":
        return (
          <div className="space-y-2">
            <div className="h-12 bg-zinc-600 rounded-md flex items-center justify-center">
              <div className="w-6 h-6 bg-zinc-500 rounded"></div>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-12 bg-zinc-600 rounded-md flex items-center justify-center">
            <span className="text-2xl">{template.icon}</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <Button
        variant="ghost"
        className="w-full h-auto p-0 bg-[#2a2a2a] hover:bg-[#333333] border border-zinc-700 hover:border-zinc-600 cursor-grab active:cursor-grabbing rounded-lg"
        onClick={() => onAdd(template)}
        {...attributes}
        {...listeners}
      >
        <div className="p-4 w-full">
          {/* Preview */}
          <div className="mb-3 h-16 flex items-center justify-center">
            {getTemplatePreview()}
          </div>

          {/* Title */}
          <div className="text-xs text-zinc-300 text-center font-medium">
            {template.name}
          </div>

          {/* Drag Handle */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-3 h-3 text-zinc-500" />
          </div>
        </div>
      </Button>
    </div>
  );
}
