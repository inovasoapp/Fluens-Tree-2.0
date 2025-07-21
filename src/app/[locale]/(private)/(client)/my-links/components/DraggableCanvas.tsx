"use client";

import { useRef, useEffect, useState } from "react";
import { useBioBuilderStore } from "@/stores/bio-builder-store";

interface DraggableCanvasProps {
  children: React.ReactNode;
}

export function DraggableCanvas({ children }: DraggableCanvasProps) {
  const {
    canvasPosition,
    setCanvasPosition,
    isCanvasDragging,
    setIsCanvasDragging,
    isDragging, // Element drag state
    centerCanvas,
  } = useBioBuilderStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [initialPosition, setInitialPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Ensure canvas is centered on mount
  useEffect(() => {
    // Only center if position is at default (0,0,1) - meaning it hasn't been moved by user
    if (
      canvasPosition.x === 0 &&
      canvasPosition.y === 0 &&
      canvasPosition.scale === 1
    ) {
      centerCanvas();
    }
  }, []); // Run only once on mount

  // Handle keyboard events for space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
        document.body.style.cursor = "grab";
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(false);
        if (!isCanvasDragging) {
          document.body.style.cursor = "";
        }
      }
    };

    // Prevent space from scrolling the page
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keypress", handleKeyPress);
      document.body.style.cursor = "";
    };
  }, [isCanvasDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start canvas drag if we're already dragging elements
    if (isDragging) return;

    // Start drag on middle mouse button OR when space is pressed with left click
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      e.preventDefault();
      e.stopPropagation();
      setIsCanvasDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialPosition({ x: canvasPosition.x, y: canvasPosition.y });
      document.body.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isCanvasDragging || !dragStart || !initialPosition) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setCanvasPosition({
      x: initialPosition.x + deltaX,
      y: initialPosition.y + deltaY,
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isCanvasDragging) {
      setIsCanvasDragging(false);
      setDragStart(null);
      setInitialPosition(null);
      document.body.style.cursor = isSpacePressed ? "grab" : "";
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.5, Math.min(2, canvasPosition.scale + delta));
      setCanvasPosition({ scale: newScale });
    }
  };

  // Handle mouse events
  useEffect(() => {
    if (isCanvasDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMouseMove(e);
      };

      const handleGlobalMouseUp = (e: MouseEvent) => {
        handleMouseUp(e);
      };

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
        document.body.style.userSelect = "";
      };
    }
  }, [isCanvasDragging, dragStart, initialPosition]);

  // Update cursor based on space key state
  const getCursor = () => {
    if (isCanvasDragging) return "grabbing";
    if (isSpacePressed && !isDragging) return "grab";
    if (isDragging) return "default";
    return "default";
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full overflow-hidden relative"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      style={{
        cursor: getCursor(),
      }}
    >
      <div
        className="transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasPosition.scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>

      {/* Canvas drag instructions */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg pointer-events-none opacity-60">
        <div className="space-y-1">
          <div
            className={`flex items-center space-x-2 ${
              isSpacePressed ? "text-yellow-300 font-medium" : ""
            }`}
          >
            <span>⌨️</span>
            <span>Hold Space + drag to pan</span>
            {isSpacePressed && <span className="text-yellow-300">●</span>}
          </div>
          <div>🖱️ Middle click + drag to pan</div>
          <div>⌘ Ctrl + scroll to zoom</div>
        </div>
      </div>

      {/* Space key indicator */}
      {isSpacePressed && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-sm px-4 py-2 rounded-lg font-medium shadow-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <span>⌨️</span>
            <span>Space pressed - Click and drag to move canvas</span>
          </div>
        </div>
      )}

      {/* Canvas dragging indicator */}
      {isCanvasDragging && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-lg">
          <div className="flex items-center space-x-2">
            <span>🖱️</span>
            <span>Moving canvas...</span>
          </div>
        </div>
      )}
    </div>
  );
}
