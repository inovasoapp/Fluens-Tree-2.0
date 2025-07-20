"use client";

import { elementTemplates } from "@/data/element-templates";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DraggableTemplate } from "./DraggableTemplate";
import { ChevronLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function ElementsPanel() {
  const { addElementFromTemplate } = useBioBuilderStore();
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddElement = (template: (typeof elementTemplates)[0]) => {
    addElementFromTemplate(template);
  };

  // Organize elements by category
  const categories = [
    {
      name: "Hero / Headers",
      elements: elementTemplates.filter((t) => t.type === "profile"),
    },
    {
      name: "Layout",
      elements: elementTemplates.filter((t) => t.type === "divider"),
    },
    {
      name: "Base Elements",
      elements: elementTemplates.filter((t) =>
        ["text", "link"].includes(t.type)
      ),
    },
    {
      name: "Medias",
      elements: elementTemplates.filter((t) => t.type === "image"),
    },
    {
      name: "Special Elements",
      elements: elementTemplates.filter((t) => t.type === "social"),
    },
  ];

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      elements: category.elements.filter((element) =>
        element.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.elements.length > 0);

  return (
    <div className="h-full flex flex-col bg-card text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Voltar</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Esconder</span>
            <div className="w-6 h-3 bg-gray-600 rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <span className="text-white font-medium">Blocos</span>
          <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
          </div>
          <span className="text-gray-400">Biblioteca</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Pesquisar elementos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Elements List */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <h3 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
                {category.name}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {category.elements.map((template) => (
                  <DraggableTemplate
                    key={template.id}
                    template={template}
                    onAdd={handleAddElement}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                Nenhum elemento encontrado
              </div>
              <div className="text-sm text-gray-500">
                Tente pesquisar por outro termo
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
