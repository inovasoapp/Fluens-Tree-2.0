"use client";

import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Maximize2,
  Minimize2,
} from "lucide-react";

export function CanvasControls() {
  const { canvasPosition, setCanvasPosition, centerCanvas, isCanvasDragging } =
    useBioBuilderStore();

  const handleZoomIn = () => {
    const newScale = Math.min(2, canvasPosition.scale + 0.1);
    setCanvasPosition({ scale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.5, canvasPosition.scale - 0.1);
    setCanvasPosition({ scale: newScale });
  };

  const handleFitToScreen = () => {
    setCanvasPosition({ scale: 1 });
  };

  const handleResetPosition = () => {
    centerCanvas();
  };

  const zoomPercentage = Math.round(canvasPosition.scale * 100);

  return (
    <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-10">
      {/* Zoom Controls */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex flex-col space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={canvasPosition.scale >= 2}
          className="h-8 w-8 p-0"
          title="Zoom In (Ctrl + Scroll Up)"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <div className="text-xs text-center text-gray-500 dark:text-gray-400 py-1 min-w-12">
          {zoomPercentage}%
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={canvasPosition.scale <= 0.5}
          className="h-8 w-8 p-0"
          title="Zoom Out (Ctrl + Scroll Down)"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Position Controls */}
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex flex-col space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFitToScreen}
          className="h-8 w-8 p-0"
          title="Fit to Screen (100%)"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetPosition}
          className="h-8 w-8 p-0"
          title="Center Canvas"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas Status */}
      {(canvasPosition.x !== 0 ||
        canvasPosition.y !== 0 ||
        canvasPosition.scale !== 1) && (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>X: {Math.round(canvasPosition.x)}px</div>
            <div>Y: {Math.round(canvasPosition.y)}px</div>
            <div>Scale: {zoomPercentage}%</div>
          </div>
        </div>
      )}

      {/* Drag Indicator */}
      {isCanvasDragging && (
        <div className="bg-blue-500 text-white rounded-lg shadow-lg p-2 flex items-center space-x-2">
          <Move className="w-4 h-4" />
          <span className="text-xs font-medium">Moving Canvas</span>
        </div>
      )}
    </div>
  );
}
