"use client";

import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Settings } from "lucide-react";
import { BackgroundEditor } from "./BackgroundEditor";

export function PropertiesPanel() {
  const { selectedElement, updateElement, deleteElement, setSelectedElement } =
    useBioBuilderStore();

  const handleUpdate = (field: string, value: any) => {
    if (!selectedElement) return;
    updateElement(selectedElement.id, { [field]: value });
  };

  const handleDelete = () => {
    if (!selectedElement) return;
    deleteElement(selectedElement.id);
  };

  const renderElementSpecificFields = () => {
    if (!selectedElement) return null;

    switch (selectedElement.type) {
      case "profile":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={selectedElement.data.name || ""}
                onChange={(e) => handleUpdate("name", e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={selectedElement.data.bio || ""}
                onChange={(e) => handleUpdate("bio", e.target.value)}
                placeholder="Your bio description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={selectedElement.data.avatar || ""}
                onChange={(e) => handleUpdate("avatar", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </>
        );

      case "link":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={selectedElement.data.title || ""}
                onChange={(e) => handleUpdate("title", e.target.value)}
                placeholder="Link title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={selectedElement.data.url || ""}
                onChange={(e) => handleUpdate("url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </>
        );

      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={selectedElement.data.content || ""}
              onChange={(e) => handleUpdate("content", e.target.value)}
              placeholder="Your text content"
              rows={4}
            />
          </div>
        );

      case "social":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={selectedElement.data.platform || "instagram"}
                onValueChange={(value) => handleUpdate("platform", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={selectedElement.data.username || ""}
                onChange={(e) => handleUpdate("username", e.target.value)}
                placeholder="yourusername"
              />
            </div>
          </>
        );

      case "image":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={selectedElement.data.src || ""}
                onChange={(e) => handleUpdate("src", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={selectedElement.data.alt || ""}
                onChange={(e) => handleUpdate("alt", e.target.value)}
                placeholder="Image description"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Render element properties panel
  const renderElementProperties = () => (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-500">✏️</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Propriedades do Elemento
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedElement(null)}
          title="Voltar para configurações da página"
          className="flex items-center gap-1"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="text-xs">Editar fundo</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Element Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedElement!.type.charAt(0).toUpperCase() +
                selectedElement!.type.slice(1)}{" "}
              Element
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <Separator />

          {/* Element-specific fields */}
          <div className="space-y-4">{renderElementSpecificFields()}</div>

          <Separator />

          {/* Styling Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Styling
            </h3>

            {/* Background Color */}
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={selectedElement!.data.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    handleUpdate("backgroundColor", e.target.value)
                  }
                  className="w-12 h-8 p-1 border rounded"
                />
                <Input
                  value={selectedElement!.data.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    handleUpdate("backgroundColor", e.target.value)
                  }
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Text Color */}
            {selectedElement!.type !== "divider" &&
              selectedElement!.type !== "image" && (
                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={selectedElement!.data.textColor || "#000000"}
                      onChange={(e) =>
                        handleUpdate("textColor", e.target.value)
                      }
                      className="w-12 h-8 p-1 border rounded"
                    />
                    <Input
                      value={selectedElement!.data.textColor || "#000000"}
                      onChange={(e) =>
                        handleUpdate("textColor", e.target.value)
                      }
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

            {/* Border Radius */}
            {selectedElement!.type !== "divider" && (
              <div className="space-y-2">
                <Label>
                  Border Radius: {selectedElement!.data.borderRadius || 0}px
                </Label>
                <Slider
                  value={[selectedElement!.data.borderRadius || 0]}
                  onValueChange={(value) =>
                    handleUpdate("borderRadius", value[0])
                  }
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {/* Padding */}
            <div className="space-y-2">
              <Label>Padding: {selectedElement!.data.padding || 0}px</Label>
              <Slider
                value={[selectedElement!.data.padding || 0]}
                onValueChange={(value) => handleUpdate("padding", value[0])}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <Label>Margin: {selectedElement!.data.margin || 0}px</Label>
              <Slider
                value={[selectedElement!.data.margin || 0]}
                onValueChange={(value) => handleUpdate("margin", value[0])}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Typography */}
            {selectedElement!.type !== "divider" &&
              selectedElement!.type !== "image" && (
                <>
                  <div className="space-y-2">
                    <Label>
                      Font Size: {selectedElement!.data.fontSize || 14}px
                    </Label>
                    <Slider
                      value={[selectedElement!.data.fontSize || 14]}
                      onValueChange={(value) =>
                        handleUpdate("fontSize", value[0])
                      }
                      min={10}
                      max={32}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontWeight">Font Weight</Label>
                    <Select
                      value={selectedElement!.data.fontWeight || "normal"}
                      onValueChange={(value) =>
                        handleUpdate("fontWeight", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textAlign">Text Align</Label>
                    <Select
                      value={selectedElement!.data.textAlign || "left"}
                      onValueChange={(value) =>
                        handleUpdate("textAlign", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  // Render page settings panel (background editor)
  const renderPageSettings = () => {
    // Get current page from the store that was already initialized at the component level
    const currentPage = useBioBuilderStore.getState().currentPage;
    const hasElements =
      currentPage?.elements && currentPage.elements.length > 0;

    return (
      <div className="h-full flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Configurações da Página
            </h2>
          </div>

          {/* Show element selection button if there are elements */}
          {hasElements && (
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Find the first element and select it
                  const firstElement = currentPage?.elements[0];
                  if (firstElement) {
                    setSelectedElement(firstElement);
                  }
                }}
                className="text-xs"
              >
                <span className="mr-1">✏️</span> Editar elementos
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Background Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Background
                </h3>
              </div>

              <BackgroundEditor />
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Main render with smooth transitions
  return (
    <div className="h-full relative overflow-hidden">
      {/* Transition container */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
          selectedElement
            ? "transform translate-x-0"
            : "transform translate-x-0"
        }`}
      >
        {selectedElement ? renderElementProperties() : renderPageSettings()}
      </div>

      {/* Mode toggle button */}
      {selectedElement && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => setSelectedElement(null)}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Settings className="w-3 h-3" />
            <span>Editar fundo</span>
          </button>
        </div>
      )}

      {/* Debug info */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-400">
        {selectedElement
          ? "Modo: Edição de elemento"
          : "Modo: Configurações de fundo"}
      </div>
    </div>
  );
}
