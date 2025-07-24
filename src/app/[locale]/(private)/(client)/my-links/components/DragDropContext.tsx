"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  // Usar rectIntersection em vez de closestCorners para detecção mais precisa
  rectIntersection,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { ElementRenderer } from "./ElementRenderer";
import { elementTemplates } from "@/data/element-templates";
import { toast } from "./Toast";

interface DragDropContextProps {
  children: React.ReactNode;
}

export function DragDropContext({ children }: DragDropContextProps) {
  const {
    currentPage,
    draggedElement,
    draggedTemplate,

    setDraggedElement,
    setDraggedTemplate,
    setIsDragging,

    reorderElements,
    addElementFromTemplate,
  } = useBioBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setIsDragging(true);

    // Check if dragging from template panel
    if (active.id.toString().startsWith("template-")) {
      const templateId = active.id.toString().replace("template-", "");
      const template = elementTemplates.find((t) => t.id === templateId);
      if (template) {
        setDraggedTemplate(template);
      }
    } else {
      // Dragging existing element
      const element = currentPage?.elements.find((el) => el.id === active.id);
      if (element) {
        setDraggedElement(element);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    // Verificar se estamos sobre uma área dropável válida
    const isValidDropArea =
      over &&
      (over.id === "canvas-drop-zone" ||
        over.id.toString().startsWith("element-"));

    // Atualizar o estado no store para controlar a renderização do overlay

    if (isValidDropArea) {
      console.log("Dragging over valid drop zone:", over.id);
    } else {
      console.log("Dragging over invalid area or no area");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setIsDragging(false);

    // Verificar se o drop foi em uma área válida
    const isValidDrop =
      over &&
      (over.id === "canvas-drop-zone" ||
        over.id.toString().startsWith("element-"));

    // Se não estamos sobre uma área dropável válida, cancelamos a operação
    if (!isValidDrop) {
      console.log("Drop em área inválida ou fora de área dropável");

      // Mostrar feedback visual para o usuário
      if (active.id.toString().startsWith("template-")) {
        const templateId = active.id.toString().replace("template-", "");
        const template = elementTemplates.find((t) => t.id === templateId);
        if (template) {
          toast.show(
            `Solte o elemento "${template.name}" apenas no mockup do iPhone`,
            "warning"
          );
        } else {
          toast.show("Solte elementos apenas no mockup do iPhone", "warning");
        }
      } else {
        toast.show("Solte elementos apenas no mockup do iPhone", "warning");
      }

      // Limpar o estado de drag e retornar sem fazer alterações
      setDraggedElement(null);
      setDraggedTemplate(null);
      return;
    }

    // Se chegamos aqui, o drop foi em uma área válida
    // Podemos prosseguir com a lógica normal
    setDraggedElement(null);
    setDraggedTemplate(null);

    // Handle template drop to canvas
    if (
      active.id.toString().startsWith("template-") &&
      over.id === "canvas-drop-zone"
    ) {
      const templateId = active.id.toString().replace("template-", "");
      const template = elementTemplates.find((t) => t.id === templateId);
      if (template) {
        addElementFromTemplate(template);
      }
      return;
    }

    // Handle element reordering within canvas
    if (active.id !== over.id && currentPage) {
      const activeElement = currentPage.elements.find(
        (el) => el.id === active.id
      );
      const overElement = currentPage.elements.find((el) => el.id === over.id);

      if (activeElement && overElement) {
        const activeIndex = currentPage.elements.findIndex(
          (el) => el.id === active.id
        );
        const overIndex = currentPage.elements.findIndex(
          (el) => el.id === over.id
        );

        reorderElements(activeIndex, overIndex);
      }
    }

    // Handle template drop between elements
    if (
      active.id.toString().startsWith("template-") &&
      over.id.toString().startsWith("element-")
    ) {
      const templateId = active.id.toString().replace("template-", "");
      const template = elementTemplates.find((t) => t.id === templateId);
      const overElement = currentPage?.elements.find((el) => el.id === over.id);

      if (template && overElement) {
        const insertPosition = overElement.position;
        addElementFromTemplate(template, insertPosition);
      }
    }
  };

  const renderDragOverlay = () => {
    if (draggedElement) {
      return (
        <div className="opacity-80 transform rotate-3 scale-105">
          <ElementRenderer element={draggedElement} />
        </div>
      );
    }

    if (draggedTemplate) {
      return (
        <div className="opacity-80 transform rotate-3 scale-105 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-lg border">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{draggedTemplate.icon}</span>
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {draggedTemplate.name}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Drop to add
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={currentPage?.elements.map((el) => el.id) || []}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>

      <DragOverlay>{renderDragOverlay()}</DragOverlay>
    </DndContext>
  );
}
