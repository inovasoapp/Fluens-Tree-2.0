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

  // Removed global click handler as it was causing issues with element editing

  // Track the last valid background type to prevent unwanted reversions
  const [lastBackgroundType, setLastBackgroundType] = useState<string | null>(
    null
  );

  // Handle background style with error handling
  useEffect(() => {
    if (!currentPage?.theme) return;

    try {
      const currentType = currentPage.theme.backgroundType;

      // Log the current background type for debugging
      console.log(`Canvas: Rendering background type: ${currentType}`);

      // Update our last background type if this is a valid type
      if (
        currentType &&
        (currentType === "solid" ||
          currentType === "gradient" ||
          currentType === "image")
      ) {
        setLastBackgroundType(currentType);
        console.log(`Canvas: Updated last background type to ${currentType}`);
      }

      // If the background type is "image" but there's no image URL, we should still
      // maintain the "image" type and show the upload UI instead of reverting to solid
      if (currentType === "image" && !currentPage.theme.backgroundImage?.url) {
        console.log(
          "Canvas: Image background selected but no image URL yet, maintaining image type"
        );
        // Use a placeholder style that doesn't change the background type
        setBackgroundStyle({
          backgroundColor: currentPage.theme.backgroundColor || "#ffffff",
        });
        setBackgroundError(false);
        return;
      }

      // If we have a last background type of "image" but the current type is not "image",
      // and we're in the middle of an upload (no URL yet), maintain the "image" type
      if (
        lastBackgroundType === "image" &&
        currentType !== "image" &&
        !currentPage.theme.backgroundImage?.url
      ) {
        console.log(
          "Canvas: Preventing reversion from image type during upload"
        );
        setBackgroundStyle({
          backgroundColor: currentPage.theme.backgroundColor || "#ffffff",
        });
        setBackgroundError(false);
        return;
      }

      const style = getBackgroundStyle(currentPage.theme);
      setBackgroundStyle(style);
      setBackgroundError(false);
    } catch (error) {
      console.error("Error applying background style:", error);
      setBackgroundError(true);
      setBackgroundStyle(getErrorFallbackStyle());
    }
  }, [currentPage?.theme, lastBackgroundType]);

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
      {/* Deselect Button */}
      {selectedElement && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={() => setSelectedElement(null)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg"
          >
            <span>✏️</span>
            <span>Editar fundo do canvas</span>
          </button>
        </div>
      )}

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
                    onClick={() => {
                      // Deselect the current element when clicking on the background
                      if (selectedElement) {
                        setSelectedElement(null);
                      }
                    }}
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
                      <div
                        className="p-4 space-y-2 min-h-full"
                        onClick={(e) => {
                          // Check if the click was directly on this div (not on a child element)
                          if (e.target === e.currentTarget) {
                            // Deselect the current element
                            setSelectedElement(null);
                          }
                        }}
                      >
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
                          <div
                            className="flex flex-col items-center justify-center h-96 text-center"
                            onClick={() => setSelectedElement(null)}
                          >
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
                              <div className="flex items-center justify-center space-x-2 mt-4 text-blue-500">
                                <span>💡</span>
                                <span>
                                  Click anywhere on the canvas to show
                                  background settings
                                </span>
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
            {selectedElement && (
              <button
                onClick={() => setSelectedElement(null)}
                className="mt-2 px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors"
              >
                Mostrar configurações de fundo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
