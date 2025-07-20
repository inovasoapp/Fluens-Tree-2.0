"use client";

import { create } from "zustand";
import { BioElement, BioPage, ElementTemplate } from "@/types/bio-builder";

interface CanvasPosition {
  x: number;
  y: number;
  scale: number;
}

interface BioBuilderState {
  // Current page being edited
  currentPage: BioPage | null;

  // Selected element for editing
  selectedElement: BioElement | null;

  // Canvas position and zoom
  canvasPosition: CanvasPosition;

  // Drag and drop state
  isDragging: boolean;
  draggedElement: BioElement | null;
  draggedTemplate: ElementTemplate | null;

  // Canvas drag state
  isCanvasDragging: boolean;

  // Actions
  setCurrentPage: (page: BioPage) => void;
  setSelectedElement: (element: BioElement | null) => void;

  // Canvas positioning
  setCanvasPosition: (position: Partial<CanvasPosition>) => void;
  centerCanvas: () => void;
  setIsCanvasDragging: (isDragging: boolean) => void;

  // Element management
  addElement: (element: Omit<BioElement, "id" | "position">) => void;
  addElementFromTemplate: (
    template: ElementTemplate,
    position?: number
  ) => void;
  updateElement: (id: string, data: Partial<BioElement["data"]>) => void;
  deleteElement: (id: string) => void;
  reorderElements: (fromIndex: number, toIndex: number) => void;
  moveElement: (elementId: string, newPosition: number) => void;

  // Drag and drop
  setIsDragging: (isDragging: boolean) => void;
  setDraggedElement: (element: BioElement | null) => void;
  setDraggedTemplate: (template: ElementTemplate | null) => void;

  // Page management
  updatePageTheme: (theme: Partial<BioPage["theme"]>) => void;
}

export const useBioBuilderStore = create<BioBuilderState>((set, get) => ({
  currentPage: {
    id: "1",
    title: "My Bio Page",
    slug: "my-bio",
    elements: [],
    theme: {
      backgroundColor: "#ffffff",
      primaryColor: "#000000",
      secondaryColor: "#666666",
      fontFamily: "Inter",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  selectedElement: null,
  canvasPosition: {
    x: 0,
    y: 0,
    scale: 1,
  },
  isDragging: false,
  draggedElement: null,
  draggedTemplate: null,
  isCanvasDragging: false,

  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedElement: (element) => set({ selectedElement: element }),

  setCanvasPosition: (position) => {
    const state = get();
    set({
      canvasPosition: {
        ...state.canvasPosition,
        ...position,
      },
    });
  },

  centerCanvas: () => {
    set({
      canvasPosition: {
        x: 0,
        y: 0,
        scale: 1,
      },
    });
  },

  setIsCanvasDragging: (isDragging) => set({ isCanvasDragging: isDragging }),

  addElement: (elementData) => {
    const state = get();
    if (!state.currentPage) return;

    const newElement: BioElement = {
      ...elementData,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: state.currentPage.elements.length,
    };

    const updatedPage = {
      ...state.currentPage,
      elements: [...state.currentPage.elements, newElement],
      updatedAt: new Date(),
    };

    set({ currentPage: updatedPage });
  },

  addElementFromTemplate: (template, position) => {
    const state = get();
    if (!state.currentPage) return;

    const newElement: BioElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      position:
        position !== undefined ? position : state.currentPage.elements.length,
      data: { ...template.defaultData },
    };

    let updatedElements = [...state.currentPage.elements];

    if (position !== undefined) {
      // Insert at specific position and reorder
      updatedElements.splice(position, 0, newElement);
      updatedElements = updatedElements.map((element, index) => ({
        ...element,
        position: index,
      }));
    } else {
      // Add at the end
      updatedElements.push(newElement);
    }

    const updatedPage = {
      ...state.currentPage,
      elements: updatedElements,
      updatedAt: new Date(),
    };

    set({ currentPage: updatedPage, selectedElement: newElement });
  },

  updateElement: (id, data) => {
    const state = get();
    if (!state.currentPage) return;

    const updatedElements = state.currentPage.elements.map((element) =>
      element.id === id
        ? { ...element, data: { ...element.data, ...data } }
        : element
    );

    const updatedPage = {
      ...state.currentPage,
      elements: updatedElements,
      updatedAt: new Date(),
    };

    set({ currentPage: updatedPage });
  },

  deleteElement: (id) => {
    const state = get();
    if (!state.currentPage) return;

    const updatedElements = state.currentPage.elements
      .filter((element) => element.id !== id)
      .map((element, index) => ({ ...element, position: index }));

    const updatedPage = {
      ...state.currentPage,
      elements: updatedElements,
      updatedAt: new Date(),
    };

    set({
      currentPage: updatedPage,
      selectedElement:
        state.selectedElement?.id === id ? null : state.selectedElement,
    });
  },

  reorderElements: (fromIndex, toIndex) => {
    const state = get();
    if (!state.currentPage) return;

    const elements = [...state.currentPage.elements];
    const [movedElement] = elements.splice(fromIndex, 1);
    elements.splice(toIndex, 0, movedElement);

    const updatedElements = elements.map((element, index) => ({
      ...element,
      position: index,
    }));

    const updatedPage = {
      ...state.currentPage,
      elements: updatedElements,
      updatedAt: new Date(),
    };

    set({ currentPage: updatedPage });
  },

  moveElement: (elementId, newPosition) => {
    const state = get();
    if (!state.currentPage) return;

    const elements = [...state.currentPage.elements];
    const elementIndex = elements.findIndex((el) => el.id === elementId);

    if (elementIndex === -1) return;

    const [movedElement] = elements.splice(elementIndex, 1);
    elements.splice(newPosition, 0, movedElement);

    const updatedElements = elements.map((element, index) => ({
      ...element,
      position: index,
    }));

    const updatedPage = {
      ...state.currentPage,
      elements: updatedElements,
      updatedAt: new Date(),
    };

    set({ currentPage: updatedPage });
  },

  setIsDragging: (isDragging) => set({ isDragging }),
  setDraggedElement: (element) => set({ draggedElement: element }),
  setDraggedTemplate: (template) => set({ draggedTemplate: template }),

  updatePageTheme: (theme) => {
    const state = get();
    if (!state.currentPage) return;

    const updatedPage = {
      ...state.currentPage,
      theme: { ...state.currentPage.theme, ...theme },
      updatedAt: new Date(),
    };

    set({ currentPage: updatedPage });
  },
}));
