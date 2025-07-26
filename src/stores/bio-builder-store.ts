"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  BioElement,
  BioPage,
  ElementTemplate,
  BioPageTheme,
  BackgroundGradient,
  BackgroundImage,
} from "@/types/bio-builder";

interface CanvasPosition {
  x: number;
  y: number;
  scale: number;
}

interface DragPerformanceMetrics {
  calculationsPerSecond: number;
  lastCalculationTime: number;
  totalCalculations: number;
  averageCalculationTime: number;
  memoryUsage: number;
  activeAnimations: number;
}

interface DragStateVersion {
  version: number;
  timestamp: number;
  operationId: string;
}

interface EnhancedDragState {
  isDragging: boolean;
  draggedElement: BioElement | null;
  draggedTemplate: ElementTemplate | null;
  dragOverIndex: number | null;
  insertionPosition: "top" | "bottom" | null;
  temporaryElementOrder: string[] | null;
  isTemporaryReorganization: boolean;

  // Enhanced state management
  dragStartTime: number | null;
  dragOperationId: string | null;
  lastUpdateTime: number;
  stateVersion: DragStateVersion;

  // Performance monitoring
  performanceMetrics: DragPerformanceMetrics;

  // Cleanup tracking
  cleanupTimeout: NodeJS.Timeout | null;
  abandonedOperations: Set<string>;
}

interface BioBuilderState {
  // Current page being edited
  currentPage: BioPage | null;

  // Selected element for editing
  selectedElement: BioElement | null;

  // Canvas position and zoom
  canvasPosition: CanvasPosition;

  // Enhanced drag and drop state
  dragState: EnhancedDragState;

  // Canvas drag state
  isCanvasDragging: boolean;

  // Persistence state
  lastSaved: Date | null;
  autoSaveEnabled: boolean;

  // History state for undo/redo functionality
  history: {
    past: BioPage[];
    future: BioPage[];
    limit: number; // Maximum number of states to store in history
    lastActionType?: string; // Track the type of the last action
    lastActionTimestamp?: number; // Track when the last action occurred
    batchingDelay: number; // Time window for batching similar actions (in ms)
  };

  // History management functions
  addToHistory: (page: BioPage, actionType?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

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

  // Enhanced drag and drop management
  startDragOperation: (item: BioElement | ElementTemplate) => string;
  updateDragPosition: (
    index: number | null,
    position: "top" | "bottom" | null
  ) => void;
  endDragOperation: (operationId: string, success: boolean) => void;
  cancelDragOperation: (operationId?: string) => void;

  // Atomic state updates
  atomicDragUpdate: (
    updateFn: (state: EnhancedDragState) => Partial<EnhancedDragState>
  ) => void;

  // Enhanced temporary reorganization management
  applyTemporaryReorganization: (
    draggedId: string,
    targetIndex: number,
    operationId: string
  ) => void;
  revertTemporaryReorganization: (operationId?: string) => void;
  getCurrentElementOrder: () => BioElement[];

  // Performance monitoring
  recordDragCalculation: (calculationTime: number) => void;
  getDragPerformanceMetrics: () => DragPerformanceMetrics;
  resetPerformanceMetrics: () => void;

  // Cleanup management
  scheduleCleanup: (operationId: string, delay?: number) => void;
  cancelCleanup: (operationId: string) => void;
  performCleanup: (operationId?: string) => void;

  // Legacy compatibility methods (deprecated)
  setIsDragging: (isDragging: boolean) => void;
  setDraggedElement: (element: BioElement | null) => void;
  setDraggedTemplate: (template: ElementTemplate | null) => void;
  setDragOverIndex: (index: number | null) => void;
  setInsertionPosition: (position: "top" | "bottom" | null) => void;
  clearDragOverState: () => void;
  setTemporaryOrder: (order: string[]) => void;
  clearTemporaryState: () => void;

  // Page management
  updatePageTheme: (theme: Partial<BioPageTheme>) => void;

  // Background-specific update methods
  updateBackgroundType: (
    backgroundType: "solid" | "gradient" | "image"
  ) => void;
  updateBackgroundGradient: (gradient: BackgroundGradient) => void;
  updateBackgroundImage: (image: BackgroundImage) => void;

  // Persistence methods
  saveCurrentPage: () => Promise<void>;
  restoreFromStorage: () => void;
  migrateBackgroundConfig: (page: BioPage) => BioPage;
  setAutoSave: (enabled: boolean) => void;

  // Enhanced background persistence methods
  validateBackgroundConfig: () => boolean;
  getBackgroundConfigStatus: () => {
    isValid: boolean;
    type: string;
    hasGradient: boolean;
    hasImage: boolean;
  };
  forceBackgroundSave: () => Promise<void>;
  restoreBackgroundFromBackup: (pageId: string) => Promise<boolean>;
}

// Migration function for existing pages without background configuration
const migratePageBackgroundConfig = (page: BioPage): BioPage => {
  // If page is null or undefined, return a default page
  if (!page) {
    console.warn("Attempted to migrate null or undefined page");
    return {
      id: "default",
      title: "Default Page",
      slug: "default",
      elements: [],
      theme: {
        backgroundColor: "#ffffff",
        primaryColor: "#000000",
        secondaryColor: "#666666",
        fontFamily: "Inter",
        backgroundType: "solid",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // If theme is missing, create a default theme
  if (!page.theme) {
    console.warn("Page has no theme, creating default theme");
    return {
      ...page,
      theme: {
        backgroundColor: "#ffffff",
        primaryColor: "#000000",
        secondaryColor: "#666666",
        fontFamily: "Inter",
        backgroundType: "solid",
      },
      updatedAt: new Date(),
    };
  }

  // If page already has backgroundType, validate it
  if (page.theme.backgroundType) {
    // Check if the background type is valid
    if (!["solid", "gradient", "image"].includes(page.theme.backgroundType)) {
      console.warn(
        `Invalid backgroundType: ${page.theme.backgroundType}, fixing`
      );
      return {
        ...page,
        theme: {
          ...page.theme,
          backgroundType: "solid",
        },
        updatedAt: new Date(),
      };
    }

    // Check if gradient type has required properties
    if (
      page.theme.backgroundType === "gradient" &&
      (!page.theme.backgroundGradient || !page.theme.backgroundGradient.colors)
    ) {
      console.warn("Gradient background missing required properties, fixing");
      return {
        ...page,
        theme: {
          ...page.theme,
          backgroundType: "solid",
          // Keep existing backgroundColor as fallback
          backgroundColor: page.theme.backgroundColor || "#ffffff",
        },
        updatedAt: new Date(),
      };
    }

    // Check if image type has required properties
    if (
      page.theme.backgroundType === "image" &&
      (!page.theme.backgroundImage || !page.theme.backgroundImage.url)
    ) {
      console.warn("Image background missing required properties, fixing");
      return {
        ...page,
        theme: {
          ...page.theme,
          backgroundType: "solid",
          // Keep existing backgroundColor as fallback
          backgroundColor: page.theme.backgroundColor || "#ffffff",
        },
        updatedAt: new Date(),
      };
    }

    // If everything is valid, return the original page
    return page;
  }

  // Migrate existing backgroundColor to new background structure
  const migratedTheme: BioPageTheme = {
    ...page.theme,
    backgroundType: "solid",
    // Keep existing backgroundColor as the solid color
    backgroundColor: page.theme.backgroundColor || "#ffffff",
  };

  console.log("Migrated page background configuration", {
    before: { backgroundType: undefined },
    after: { backgroundType: migratedTheme.backgroundType },
  });

  return {
    ...page,
    theme: migratedTheme,
    updatedAt: new Date(),
  };
};

// Auto-save functionality
let autoSaveTimeout: NodeJS.Timeout | null = null;

const triggerAutoSave = (get: () => BioBuilderState) => {
  const state = get();
  if (!state.autoSaveEnabled || !state.currentPage) return;

  // Clear existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  // Set new timeout for auto-save (debounced by 1 second)
  autoSaveTimeout = setTimeout(async () => {
    try {
      await state.saveCurrentPage();
    } catch (error) {
      console.error("Auto-save failed:", error);
      // Optionally notify user about auto-save failure
    }
  }, 1000);
};

export const useBioBuilderStore = create<BioBuilderState>()(
  persist(
    (set, get) => ({
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
          backgroundType: "solid",
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
      dragState: {
        isDragging: false,
        draggedElement: null,
        draggedTemplate: null,
        dragOverIndex: null,
        insertionPosition: null,
        temporaryElementOrder: null,
        isTemporaryReorganization: false,
        dragStartTime: null,
        dragOperationId: null,
        lastUpdateTime: Date.now(),
        stateVersion: {
          version: 0,
          timestamp: Date.now(),
          operationId: "",
        },
        performanceMetrics: {
          calculationsPerSecond: 0,
          lastCalculationTime: 0,
          totalCalculations: 0,
          averageCalculationTime: 0,
          memoryUsage: 0,
          activeAnimations: 0,
        },
        cleanupTimeout: null,
        abandonedOperations: new Set(),
      },
      isCanvasDragging: false,
      lastSaved: null,
      autoSaveEnabled: true,
      // Initialize history with empty arrays and a limit of 50 states
      history: {
        past: [],
        future: [],
        limit: 50, // Maximum number of states to store in history
        batchingDelay: 500, // Group changes that occur within 500ms
      },

      // History management functions
      addToHistory: (page, actionType) => {
        const state = get();
        const now = Date.now();

        // Validate input page before processing
        if (!page || typeof page !== "object") {
          console.error("Invalid page object provided to addToHistory:", page);
          return; // Don't proceed with invalid data
        }

        // Define a fallback function for history processing
        const fallbackHistoryProcessing = () => {
          try {
            // Create a deep copy of the page to avoid reference issues
            const pageCopy = JSON.parse(
              JSON.stringify(page, (key, value) => {
                if (value instanceof Date) {
                  return { __type: "Date", value: value.toISOString() };
                }
                return value;
              })
            );

            // Parse dates back to Date objects
            const pageWithDates = JSON.parse(
              JSON.stringify(pageCopy),
              (key, value) => {
                if (
                  value &&
                  typeof value === "object" &&
                  value.__type === "Date"
                ) {
                  return new Date(value.value);
                }
                return value;
              }
            );

            // Implement intelligent grouping of changes
            const shouldGroup =
              actionType &&
              state.history.lastActionType === actionType &&
              state.history.lastActionTimestamp &&
              now - state.history.lastActionTimestamp <
                state.history.batchingDelay;

            let updatedPast;

            if (shouldGroup && state.history.past.length > 0) {
              updatedPast = [...state.history.past.slice(0, -1), pageWithDates];
            } else {
              updatedPast = [...state.history.past, pageWithDates];
            }

            const limitedPast =
              updatedPast.length > state.history.limit
                ? updatedPast.slice(updatedPast.length - state.history.limit)
                : updatedPast;

            set({
              history: {
                ...state.history,
                past: limitedPast,
                future: [],
                lastActionType: actionType,
                lastActionTimestamp: now,
              },
            });
          } catch (error) {
            console.error("Error in fallback history processing:", error);
            // Last resort recovery: just add the page as-is without processing
            try {
              const safeHistory = [...state.history.past];
              if (safeHistory.length >= state.history.limit) {
                safeHistory.shift(); // Remove oldest entry if at limit
              }
              safeHistory.push(page);

              set({
                history: {
                  ...state.history,
                  past: safeHistory,
                  future: [],
                  lastActionType: actionType,
                  lastActionTimestamp: now,
                },
              });
            } catch (criticalError) {
              console.error(
                "Critical error in history management:",
                criticalError
              );
              // At this point, we can't safely update the history
              // Just log the error and continue without updating history
            }
          }
        };

        // Import optimized history functions
        import("./optimized-history")
          .then(
            ({
              createOptimizedHistoryEntry,
              serializeHistoryEntry,
              deserializeHistoryEntry,
            }) => {
              try {
                // Create an optimized version of the page for storage
                const optimizedPage = createOptimizedHistoryEntry(page);

                // Serialize the optimized page for storage
                const serializedPage = serializeHistoryEntry(optimizedPage);

                // Deserialize the page to ensure proper handling of Date objects
                const processedPage = deserializeHistoryEntry(serializedPage);

                // Validate the processed page
                if (!processedPage || typeof processedPage !== "object") {
                  throw new Error("Invalid processed page");
                }

                // Implement intelligent grouping of changes
                const shouldGroup =
                  // Check if we have a previous action of the same type
                  actionType &&
                  state.history.lastActionType === actionType &&
                  state.history.lastActionTimestamp &&
                  // Check if the previous action was recent enough to group
                  now - state.history.lastActionTimestamp <
                    state.history.batchingDelay;

                let updatedPast;

                if (shouldGroup && state.history.past.length > 0) {
                  // Replace the last history entry instead of adding a new one
                  updatedPast = [
                    ...state.history.past.slice(0, -1),
                    processedPage,
                  ];
                } else {
                  // Add as a new history entry
                  updatedPast = [...state.history.past, processedPage];
                }

                // Limit the size of the history to avoid memory issues
                const limitedPast =
                  updatedPast.length > state.history.limit
                    ? updatedPast.slice(
                        updatedPast.length - state.history.limit
                      )
                    : updatedPast;

                set({
                  history: {
                    ...state.history,
                    past: limitedPast,
                    future: [], // Clear future history when a new action is performed
                    lastActionType: actionType,
                    lastActionTimestamp: now,
                  },
                });
              } catch (error) {
                console.error("Error in optimized history processing:", error);
                fallbackHistoryProcessing();
              }
            }
          )
          .catch((error) => {
            console.error(
              "Failed to import optimized history functions:",
              error
            );
            fallbackHistoryProcessing();
          });
      },

      undo: () => {
        const state = get();

        // Check if there are states to undo
        if (state.history.past.length === 0 || !state.currentPage) {
          return; // Nothing to undo
        }

        try {
          // Get the last state from the past
          const newPast = [...state.history.past];
          const previousState = newPast.pop();

          // Validate the previous state before applying it
          if (!previousState || typeof previousState !== "object") {
            console.error(
              "Error in undo: Invalid previous state",
              previousState
            );
            throw new Error("Invalid previous state");
          }

          // Add current state to future history
          const newFuture = [state.currentPage, ...state.history.future];

          // Update the store
          set({
            currentPage: previousState,
            history: {
              ...state.history,
              past: newPast,
              future: newFuture,
            },
          });
        } catch (error) {
          console.error("Error during undo operation:", error);

          // Recovery strategy: Remove the problematic state from history
          if (state.history.past.length > 0) {
            const newPast = [...state.history.past];
            newPast.pop(); // Remove the problematic state

            set({
              history: {
                ...state.history,
                past: newPast,
              },
            });

            // If there are more states in history, try to undo again with the next state
            if (newPast.length > 0) {
              console.log(
                "Attempting recovery by trying the next state in history"
              );
              setTimeout(() => state.undo(), 0);
            }
          }
        }
      },

      redo: () => {
        const state = get();

        // Check if there are states to redo
        if (state.history.future.length === 0 || !state.currentPage) {
          return; // Nothing to redo
        }

        try {
          // Get the next state from the future
          const [nextState, ...newFuture] = state.history.future;

          // Validate the next state before applying it
          if (!nextState || typeof nextState !== "object") {
            console.error("Error in redo: Invalid next state", nextState);
            throw new Error("Invalid next state");
          }

          // Add current state to past history
          const newPast = [...state.history.past, state.currentPage];

          // Update the store
          set({
            currentPage: nextState,
            history: {
              ...state.history,
              past: newPast,
              future: newFuture,
            },
          });
        } catch (error) {
          console.error("Error during redo operation:", error);

          // Recovery strategy: Remove the problematic state from future history
          if (state.history.future.length > 0) {
            const [_, ...newFuture] = state.history.future;

            set({
              history: {
                ...state.history,
                future: newFuture,
              },
            });

            // If there are more states in future history, try to redo again with the next state
            if (newFuture.length > 0) {
              console.log(
                "Attempting recovery by trying the next state in future history"
              );
              setTimeout(() => state.redo(), 0);
            }
          }
        }
      },

      canUndo: () => {
        const state = get();
        // We can undo if there are states in the past history
        return state.history.past.length > 0;
      },

      canRedo: () => {
        const state = get();
        // We can redo if there are states in the future history
        return state.history.future.length > 0;
      },

      setCurrentPage: (page) => {
        const state = get();
        // Only add to history if there's a current page to save
        if (state.currentPage) {
          state.addToHistory(state.currentPage);
        }

        const migratedPage = migratePageBackgroundConfig(page);
        set({
          currentPage: migratedPage,
          // Reset canvas position to center when loading a new page
          canvasPosition: {
            x: 0,
            y: 0,
            scale: 1,
          },
        });
        triggerAutoSave(get);
      },
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

      setIsCanvasDragging: (isDragging) =>
        set({ isCanvasDragging: isDragging }),

      addElement: (elementData) => {
        const state = get();
        if (!state.currentPage) return;

        // Add current state to history before adding a new element
        state.addToHistory(state.currentPage, `addElement:${elementData.type}`);

        const newElement: BioElement = {
          ...elementData,
          id: `element-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 11)}`,
          position: state.currentPage.elements.length,
        };

        const updatedPage = {
          ...state.currentPage,
          elements: [...state.currentPage.elements, newElement],
          updatedAt: new Date(),
        };

        set({ currentPage: updatedPage });
        triggerAutoSave(get);
      },

      addElementFromTemplate: (template, position) => {
        const state = get();
        if (!state.currentPage) return;

        // Add current state to history before adding an element from template
        state.addToHistory(
          state.currentPage,
          `addElementFromTemplate:${template.id}`
        );

        const newElement: BioElement = {
          id: `element-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 11)}`,
          type: template.type,
          position:
            position !== undefined
              ? position
              : state.currentPage.elements.length,
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
        triggerAutoSave(get);
      },

      updateElement: (id, data) => {
        const state = get();
        if (!state.currentPage) return;

        // Add current state to history before updating, with action type
        state.addToHistory(state.currentPage, `updateElement:${id}`);

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
        triggerAutoSave(get);
      },

      deleteElement: (id) => {
        const state = get();
        if (!state.currentPage) return;

        // Add current state to history before deleting an element
        state.addToHistory(state.currentPage, `deleteElement:${id}`);

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
        triggerAutoSave(get);
      },

      reorderElements: (fromIndex, toIndex) => {
        const state = get();
        if (!state.currentPage) return;

        // Add current state to history before reordering elements
        state.addToHistory(
          state.currentPage,
          `reorderElements:${fromIndex}:${toIndex}`
        );

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
        triggerAutoSave(get);
      },

      moveElement: (elementId, newPosition) => {
        const state = get();
        if (!state.currentPage) return;

        // Add current state to history before moving an element
        state.addToHistory(
          state.currentPage,
          `moveElement:${elementId}:${newPosition}`
        );

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
        triggerAutoSave(get);
      },

      // Enhanced drag operation management
      startDragOperation: (item) => {
        const operationId = `drag-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 11)}`;
        const now = Date.now();

        // Check if item has 'position' property to distinguish between BioElement and ElementTemplate
        const isElement =
          item && typeof item === "object" && "position" in item;

        get().atomicDragUpdate((dragState) => ({
          isDragging: true,
          draggedElement: isElement ? (item as BioElement) : null,
          draggedTemplate: !isElement ? (item as ElementTemplate) : null,
          dragStartTime: now,
          dragOperationId: operationId,
          lastUpdateTime: now,
          stateVersion: {
            version: dragState.stateVersion.version + 1,
            timestamp: now,
            operationId,
          },
        }));

        // Schedule automatic cleanup for abandoned operations
        get().scheduleCleanup(operationId, 30000); // 30 second timeout

        return operationId;
      },

      updateDragPosition: (index, position) => {
        const state = get();
        if (!state.dragState.isDragging || !state.dragState.dragOperationId)
          return;

        const calculationStart = performance.now();

        get().atomicDragUpdate((dragState) => ({
          dragOverIndex: index,
          insertionPosition: position,
          lastUpdateTime: Date.now(),
        }));

        const calculationTime = performance.now() - calculationStart;
        get().recordDragCalculation(calculationTime);
      },

      endDragOperation: (operationId, success) => {
        const state = get();
        if (state.dragState.dragOperationId !== operationId) {
          console.warn(
            `Attempted to end drag operation ${operationId} but current operation is ${state.dragState.dragOperationId}`
          );
          return;
        }

        get().cancelCleanup(operationId);

        if (!success) {
          get().revertTemporaryReorganization(operationId);
        }

        get().atomicDragUpdate(() => ({
          isDragging: false,
          draggedElement: null,
          draggedTemplate: null,
          dragOverIndex: null,
          insertionPosition: null,
          temporaryElementOrder: null,
          isTemporaryReorganization: false,
          dragStartTime: null,
          dragOperationId: null,
          lastUpdateTime: Date.now(),
        }));
      },

      cancelDragOperation: (operationId) => {
        const state = get();
        const currentOperationId =
          operationId || state.dragState.dragOperationId;

        if (currentOperationId) {
          get().cancelCleanup(currentOperationId);
          get().revertTemporaryReorganization(currentOperationId);
        }

        get().atomicDragUpdate(() => ({
          isDragging: false,
          draggedElement: null,
          draggedTemplate: null,
          dragOverIndex: null,
          insertionPosition: null,
          temporaryElementOrder: null,
          isTemporaryReorganization: false,
          dragStartTime: null,
          dragOperationId: null,
          lastUpdateTime: Date.now(),
        }));
      },

      // Atomic state updates to prevent race conditions
      atomicDragUpdate: (updateFn) => {
        const state = get();
        const currentDragState = state.dragState;
        const updates = updateFn(currentDragState);

        // Create new state version
        const newVersion = {
          version: currentDragState.stateVersion.version + 1,
          timestamp: Date.now(),
          operationId:
            updates.dragOperationId || currentDragState.dragOperationId || "",
        };

        set({
          dragState: {
            ...currentDragState,
            ...updates,
            stateVersion: newVersion,
          },
        });
      },

      // Enhanced temporary reorganization management
      applyTemporaryReorganization: (draggedId, targetIndex, operationId) => {
        const state = get();
        if (
          !state.currentPage ||
          state.dragState.dragOperationId !== operationId
        )
          return;

        const calculationStart = performance.now();

        const elements = [...state.currentPage.elements];
        const draggedIndex = elements.findIndex((el) => el.id === draggedId);

        if (draggedIndex === -1) return;

        // Create temporary order for visual feedback
        const [draggedElement] = elements.splice(draggedIndex, 1);
        elements.splice(targetIndex, 0, draggedElement);

        const temporaryOrder = elements.map((el) => el.id);

        get().atomicDragUpdate(() => ({
          temporaryElementOrder: temporaryOrder,
          isTemporaryReorganization: true,
          lastUpdateTime: Date.now(),
        }));

        const calculationTime = performance.now() - calculationStart;
        get().recordDragCalculation(calculationTime);
      },

      revertTemporaryReorganization: (operationId) => {
        const state = get();
        if (!state.dragState.isTemporaryReorganization) return;

        // Only revert if the operation ID matches or no operation ID is provided
        if (operationId && state.dragState.dragOperationId !== operationId)
          return;

        get().atomicDragUpdate(() => ({
          temporaryElementOrder: null,
          isTemporaryReorganization: false,
          lastUpdateTime: Date.now(),
        }));
      },

      getCurrentElementOrder: () => {
        const state = get();
        if (!state.currentPage) return [];

        // If we have a temporary order during drag, use that for visual display
        if (
          state.dragState.isTemporaryReorganization &&
          state.dragState.temporaryElementOrder
        ) {
          const elementMap = new Map(
            state.currentPage.elements.map((el) => [el.id, el])
          );

          return state.dragState.temporaryElementOrder
            .map((id) => elementMap.get(id))
            .filter((el): el is BioElement => el !== undefined);
        }

        // Otherwise, return elements in their normal order
        return [...state.currentPage.elements].sort(
          (a, b) => a.position - b.position
        );
      },

      // Performance monitoring
      recordDragCalculation: (calculationTime) => {
        const state = get();
        const metrics = state.dragState.performanceMetrics;
        const now = Date.now();

        const newTotalCalculations = metrics.totalCalculations + 1;
        const newAverageTime =
          (metrics.averageCalculationTime * metrics.totalCalculations +
            calculationTime) /
          newTotalCalculations;

        // Calculate calculations per second (over last 1000ms)
        const timeSinceLastCalculation = now - metrics.lastCalculationTime;
        const calculationsPerSecond =
          timeSinceLastCalculation > 0 ? 1000 / timeSinceLastCalculation : 0;

        get().atomicDragUpdate((dragState) => ({
          performanceMetrics: {
            ...metrics,
            calculationsPerSecond: Math.min(calculationsPerSecond, 60), // Cap at 60fps
            lastCalculationTime: now,
            totalCalculations: newTotalCalculations,
            averageCalculationTime: newAverageTime,
            memoryUsage:
              (typeof performance !== "undefined" &&
                (performance as any).memory?.usedJSHeapSize) ||
              0,
          },
        }));
      },

      getDragPerformanceMetrics: () => {
        return get().dragState.performanceMetrics;
      },

      resetPerformanceMetrics: () => {
        get().atomicDragUpdate(() => ({
          performanceMetrics: {
            calculationsPerSecond: 0,
            lastCalculationTime: 0,
            totalCalculations: 0,
            averageCalculationTime: 0,
            memoryUsage: 0,
            activeAnimations: 0,
          },
        }));
      },

      // Cleanup management
      scheduleCleanup: (operationId, delay = 5000) => {
        const state = get();

        // Cancel existing cleanup for this operation
        get().cancelCleanup(operationId);

        const cleanupTimeout = setTimeout(() => {
          const currentState = get();
          if (currentState.dragState.dragOperationId === operationId) {
            console.warn(
              `Cleaning up abandoned drag operation: ${operationId}`
            );
            get().cancelDragOperation(operationId);

            // Track abandoned operation
            get().atomicDragUpdate((dragState) => ({
              abandonedOperations: new Set([
                ...dragState.abandonedOperations,
                operationId,
              ]),
            }));
          }
        }, delay);

        get().atomicDragUpdate(() => ({
          cleanupTimeout,
        }));
      },

      cancelCleanup: (operationId) => {
        const state = get();
        if (state.dragState.cleanupTimeout) {
          clearTimeout(state.dragState.cleanupTimeout);
          get().atomicDragUpdate(() => ({
            cleanupTimeout: null,
          }));
        }
      },

      performCleanup: (operationId) => {
        const state = get();
        const targetOperationId =
          operationId || state.dragState.dragOperationId;

        if (targetOperationId) {
          get().cancelCleanup(targetOperationId);
          get().cancelDragOperation(targetOperationId);
        }

        // Clean up abandoned operations set if it gets too large
        get().atomicDragUpdate((dragState) => {
          const abandonedOps = dragState.abandonedOperations;
          if (abandonedOps.size > 10) {
            // Keep only the 5 most recent abandoned operations
            const recentOps = Array.from(abandonedOps).slice(-5);
            return {
              abandonedOperations: new Set(recentOps),
            };
          }
          return {};
        });
      },

      // Legacy compatibility methods (deprecated but maintained for backward compatibility)
      setIsDragging: (isDragging) => {
        console.warn(
          "setIsDragging is deprecated. Use startDragOperation/endDragOperation instead."
        );
        get().atomicDragUpdate(() => ({ isDragging }));
      },

      setDraggedElement: (element) => {
        console.warn(
          "setDraggedElement is deprecated. Use startDragOperation instead."
        );
        get().atomicDragUpdate(() => ({ draggedElement: element }));
      },

      setDraggedTemplate: (template) => {
        console.warn(
          "setDraggedTemplate is deprecated. Use startDragOperation instead."
        );
        get().atomicDragUpdate(() => ({ draggedTemplate: template }));
      },

      setDragOverIndex: (index) => {
        console.warn(
          "setDragOverIndex is deprecated. Use updateDragPosition instead."
        );
        get().atomicDragUpdate(() => ({ dragOverIndex: index }));
      },

      setInsertionPosition: (position) => {
        console.warn(
          "setInsertionPosition is deprecated. Use updateDragPosition instead."
        );
        get().atomicDragUpdate(() => ({ insertionPosition: position }));
      },

      clearDragOverState: () => {
        console.warn(
          "clearDragOverState is deprecated. Use endDragOperation instead."
        );
        get().atomicDragUpdate(() => ({
          dragOverIndex: null,
          insertionPosition: null,
        }));
      },

      setTemporaryOrder: (order) => {
        console.warn(
          "setTemporaryOrder is deprecated. Use applyTemporaryReorganization instead."
        );
        get().atomicDragUpdate(() => ({
          temporaryElementOrder: order,
          isTemporaryReorganization: true,
        }));
      },

      clearTemporaryState: () => {
        console.warn(
          "clearTemporaryState is deprecated. Use revertTemporaryReorganization instead."
        );
        get().atomicDragUpdate(() => ({
          temporaryElementOrder: null,
          isTemporaryReorganization: false,
          dragOverIndex: null,
          insertionPosition: null,
        }));
      },

      updatePageTheme: (theme) => {
        const state = get();
        if (!state.currentPage) return;

        // Add current state to history before updating the theme
        state.addToHistory(state.currentPage, `updatePageTheme`);

        const updatedPage = {
          ...state.currentPage,
          theme: { ...state.currentPage.theme, ...theme },
          updatedAt: new Date(),
        };

        set({ currentPage: updatedPage });
        triggerAutoSave(get);
      },

      updateBackgroundType: (backgroundType) => {
        const state = get();
        if (!state.currentPage) return;

        // Add current state to history before updating the background type
        state.addToHistory(
          state.currentPage,
          `updateBackgroundType:${backgroundType}`
        );

        // Log the background type change for debugging
        console.log(
          `Store: Changing background type from ${state.currentPage.theme.backgroundType} to ${backgroundType}`
        );

        // Special handling for image type to prevent unwanted reversions
        if (backgroundType === "image") {
          // If switching to image type, we want to preserve this choice
          // even if there's no image URL yet (user will upload one)
          console.log(
            "Store: Setting background type to image, preserving this choice for upload"
          );
        } else if (
          state.currentPage.theme.backgroundType === "image" &&
          state.currentPage.theme.backgroundImage?.url
        ) {
          // If switching away from image type when we have an image URL,
          // log this intentional change for debugging
          console.log(
            "Store: Intentionally changing away from image background with configured image"
          );
        }

        // Monitor background changes for persistence events
        import("@/lib/background-persistence")
          .then(({ monitorBackgroundChanges }) => {
            monitorBackgroundChanges(state.currentPage!.theme, {
              ...state.currentPage!.theme,
              backgroundType,
            });
          })
          .catch((error) => {
            console.warn("Failed to monitor background changes:", error);
          });

        const updatedPage = {
          ...state.currentPage,
          theme: { ...state.currentPage.theme, backgroundType },
          updatedAt: new Date(),
        };

        set({ currentPage: updatedPage });
        triggerAutoSave(get);
      },

      updateBackgroundGradient: (gradient) => {
        const state = get();
        if (!state.currentPage) return;

        // Add current state to history before updating the background gradient
        state.addToHistory(state.currentPage, `updateBackgroundGradient`);

        // Monitor background changes for persistence events
        import("@/lib/background-persistence")
          .then(({ monitorBackgroundChanges }) => {
            monitorBackgroundChanges(state.currentPage!.theme, {
              ...state.currentPage!.theme,
              backgroundType: "gradient" as const,
              backgroundGradient: gradient,
            });
          })
          .catch((error) => {
            console.warn("Failed to monitor background changes:", error);
          });

        const updatedPage = {
          ...state.currentPage,
          theme: {
            ...state.currentPage.theme,
            backgroundType: "gradient" as const,
            backgroundGradient: gradient,
          },
          updatedAt: new Date(),
        };

        set({ currentPage: updatedPage });
        triggerAutoSave(get);
      },

      updateBackgroundImage: (image) => {
        const state = get();
        if (!state.currentPage) return;

        // Add current state to history before updating the background image
        state.addToHistory(state.currentPage, `updateBackgroundImage`);

        // Log the image update for debugging
        console.log(
          `Store: Updating background image with URL: ${image.url.substring(
            0,
            30
          )}...`
        );
        console.log(
          `Store: Current background type: ${state.currentPage.theme.backgroundType}`
        );

        // Always ensure the background type is set to "image" when updating an image
        // This is crucial to prevent any race conditions or inconsistent state
        const backgroundType = "image" as const;

        // If the current type is not "image", log this correction
        if (state.currentPage.theme.backgroundType !== backgroundType) {
          console.log(
            `Store: Correcting background type from ${state.currentPage.theme.backgroundType} to ${backgroundType}`
          );
        }

        // Monitor background changes for persistence events
        import("@/lib/background-persistence")
          .then(({ monitorBackgroundChanges }) => {
            monitorBackgroundChanges(state.currentPage!.theme, {
              ...state.currentPage!.theme,
              backgroundType,
              backgroundImage: image,
            });
          })
          .catch((error) => {
            console.warn("Failed to monitor background changes:", error);
          });

        // Create updated page with consistent image background configuration
        const updatedPage = {
          ...state.currentPage,
          theme: {
            ...state.currentPage.theme,
            backgroundType, // Always set to "image"
            backgroundImage: image,
          },
          updatedAt: new Date(),
        };

        // Update the store and trigger auto-save
        set({ currentPage: updatedPage });
        triggerAutoSave(get);

        // Log success for debugging
        console.log("Store: Background image updated successfully");
      },

      // Persistence methods
      saveCurrentPage: async () => {
        const state = get();
        if (!state.currentPage) return;

        try {
          // Import validation function from background-persistence
          const {
            validateBackgroundConfig,
            savePageWithBackgroundValidation,
            createBackgroundBackup,
            createSessionBackup,
          } = await import("@/lib/background-persistence");

          // Validate background configuration before saving
          const isValidConfig = validateBackgroundConfig(state.currentPage);

          if (!isValidConfig) {
            console.warn(
              "Invalid background configuration detected, applying migration"
            );
            const migratedPage = migratePageBackgroundConfig(state.currentPage);
            set({ currentPage: migratedPage });
          }

          const pageToSave = state.currentPage;
          const saveTimestamp = new Date();

          // Create a session backup for quick recovery
          createSessionBackup(pageToSave.id, pageToSave.theme);

          // In a real app, this would save to a backend API
          // For now, we'll save to localStorage as a backup
          if (typeof window !== "undefined" && window.localStorage) {
            const pageKey = `bio-page-${pageToSave.id}`;
            const timestampKey = `${pageKey}-timestamp`;
            const backupKey = `${pageKey}-backup`;

            // Create backup of previous version before saving
            const existingPage = localStorage.getItem(pageKey);
            if (existingPage) {
              localStorage.setItem(backupKey, existingPage);

              // Also create a structured backup of just the background configuration
              const backgroundBackup = createBackgroundBackup(pageToSave);
              localStorage.setItem(
                `${pageKey}-background-backup`,
                backgroundBackup
              );
            }

            // Save current page with enhanced serialization
            const serializedPage = JSON.stringify(pageToSave, (key, value) => {
              if (value instanceof Date) {
                return { __type: "Date", value: value.toISOString() };
              }
              return value;
            });

            localStorage.setItem(pageKey, serializedPage);
            localStorage.setItem(timestampKey, saveTimestamp.toISOString());
          }

          // Update the lastSaved timestamp after successful save
          set({ lastSaved: saveTimestamp });

          // Here you would typically make an API call:
          // await api.savePage(pageToSave);

          console.log("Page saved successfully", pageToSave.id, {
            backgroundType: pageToSave.theme.backgroundType,
            hasGradient: !!pageToSave.theme.backgroundGradient,
            hasImage: !!pageToSave.theme.backgroundImage,
            timestamp: saveTimestamp.toISOString(),
          });
        } catch (error) {
          console.error("Failed to save page:", error);
          // Reset lastSaved on error
          set({ lastSaved: null });
          throw error; // Re-throw for error handling in components
        }
      },

      restoreFromStorage: () => {
        // This method is called automatically by zustand persist middleware
        // Additional restoration logic can be added here if needed
        const state = get();

        if (state.currentPage) {
          // Ensure the restored page has proper background configuration
          const migratedPage = migratePageBackgroundConfig(state.currentPage);
          if (migratedPage !== state.currentPage) {
            console.log("Migrating background configuration for restored page");
            set({ currentPage: migratedPage });

            // Auto-save the migrated configuration
            setTimeout(() => {
              triggerAutoSave(get);
            }, 100);
          }

          // Validate restored background configuration
          const theme = state.currentPage.theme;
          if (theme.backgroundType) {
            console.log("Restored page with background configuration:", {
              type: theme.backgroundType,
              hasGradient: !!theme.backgroundGradient,
              hasImage: !!theme.backgroundImage,
            });
          }
        }

        // Restore from localStorage backup if available
        if (
          typeof window !== "undefined" &&
          window.localStorage &&
          state.currentPage
        ) {
          try {
            // Import the necessary functions
            import("@/lib/background-persistence")
              .then(
                ({ restoreFromSessionBackup, validateBackgroundConfig }) => {
                  const pageId = state.currentPage?.id;
                  if (!pageId) return;

                  // First try to restore from session backup (for navigation within the app)
                  const sessionBackup = restoreFromSessionBackup(pageId);
                  if (sessionBackup) {
                    console.log("Restoring background from session backup");
                    set({
                      currentPage: {
                        ...state.currentPage!,
                        theme: {
                          ...state.currentPage!.theme,
                          ...sessionBackup,
                        },
                      },
                    });
                    return;
                  }

                  // If no session backup, try localStorage
                  const pageKey = `bio-page-${pageId}`;
                  const storedPage = localStorage.getItem(pageKey);
                  const storedTimestamp = localStorage.getItem(
                    `${pageKey}-timestamp`
                  );

                  if (storedPage && storedTimestamp) {
                    const parsedPage = JSON.parse(storedPage, (key, value) => {
                      if (
                        value &&
                        typeof value === "object" &&
                        value.__type === "Date"
                      ) {
                        return new Date(value.value);
                      }
                      return value;
                    });

                    const storedTime = new Date(storedTimestamp);
                    const currentTime = state.currentPage!.updatedAt;

                    // Use stored version if it's newer
                    if (storedTime > currentTime) {
                      console.log("Restoring newer version from localStorage");
                      const migratedStoredPage =
                        migratePageBackgroundConfig(parsedPage);

                      // Validate the background configuration before restoring
                      if (validateBackgroundConfig(migratedStoredPage)) {
                        set({
                          currentPage: migratedStoredPage,
                          lastSaved: storedTime,
                        });
                        console.log(
                          "Background configuration restored and validated"
                        );
                      } else {
                        console.warn(
                          "Invalid background configuration in stored page, applying migration"
                        );
                        const remigratedPage =
                          migratePageBackgroundConfig(migratedStoredPage);
                        set({
                          currentPage: remigratedPage,
                          lastSaved: storedTime,
                        });
                      }
                    }
                  }
                }
              )
              .catch((error) => {
                console.error(
                  "Failed to import background-persistence utilities:",
                  error
                );
              });
          } catch (error) {
            console.warn("Failed to restore from localStorage:", error);
          }
        }
      },

      migrateBackgroundConfig: (page) => {
        return migratePageBackgroundConfig(page);
      },

      setAutoSave: (enabled) => {
        set({ autoSaveEnabled: enabled });
        if (!enabled && autoSaveTimeout) {
          clearTimeout(autoSaveTimeout);
          autoSaveTimeout = null;
        }
      },

      // Enhanced background persistence methods
      validateBackgroundConfig: () => {
        const state = get();
        if (!state.currentPage) return false;

        const theme = state.currentPage.theme;
        if (!theme.backgroundType) return false;

        switch (theme.backgroundType) {
          case "solid":
            return !!theme.backgroundColor;
          case "gradient":
            return !!(
              theme.backgroundGradient &&
              theme.backgroundGradient.colors &&
              theme.backgroundGradient.colors.length === 2 &&
              typeof theme.backgroundGradient.direction === "number"
            );
          case "image":
            return !!(
              theme.backgroundImage &&
              theme.backgroundImage.url &&
              typeof theme.backgroundImage.blur === "number"
            );
          default:
            return false;
        }
      },

      getBackgroundConfigStatus: () => {
        const state = get();
        if (!state.currentPage) {
          return {
            isValid: false,
            type: "none",
            hasGradient: false,
            hasImage: false,
          };
        }

        const theme = state.currentPage.theme;
        return {
          isValid: get().validateBackgroundConfig(),
          type: theme.backgroundType || "none",
          hasGradient: !!theme.backgroundGradient,
          hasImage: !!theme.backgroundImage,
        };
      },

      forceBackgroundSave: async () => {
        const state = get();
        if (!state.currentPage) return;

        // Clear any pending auto-save
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout);
          autoSaveTimeout = null;
        }

        // Force immediate save
        await state.saveCurrentPage();
      },

      restoreBackgroundFromBackup: async (pageId: string) => {
        if (typeof window === "undefined" || !window.localStorage) {
          return false;
        }

        try {
          // First try to restore from the specialized background backup
          const backgroundBackupKey = `bio-page-${pageId}-background-backup`;
          const backgroundBackupData =
            localStorage.getItem(backgroundBackupKey);

          if (backgroundBackupData) {
            // Import the necessary function
            const { restoreBackgroundFromBackup } = await import(
              "@/lib/background-persistence"
            );

            const state = get();
            if (!state.currentPage) return false;

            // Use the specialized background restore function
            const restoredPage = restoreBackgroundFromBackup(
              backgroundBackupData,
              state.currentPage
            );

            if (restoredPage) {
              set({
                currentPage: restoredPage,
                lastSaved: null, // Clear last saved since we're restoring
              });

              console.log(
                "Restored background configuration from specialized backup"
              );
              return true;
            }
          }

          // Fall back to full page backup if specialized backup fails
          const backupKey = `bio-page-${pageId}-backup`;
          const backupData = localStorage.getItem(backupKey);

          if (!backupData) {
            console.warn("No backup found for page:", pageId);
            return false;
          }

          const parsedBackup = JSON.parse(backupData, (key, value) => {
            if (value && typeof value === "object" && value.__type === "Date") {
              return new Date(value.value);
            }
            return value;
          });

          // Migrate the backup if needed
          const migratedBackup = migratePageBackgroundConfig(parsedBackup);

          // Validate the background configuration
          const { validateBackgroundConfig } = await import(
            "@/lib/background-persistence"
          );
          const isValid = validateBackgroundConfig(migratedBackup);

          if (!isValid) {
            console.warn(
              "Backup has invalid background configuration, applying migration"
            );
            // Apply additional migration if needed
          }

          // Restore the backup
          set({
            currentPage: migratedBackup,
            lastSaved: null, // Clear last saved since we're restoring
          });

          console.log(
            "Restored background configuration from full page backup"
          );

          // Trigger auto-save to ensure the restored configuration is saved
          setTimeout(() => {
            triggerAutoSave(get);
          }, 500);

          return true;
        } catch (error) {
          console.error("Failed to restore from backup:", error);
          return false;
        }
      },
    }),
    {
      name: "bio-builder-storage",
      // Only persist essential data, not transient UI state
      partialize: (state) => ({
        currentPage: state.currentPage,
        lastSaved: state.lastSaved,
        autoSaveEnabled: state.autoSaveEnabled,
        // Don't persist drag state as it's transient
      }),
      // Custom storage with Date handling
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str, (key, value) => {
            if (value && typeof value === "object" && value.__type === "Date") {
              return new Date(value.value);
            }
            return value;
          });
        },
        setItem: (name, value) => {
          const str = JSON.stringify(value, (key, val) => {
            if (val instanceof Date) {
              return { __type: "Date", value: val.toISOString() };
            }
            return val;
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      // Migration function for handling schema changes
      migrate: (persistedState: any, version: number) => {
        // Handle migration from older versions
        if (persistedState.currentPage) {
          persistedState.currentPage = migratePageBackgroundConfig(
            persistedState.currentPage
          );
        }
        return persistedState;
      },
      version: 1,
      // Restore callback to run additional logic after hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.restoreFromStorage();

          // Clean up any leftover drag state on hydration
          if (state.dragState.isDragging || state.dragState.cleanupTimeout) {
            console.log("Cleaning up drag state on hydration");
            state.performCleanup();
          }

          // Reset performance metrics on hydration
          state.resetPerformanceMetrics();
        }
      },
    }
  )
);
