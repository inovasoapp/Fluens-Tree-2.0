"use client";

import { useState } from "react";
import { ElementsPanel } from "./ElementsPanel";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { Toolbar } from "./Toolbar";
import { DragDropContext } from "./DragDropContext";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import "../bio-builder.css";

export function BioBuilder() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const { selectedElement, isDragging } = useBioBuilderStore();

  return (
    <DragDropContext>
      <div
        className={`bio-builder-container flex h-full bg-gray-50 dark:bg-gray-900 ${
          isDragging ? "select-none" : ""
        }`}
      >
        {/* Left Panel - Elements */}
        <div
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0"
          style={{ width: leftPanelWidth }}
        >
          <ElementsPanel />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="toolbar-glass">
            <Toolbar />
          </div>

          {/* Canvas Area */}
          <div className="canvas-container flex-1 flex items-center justify-center overflow-auto">
            <Canvas />
          </div>
        </div>

        {/* Right Panel - Properties (only show when element is selected) */}
        {selectedElement && (
          <div
            className="properties-panel bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-shrink-0"
            style={{ width: rightPanelWidth }}
          >
            <PropertiesPanel />
          </div>
        )}

        {/* Drag Overlay Styles */}
        {isDragging && (
          <div className="fixed inset-0 pointer-events-none z-40 bg-black/5 dark:bg-white/5" />
        )}
      </div>
    </DragDropContext>
  );
}
