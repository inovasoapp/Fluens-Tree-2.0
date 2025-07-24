"use client";

import { useState } from "react";
import { ElementsPanel } from "./ElementsPanel";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { Toolbar } from "./Toolbar";
import { DragDropContext } from "./DragDropContext";
import { ShowPanelButton } from "./ShowPanelButton";
import { DragFeedback } from "./DragFeedback";
import { ToastContainer } from "./Toast";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import "../bio-builder.css";

export function BioBuilder() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isElementsPanelVisible, setIsElementsPanelVisible] = useState(true);
  const { selectedElement, isDragging } = useBioBuilderStore();

  return (
    <DragDropContext>
      <div
        className={`bio-builder-container flex h-full bg-zinc-50 dark:bg-zinc-900 ${
          isDragging ? "select-none" : ""
        }`}
      >
        {/* Left Panel - Elements */}
        {isElementsPanelVisible && (
          <div
            className="bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 flex-shrink-0 min-w-[320px] animate-in slide-in-from-left duration-300"
            style={{ width: leftPanelWidth }}
          >
            <ElementsPanel onHide={() => setIsElementsPanelVisible(false)} />
          </div>
        )}

        {/* Show Panel Button - positioned absolutely when panel is hidden */}
        {!isElementsPanelVisible && (
          <ShowPanelButton onClick={() => setIsElementsPanelVisible(true)} />
        )}

        {/* Main Content Area - expands when left panel is hidden */}
        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          {/* Toolbar */}
          <div className="toolbar-glass">
            <Toolbar />
          </div>

          {/* Canvas Area */}
          <div className="canvas-container flex-1 flex items-center justify-center overflow-auto">
            <Canvas />
          </div>
        </div>

        {/* Right Panel - Properties (always show) */}
        <div
          className="properties-panel bg-white dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 flex-shrink-0"
          style={{ width: rightPanelWidth }}
        >
          <PropertiesPanel />
        </div>

        {/* Componente de feedback visual durante o drag */}
        <DragFeedback />

        {/* Sistema de notificações */}
        <ToastContainer />
      </div>
    </DragDropContext>
  );
}
