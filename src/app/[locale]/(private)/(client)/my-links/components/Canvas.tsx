"use client";

import { useState, useEffect, useCallback } from "react";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SortableElement } from "./SortableElement";
import { DropZone } from "./DropZone";
import { DraggableCanvas } from "./DraggableCanvas";
import { CanvasControls } from "./CanvasControls";
import {
  getBackgroundStyle,
  handleImageLoadError,
  getErrorFallbackStyle,
} from "@/lib/background-utils";
import { BackgroundErrorBoundary } from "./BackgroundErrorBoundary";

export function Canvas() {
  const { currentPage, selectedElement, setSelectedElement } =
    useBioBuilderStore();

  const [backgroundError, setBackgroundError] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>(
    {}
  );

  // Handle background style with error handling
  useEffect(() => {
    if (!currentPage?.theme) return;

    try {
      const style = getBackgroundStyle(currentPage.theme);
      setBackgroundStyle(style);
      setBackgroundError(false);
    } catch (error) {
      console.error("Error applying background style:", error);
      setBackgroundError(true);
      setBackgroundStyle(getErrorFallbackStyle());
    }
  }, [currentPage?.theme]);

  // Handle image load errors
  const handleBackgroundImageError = useCallback(() => {
    if (currentPage?.theme?.backgroundType === "image") {
      console.warn("Background image failed to load");
      setBackgroundError(true);
      const fallbackStyle = handleImageLoadError(
        currentPage.theme.backgroundImage?.url || "",
        currentPage.theme.backgroundColor || "#ffffff"
      );
      setBackgroundStyle(fallbackStyle);
    }
  }, [currentPage?.theme]);

  if (!currentPage) return null;

  return (
    <div className="relative w-full h-full bg-background">
      <DraggableCanvas>
        <div className="flex items-center justify-center w-full h-full">
          {/* iPhone Mockup */}
          <div className="relative">
            {/* iPhone Frame */}
            <div className="iphone-mockup relative w-[375px] h-[812px] bg-black rounded-[60px] p-2 shadow-2xl">
              {/* Screen */}
              <div className="w-full h-full rounded-[50px] overflow-hidden relative">
                {/* Background Layer */}
                <BackgroundErrorBoundary section="Canvas Background">
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={backgroundStyle}
                  >
                    {/* Hidden image for error detection when using image backgrounds */}
                    {currentPage.theme.backgroundType === "image" &&
                      currentPage.theme.backgroundImage?.url && (
                        <img
                          src={currentPage.theme.backgroundImage.url}
                          alt=""
                          className="hidden"
                          onError={handleBackgroundImageError}
                          onLoad={() => setBackgroundError(false)}
                        />
                      )}

                    {/* Error indicator overlay */}
                    {backgroundError && (
                      <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
                        Erro no fundo
                      </div>
                    )}
                  </div>
                </BackgroundErrorBoundary>

                {/* Content Layer */}
                <div className="relative w-full h-full">
                  {/* Status Bar */}
                  <div className="absolute top-0 left-0 right-0 h-11 bg-black/5 flex items-center justify-between px-6 text-sm font-medium z-10">
                    <span className="text-black/70">9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 bg-black/30 rounded-sm"></div>
                      <div className="w-6 h-3 bg-black/30 rounded-sm"></div>
                      <div className="w-6 h-3 bg-black/30 rounded-sm"></div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <ScrollArea className="h-full pt-11 custom-scrollbar">
                    <DropZone>
                      <div className="p-4 space-y-2 min-h-full">
                        {currentPage.elements
                          .sort((a, b) => a.position - b.position)
                          .map((element) => (
                            <SortableElement
                              key={element.id}
                              element={element}
                              isSelected={selectedElement?.id === element.id}
                              onSelect={setSelectedElement}
                            />
                          ))}

                        {/* Empty State */}
                        {currentPage.elements.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-96 text-center">
                            <div className="text-6xl mb-4 animate-bounce">
                              📱
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Start building your bio page
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-4">
                              Drag elements from the left panel to create your
                              personalized bio page
                            </p>
                            <div className="space-y-2 text-xs text-gray-400 dark:text-gray-500">
                              <div className="flex items-center justify-center space-x-2">
                                <span>🖱️</span>
                                <span>Drag & drop elements</span>
                              </div>
                              <div className="flex items-center justify-center space-x-2">
                                <span>👆</span>
                                <span>Click to add quickly</span>
                              </div>
                              <div className="flex items-center justify-center space-x-2">
                                <span>✏️</span>
                                <span>Select to edit properties</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DropZone>
                  </ScrollArea>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black/30 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* iPhone Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-[60px] pointer-events-none"></div>
          </div>
        </div>
      </DraggableCanvas>

      {/* Canvas Controls */}
      <CanvasControls />

      {/* Canvas Info */}
      <div className="absolute bottom-6 left-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            iPhone 15 Pro Preview
          </div>
          <div className="space-y-1 text-xs">
            <div>{currentPage.elements.length} elements</div>
            <div className="text-gray-400 dark:text-gray-500">
              Drag canvas to reposition
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
