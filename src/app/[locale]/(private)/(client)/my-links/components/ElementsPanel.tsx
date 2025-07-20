"use client";

import { elementTemplates } from "@/data/element-templates";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DraggableTemplate } from "./DraggableTemplate";

export function ElementsPanel() {
  const { addElementFromTemplate } = useBioBuilderStore();

  const handleAddElement = (template: (typeof elementTemplates)[0]) => {
    addElementFromTemplate(template);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Elements
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Drag elements to add them to your bio page
        </p>
      </div>

      {/* Elements List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {elementTemplates.map((template) => (
            <DraggableTemplate
              key={template.id}
              template={template}
              onAdd={handleAddElement}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Drag elements to the canvas or click to add them
        </div>
      </div>
    </div>
  );
}
