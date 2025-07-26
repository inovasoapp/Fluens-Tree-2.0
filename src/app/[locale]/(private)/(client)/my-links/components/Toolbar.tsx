"use client";

import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Eye,
  Smartphone,
  Monitor,
  Undo,
  Redo,
  Settings,
  Share,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react";
import { useState } from "react";

export function Toolbar() {
  const {
    currentPage,
    updatePageTheme,
    canvasPosition,
    setCanvasPosition,
    setSelectedElement,
    centerCanvas,
    isCanvasDragging,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useBioBuilderStore();
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">(
    "mobile"
  );

  if (!currentPage) return null;

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving page...", currentPage);
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log("Opening preview...");
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Sharing page...");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting page...");
  };

  const handleZoomIn = () => {
    const newScale = Math.min(2, canvasPosition.scale + 0.1);
    setCanvasPosition({ scale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.5, canvasPosition.scale - 0.1);
    setCanvasPosition({ scale: newScale });
  };

  const zoomPercentage = Math.round(canvasPosition.scale * 100);

  return (
    <div
      className="bg-white dark:bg-card border-b border-zinc-200 dark:border-zinc-700 px-4 py-3"
      onClick={() => setSelectedElement(null)}
    >
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Page Title */}
          <div className="flex items-center space-x-2">
            <Input
              value={currentPage.title}
              onChange={(e) => {
                // TODO: Update page title
                console.log("Updating title:", e.target.value);
              }}
              className="text-lg font-semibold border-none shadow-none p-0 h-auto bg-transparent"
              placeholder="Page Title"
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!canUndo()}
              onClick={undo}
              title="Desfazer última ação"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!canRedo()}
              onClick={redo}
              title="Refazer última ação"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex items-center space-x-4">
          {/* Canvas Controls */}
          <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={canvasPosition.scale <= 0.5}
              className="h-8"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <span className="text-sm text-zinc-600 dark:text-zinc-300 min-w-12 text-center">
              {zoomPercentage}%
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={canvasPosition.scale >= 2}
              className="h-8"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-4" />

            <Button
              variant="ghost"
              size="sm"
              onClick={centerCanvas}
              className="h-8"
              title="Center Canvas"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Device Preview Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <Button
              variant={previewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("mobile")}
              className="h-8"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant={previewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("desktop")}
              className="h-8"
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Theme Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <Button variant="ghost" size="sm" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>

          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>

          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center space-x-4">
          <span>{currentPage.elements.length} elements</span>
          <span>
            Last saved:{" "}
            {typeof currentPage.updatedAt === "string"
              ? new Date(currentPage.updatedAt).toLocaleTimeString()
              : currentPage.updatedAt instanceof Date
              ? currentPage.updatedAt.toLocaleTimeString()
              : "Unknown"}
          </span>
          {isCanvasDragging && (
            <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
              <Move className="w-3 h-3" />
              <span>Moving canvas</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>
            Canvas: {Math.round(canvasPosition.x)},{" "}
            {Math.round(canvasPosition.y)}
          </span>
          <span>/{currentPage.slug}</span>
        </div>
      </div>
    </div>
  );
}
