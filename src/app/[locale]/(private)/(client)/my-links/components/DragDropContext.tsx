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
import { useEffect, useCallback, useRef, useMemo } from "react";
import {
  PositionCalculator,
  createThrottledCalculator,
} from "@/lib/position-calculator";
import { animationController } from "@/lib/animation-controller";

interface DragDropContextProps {
  children: React.ReactNode;
}

interface DragValidationState {
  operationId: string | null;
  startTime: number | null;
  lastValidPosition: { x: number; y: number } | null;
  consecutiveInvalidPositions: number;
  isValidating: boolean;
}

export function DragDropContext({ children }: DragDropContextProps) {
  const {
    currentPage,
    dragState,
    startDragOperation,
    endDragOperation,
    updateDragPosition,
    applyTemporaryReorganization,
    revertTemporaryReorganization,
    performCleanup,
    reorderElements,
    addElementFromTemplate,
  } = useBioBuilderStore();

  const { draggedElement, draggedTemplate } = dragState;

  // Enhanced position calculator with throttling
  const positionCalculator = useRef(new PositionCalculator());
  const throttledCalculator = useMemo(
    () => createThrottledCalculator(positionCalculator.current, 16), // 60fps
    []
  );

  // Drag validation state
  const dragValidation = useRef<DragValidationState>({
    operationId: null,
    startTime: null,
    lastValidPosition: null,
    consecutiveInvalidPositions: 0,
    isValidating: false,
  });

  // Debounced state update refs
  const debouncedUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const updateQueue = useRef<Array<() => void>>([]);

  // Performance monitoring
  const performanceMetrics = useRef({
    dragOverEvents: 0,
    validPositions: 0,
    invalidPositions: 0,
    averageCalculationTime: 0,
    lastResetTime: Date.now(),
  });

  // Debounced state update function
  const debouncedStateUpdate = useCallback(
    (updateFn: () => void, delay: number = 8) => {
      updateQueue.current.push(updateFn);

      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current);
      }

      debouncedUpdateRef.current = setTimeout(() => {
        const now = Date.now();

        // Batch all queued updates
        if (updateQueue.current.length > 0) {
          const updates = [...updateQueue.current];
          updateQueue.current = [];

          // Execute all updates in a single batch
          updates.forEach((update) => update());

          lastUpdateTime.current = now;
        }

        debouncedUpdateRef.current = null;
      }, delay);
    },
    []
  );

  // Validation function for drag operations
  const validateDragOperation = useCallback(
    (operationId: string, mousePosition: { x: number; y: number }): boolean => {
      const validation = dragValidation.current;

      // Check if operation ID matches current operation
      if (validation.operationId !== operationId) {
        validation.consecutiveInvalidPositions++;
        return false;
      }

      // Check for reasonable mouse movement (prevent jitter)
      if (validation.lastValidPosition) {
        const distance = Math.sqrt(
          Math.pow(mousePosition.x - validation.lastValidPosition.x, 2) +
            Math.pow(mousePosition.y - validation.lastValidPosition.y, 2)
        );

        // If movement is too small, skip update to prevent excessive re-renders
        if (distance < 3) {
          return false;
        }
      }

      // Check for timeout (operations shouldn't last too long)
      if (validation.startTime && Date.now() - validation.startTime > 30000) {
        // 30 seconds
        console.warn(`Drag operation ${operationId} timed out`);
        return false;
      }

      // Reset consecutive invalid positions on valid operation
      validation.consecutiveInvalidPositions = 0;
      validation.lastValidPosition = mousePosition;

      return true;
    },
    []
  );

  // Enhanced cleanup for interrupted operations
  const cleanupInterruptedOperation = useCallback(
    (operationId?: string) => {
      const validation = dragValidation.current;

      // Cancel any pending debounced updates
      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current);
        debouncedUpdateRef.current = null;
      }

      // Clear update queue
      updateQueue.current = [];

      // Cancel animations
      animationController.cancelAllAnimations();

      // Reset position calculator
      positionCalculator.current.reset();

      // Reset validation state
      validation.operationId = null;
      validation.startTime = null;
      validation.lastValidPosition = null;
      validation.consecutiveInvalidPositions = 0;
      validation.isValidating = false;

      // Perform store cleanup
      performCleanup(operationId);

      console.log(
        `Cleaned up interrupted drag operation: ${operationId || "unknown"}`
      );
    },
    [performCleanup]
  );

  // Cleanup temporary state on unmount
  useEffect(() => {
    return () => {
      cleanupInterruptedOperation();
    };
  }, [cleanupInterruptedOperation]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const operationId = `drag-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Initialize validation state
      const validation = dragValidation.current;
      validation.operationId = operationId;
      validation.startTime = Date.now();
      validation.lastValidPosition = null;
      validation.consecutiveInvalidPositions = 0;
      validation.isValidating = true;

      // Reset position calculator for new operation
      positionCalculator.current.reset();

      // Reset performance metrics periodically
      const metrics = performanceMetrics.current;
      if (Date.now() - metrics.lastResetTime > 60000) {
        // Reset every minute
        metrics.dragOverEvents = 0;
        metrics.validPositions = 0;
        metrics.invalidPositions = 0;
        metrics.averageCalculationTime = 0;
        metrics.lastResetTime = Date.now();
      }

      // Check if dragging from template panel
      if (active.id.toString().startsWith("template-")) {
        const templateId = active.id.toString().replace("template-", "");
        const template = elementTemplates.find((t) => t.id === templateId);
        if (template) {
          const actualOperationId = startDragOperation(template);
          validation.operationId = actualOperationId; // Update with actual operation ID
        } else {
          console.error(`Template not found: ${templateId}`);
          cleanupInterruptedOperation(operationId);
          return;
        }
      } else {
        // Dragging existing element
        const element = currentPage?.elements.find((el) => el.id === active.id);
        if (element) {
          const actualOperationId = startDragOperation(element);
          validation.operationId = actualOperationId; // Update with actual operation ID
        } else {
          console.error(`Element not found: ${active.id}`);
          cleanupInterruptedOperation(operationId);
          return;
        }
      }

      console.log(`Started drag operation: ${operationId}`);
    },
    [currentPage?.elements, startDragOperation, cleanupInterruptedOperation]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over, active } = event;
      const validation = dragValidation.current;
      const metrics = performanceMetrics.current;

      metrics.dragOverEvents++;

      // Validate operation consistency
      if (!validation.isValidating || !validation.operationId) {
        metrics.invalidPositions++;
        return;
      }

      // Get mouse position for validation
      const mousePosition = {
        x: (event as any).activatorEvent?.clientX || 0,
        y: (event as any).activatorEvent?.clientY || 0,
      };

      // Validate drag operation
      if (!validateDragOperation(validation.operationId, mousePosition)) {
        metrics.invalidPositions++;

        // If too many consecutive invalid positions, cleanup
        if (validation.consecutiveInvalidPositions > 10) {
          console.warn(
            `Too many invalid positions, cleaning up operation: ${validation.operationId}`
          );
          cleanupInterruptedOperation(validation.operationId);
        }
        return;
      }

      metrics.validPositions++;

      // Clear drag over state if not over any valid area
      if (!over) {
        debouncedStateUpdate(() => {
          revertTemporaryReorganization(validation.operationId!);
        });
        return;
      }

      // Verificar se estamos sobre uma área dropável válida
      const isValidDropArea =
        over &&
        (over.id === "canvas-drop-zone" ||
          over.id.toString().startsWith("element-"));

      if (!isValidDropArea) {
        debouncedStateUpdate(() => {
          revertTemporaryReorganization(validation.operationId!);
        });
        return;
      }

      // Handle drag over elements for insertion indicators and visual reorganization
      if (over.id.toString().startsWith("element-") && active) {
        const calculationStart = performance.now();

        const overElementId = over.id.toString();
        const overElement = currentPage?.elements.find(
          (el) => el.id === overElementId
        );

        if (overElement && active.id !== overElementId) {
          // Check if we're dragging an existing element (for reordering)
          const draggedElement = currentPage?.elements.find(
            (el) => el.id === active.id
          );

          if (draggedElement) {
            // Get element rect for precise position calculation
            const overElementDOM = document.querySelector(
              `[data-element-id="${overElementId}"]`
            );

            if (overElementDOM) {
              const elementRect = overElementDOM.getBoundingClientRect();
              const mouseY = mousePosition.y;

              // Use throttled position calculator for precise positioning
              const positionResult = throttledCalculator(
                mouseY,
                elementRect,
                draggedElement.position,
                overElement.position
              );

              if (positionResult) {
                // Update drag position with debouncing
                debouncedStateUpdate(() => {
                  updateDragPosition(
                    overElement.position,
                    positionResult.position
                  );

                  // Apply temporary visual reorganization
                  applyTemporaryReorganization(
                    draggedElement.id,
                    positionResult.insertionIndex,
                    validation.operationId!
                  );
                }, 8); // 8ms debounce for smooth 120fps updates
              }
            } else {
              // Fallback to basic reorganization without precise positioning
              debouncedStateUpdate(() => {
                applyTemporaryReorganization(
                  draggedElement.id,
                  overElement.position,
                  validation.operationId!
                );
              });
            }

            console.log(
              "Enhanced visual reorganization applied:",
              "dragged:",
              draggedElement.position,
              "target:",
              overElement.position,
              "operationId:",
              validation.operationId
            );
          } else {
            // Template drag over element - update position for insertion
            debouncedStateUpdate(() => {
              updateDragPosition(
                overElement.position,
                "top" // Default for templates
              );
            });

            console.log(
              "Template drag over element:",
              overElementId,
              "at position:",
              overElement.position,
              "operationId:",
              validation.operationId
            );
          }
        }

        // Update performance metrics
        const calculationTime = performance.now() - calculationStart;
        metrics.averageCalculationTime =
          (metrics.averageCalculationTime * (metrics.validPositions - 1) +
            calculationTime) /
          metrics.validPositions;
      } else if (over.id === "canvas-drop-zone") {
        // Clear insertion indicators and temporary reorganization when over the general canvas area
        debouncedStateUpdate(() => {
          revertTemporaryReorganization(validation.operationId!);
        });

        console.log(
          "Dragging over canvas drop zone, operationId:",
          validation.operationId
        );
      }
    },
    [
      currentPage?.elements,
      validateDragOperation,
      cleanupInterruptedOperation,
      debouncedStateUpdate,
      revertTemporaryReorganization,
      updateDragPosition,
      applyTemporaryReorganization,
      throttledCalculator,
    ]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const validation = dragValidation.current;
      const operationId = validation.operationId;

      // Cancel any pending debounced updates
      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current);
        debouncedUpdateRef.current = null;
      }

      // Validate operation consistency
      if (!operationId || !validation.isValidating) {
        console.warn("Drag end called without valid operation");
        cleanupInterruptedOperation();
        return;
      }

      // Log performance metrics
      const metrics = performanceMetrics.current;
      console.log("Drag operation performance:", {
        operationId,
        dragOverEvents: metrics.dragOverEvents,
        validPositions: metrics.validPositions,
        invalidPositions: metrics.invalidPositions,
        averageCalculationTime: metrics.averageCalculationTime,
        successRate:
          metrics.validPositions /
          (metrics.validPositions + metrics.invalidPositions),
      });

      // Verificar se o drop foi em uma área válida
      const isValidDrop =
        over &&
        (over.id === "canvas-drop-zone" ||
          over.id.toString().startsWith("element-"));

      // Se não estamos sobre uma área dropável válida, cancelamos a operação
      if (!isValidDrop) {
        console.log(
          "Drop em área inválida ou fora de área dropável, operationId:",
          operationId
        );

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

        // Clean up the operation
        cleanupInterruptedOperation(operationId);
        return;
      }

      // End the drag operation in the store
      endDragOperation(operationId, true);

      // Handle template drop to canvas
      if (
        active.id.toString().startsWith("template-") &&
        over.id === "canvas-drop-zone"
      ) {
        const templateId = active.id.toString().replace("template-", "");
        const template = elementTemplates.find((t) => t.id === templateId);
        if (template) {
          addElementFromTemplate(template);
          console.log(
            `Template ${templateId} added to canvas, operationId: ${operationId}`
          );
        }

        // Clean up after successful operation
        cleanupInterruptedOperation(operationId);
        return;
      }

      // Handle element reordering within canvas
      if (active.id !== over.id && currentPage) {
        const activeElement = currentPage.elements.find(
          (el) => el.id === active.id
        );
        const overElement = currentPage.elements.find(
          (el) => el.id === over.id
        );

        if (activeElement && overElement) {
          // Use the position calculator's last result for precise positioning
          const lastCalculation =
            positionCalculator.current.getLastCalculation();

          if (lastCalculation && lastCalculation.confidence > 0.6) {
            // Use precise insertion index from position calculator
            const activeIndex = currentPage.elements.findIndex(
              (el) => el.id === active.id
            );

            // Convert insertion index to target index for reorderElements
            let targetIndex = lastCalculation.insertionIndex;

            // Adjust for the fact that we're removing the dragged element first
            if (activeIndex < targetIndex) {
              targetIndex--;
            }

            reorderElements(activeIndex, targetIndex);

            console.log(
              `Element reordered with precision: ${active.id}, activeIndex: ${activeIndex}, targetIndex: ${targetIndex}, confidence: ${lastCalculation.confidence}, operationId: ${operationId}`
            );
          } else {
            // Fallback to basic reordering
            const activeIndex = currentPage.elements.findIndex(
              (el) => el.id === active.id
            );
            const overIndex = currentPage.elements.findIndex(
              (el) => el.id === over.id
            );

            reorderElements(activeIndex, overIndex);

            console.log(
              `Element reordered (fallback): ${active.id}, activeIndex: ${activeIndex}, overIndex: ${overIndex}, operationId: ${operationId}`
            );
          }
        }
      }

      // Handle template drop between elements
      if (
        active.id.toString().startsWith("template-") &&
        over.id.toString().startsWith("element-")
      ) {
        const templateId = active.id.toString().replace("template-", "");
        const template = elementTemplates.find((t) => t.id === templateId);
        const overElement = currentPage?.elements.find(
          (el) => el.id === over.id
        );

        if (template && overElement) {
          // Use precise insertion position if available
          const lastCalculation =
            positionCalculator.current.getLastCalculation();

          let insertPosition = overElement.position;

          if (lastCalculation && lastCalculation.confidence > 0.6) {
            insertPosition = lastCalculation.insertionIndex;
          }

          addElementFromTemplate(template, insertPosition);

          console.log(
            `Template ${templateId} inserted at position ${insertPosition}, operationId: ${operationId}`
          );
        }
      }

      // Clean up after successful operation
      cleanupInterruptedOperation(operationId);
    },
    [
      currentPage,
      cleanupInterruptedOperation,
      endDragOperation,
      addElementFromTemplate,
      reorderElements,
    ]
  );

  const renderDragOverlay = useCallback(() => {
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
  }, [draggedElement, draggedTemplate]);

  // Memoize the sortable items to prevent unnecessary re-renders
  const sortableItems = useMemo(() => {
    return useBioBuilderStore
      .getState()
      .getCurrentElementOrder()
      .map((el) => el.id);
  }, [currentPage?.elements]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>

      <DragOverlay>{renderDragOverlay()}</DragOverlay>
    </DndContext>
  );
}
