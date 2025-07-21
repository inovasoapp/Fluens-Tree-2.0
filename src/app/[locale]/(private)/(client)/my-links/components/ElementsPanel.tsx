"use client";

import { elementTemplates } from "@/data/element-templates";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DraggableTemplate } from "./DraggableTemplate";
import {
  ChevronLeft,
  Search,
  LayoutGrid,
  Image,
  PanelLeftClose,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaLibrary } from "./MediaLibrary";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ElementsPanel() {
  const { addElementFromTemplate } = useBioBuilderStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"blocks" | "library">("blocks");

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
    <div className="h-full flex flex-col bg-zinc-900 text-white">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <ChevronLeft size={20} className=" text-gray-400" strokeWidth={1} />
            <span className="text-sm text-gray-400">Voltar</span>
          </Link>

          <Button variant="ghost" className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Esconder</span>
            <PanelLeftClose
              size={20}
              className=" text-gray-400"
              strokeWidth={1}
            />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "blocks" | "library")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4 bg-transparent w-full p-0">
            <TabsTrigger
              value="blocks"
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-none",
                "data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500",
                "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Blocos</span>
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-none",
                "data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500",
                "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400"
              )}
            >
              <Image className="w-4 h-4" />
              <span>Biblioteca</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blocks" className="m-0 p-0">
            {/* Search - Only show in blocks tab */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Pesquisar elementos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>

            {/* Elements List */}
            <ScrollArea className="flex-1 custom-scrollbar h-[calc(100vh-180px)]">
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
          </TabsContent>

          <TabsContent
            value="library"
            className="m-0 p-0 h-[calc(100vh-140px)]"
          >
            <MediaLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
