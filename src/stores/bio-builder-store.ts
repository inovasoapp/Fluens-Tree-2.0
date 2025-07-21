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

  // Persistence state
  lastSaved: Date | null;
  autoSaveEnabled: boolean;

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
      isDragging: false,
      draggedElement: null,
      draggedTemplate: null,
      isCanvasDragging: false,
      lastSaved: null,
      autoSaveEnabled: true,

      setCurrentPage: (page) => {
        const migratedPage = migratePageBackgroundConfig(page);
        set({ currentPage: migratedPage });
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
        triggerAutoSave(get);
      },

      updateBackgroundType: (backgroundType) => {
        const state = get();
        if (!state.currentPage) return;

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

        // Monitor background changes for persistence events
        import("@/lib/background-persistence")
          .then(({ monitorBackgroundChanges }) => {
            monitorBackgroundChanges(state.currentPage!.theme, {
              ...state.currentPage!.theme,
              backgroundType: "image" as const,
              backgroundImage: image,
            });
          })
          .catch((error) => {
            console.warn("Failed to monitor background changes:", error);
          });

        const updatedPage = {
          ...state.currentPage,
          theme: {
            ...state.currentPage.theme,
            backgroundType: "image" as const,
            backgroundImage: image,
          },
          updatedAt: new Date(),
        };

        set({ currentPage: updatedPage });
        triggerAutoSave(get);
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
        }
      },
    }
  )
);
