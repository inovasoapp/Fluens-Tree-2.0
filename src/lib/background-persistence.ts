/**
 * Background Persistence Utilities
 *
 * This module provides utilities for managing background configuration persistence
 * and state restoration. It works in conjunction with the bio-builder-store to
 * ensure background settings are properly saved and restored.
 */

import { BioPage, BioPageTheme } from "@/types/bio-builder";

/**
 * Background persistence events for monitoring
 */
export type BackgroundPersistenceEvent =
  | "save_started"
  | "save_completed"
  | "save_failed"
  | "restore_started"
  | "restore_completed"
  | "migration_applied";

/**
 * Event listener type for background persistence events
 */
export type BackgroundPersistenceListener = (
  event: BackgroundPersistenceEvent,
  data?: any
) => void;

// Event listeners registry
const persistenceListeners: BackgroundPersistenceListener[] = [];

/**
 * Adds an event listener for background persistence events
 */
export const addPersistenceListener = (
  listener: BackgroundPersistenceListener
): void => {
  persistenceListeners.push(listener);
};

/**
 * Removes an event listener for background persistence events
 */
export const removePersistenceListener = (
  listener: BackgroundPersistenceListener
): void => {
  const index = persistenceListeners.indexOf(listener);
  if (index > -1) {
    persistenceListeners.splice(index, 1);
  }
};

/**
 * Emits a background persistence event
 */
const emitPersistenceEvent = (
  event: BackgroundPersistenceEvent,
  data?: any
): void => {
  persistenceListeners.forEach((listener) => {
    try {
      listener(event, data);
    } catch (error) {
      console.warn("Error in persistence event listener:", error);
    }
  });
};

/**
 * Validates that a page has proper background configuration
 */
export const validateBackgroundConfig = (page: BioPage): boolean => {
  const theme = page.theme;

  // Check if backgroundType is present
  if (!theme.backgroundType) {
    return false;
  }

  // Validate based on background type
  switch (theme.backgroundType) {
    case "solid":
      return !!theme.backgroundColor;

    case "gradient":
      return !!(
        theme.backgroundGradient &&
        theme.backgroundGradient.colors &&
        theme.backgroundGradient.colors.length === 2 &&
        typeof theme.backgroundGradient.direction === "number" &&
        theme.backgroundGradient.direction >= 0 &&
        theme.backgroundGradient.direction <= 360
      );

    case "image":
      return !!(
        theme.backgroundImage &&
        theme.backgroundImage.url &&
        typeof theme.backgroundImage.blur === "number" &&
        theme.backgroundImage.blur >= 0 &&
        theme.backgroundImage.blur <= 20
      );

    default:
      return false;
  }
};

/**
 * Enhanced page save with background validation and events
 */
export const savePageWithBackgroundValidation = async (
  page: BioPage,
  saveFunction: (page: BioPage) => Promise<void>
): Promise<void> => {
  emitPersistenceEvent("save_started", { pageId: page.id });

  try {
    // Validate background configuration before saving
    if (!validateBackgroundConfig(page)) {
      console.warn("Invalid background configuration detected during save");
      // Could apply migration here if needed
    }

    await saveFunction(page);

    emitPersistenceEvent("save_completed", {
      pageId: page.id,
      backgroundType: page.theme.backgroundType,
    });
  } catch (error) {
    emitPersistenceEvent("save_failed", {
      pageId: page.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

/**
 * Enhanced page restore with background validation and events
 */
export const restorePageWithBackgroundValidation = async (
  pageId: string,
  restoreFunction: (pageId: string) => Promise<BioPage | null>
): Promise<BioPage | null> => {
  emitPersistenceEvent("restore_started", { pageId });

  try {
    const page = await restoreFunction(pageId);

    if (page) {
      // Validate and potentially migrate background configuration
      if (!validateBackgroundConfig(page)) {
        console.log("Applying background migration during restore");
        emitPersistenceEvent("migration_applied", { pageId });
        // Migration would be applied by the calling code
      }

      emitPersistenceEvent("restore_completed", {
        pageId,
        backgroundType: page.theme.backgroundType,
      });
    }

    return page;
  } catch (error) {
    console.error("Failed to restore page:", error);
    return null;
  }
};

/**
 * Gets the storage key for a specific page
 */
export const getPageStorageKey = (pageId: string): string => {
  return `bio-page-${pageId}`;
};

/**
 * Checks if the browser supports localStorage
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets the last saved timestamp for a page
 */
export const getLastSavedTime = (pageId: string): Date | null => {
  if (!isStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(
      `${getPageStorageKey(pageId)}-timestamp`
    );
    return stored ? new Date(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Sets the last saved timestamp for a page
 */
export const setLastSavedTime = (pageId: string, timestamp: Date): void => {
  if (!isStorageAvailable()) return;

  try {
    localStorage.setItem(
      `${getPageStorageKey(pageId)}-timestamp`,
      timestamp.toISOString()
    );
  } catch (error) {
    console.warn("Failed to save timestamp:", error);
  }
};

/**
 * Clears all stored data for a page
 */
export const clearPageStorage = (pageId: string): void => {
  if (!isStorageAvailable()) return;

  try {
    localStorage.removeItem(getPageStorageKey(pageId));
    localStorage.removeItem(`${getPageStorageKey(pageId)}-timestamp`);
  } catch (error) {
    console.warn("Failed to clear page storage:", error);
  }
};

/**
 * Gets storage usage information
 */
export const getStorageInfo = (): {
  used: number;
  available: number;
  percentage: number;
} => {
  if (!isStorageAvailable()) {
    return { used: 0, available: 0, percentage: 0 };
  }

  try {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Rough estimate of localStorage limit (usually 5-10MB)
    const available = 5 * 1024 * 1024; // 5MB
    const percentage = (used / available) * 100;

    return { used, available, percentage };
  } catch {
    return { used: 0, available: 0, percentage: 0 };
  }
};

/**
 * Exports page configuration for backup
 */
export const exportPageConfig = (page: BioPage): string => {
  return JSON.stringify(
    {
      ...page,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    },
    null,
    2
  );
};

/**
 * Imports page configuration from backup
 */
export const importPageConfig = (configJson: string): BioPage | null => {
  try {
    const config = JSON.parse(configJson);

    // Basic validation
    if (!config.id || !config.theme) {
      throw new Error("Invalid page configuration");
    }

    // Convert date strings back to Date objects
    const importedPage: BioPage = {
      ...config,
      createdAt: new Date(config.createdAt),
      updatedAt: new Date(config.updatedAt),
    };

    // Validate background configuration
    if (!validateBackgroundConfig(importedPage)) {
      console.warn("Imported page has invalid background configuration");
    }

    return importedPage;
  } catch (error) {
    console.error("Failed to import page configuration:", error);
    return null;
  }
};

/**
 * Creates a backup of current background configuration
 */
export const createBackgroundBackup = (page: BioPage): string => {
  const backup = {
    pageId: page.id,
    backgroundConfig: {
      backgroundType: page.theme.backgroundType,
      backgroundColor: page.theme.backgroundColor,
      backgroundGradient: page.theme.backgroundGradient,
      backgroundImage: page.theme.backgroundImage,
    },
    timestamp: new Date().toISOString(),
    version: "1.0",
  };

  return JSON.stringify(backup, null, 2);
};

/**
 * Restores background configuration from backup
 */
export const restoreBackgroundFromBackup = (
  backupJson: string,
  currentPage: BioPage
): BioPage | null => {
  try {
    const backup = JSON.parse(backupJson);

    if (!backup.backgroundConfig || backup.pageId !== currentPage.id) {
      throw new Error("Invalid backup or page ID mismatch");
    }

    const restoredPage: BioPage = {
      ...currentPage,
      theme: {
        ...currentPage.theme,
        ...backup.backgroundConfig,
      },
      updatedAt: new Date(),
    };

    // Validate the restored configuration
    if (!validateBackgroundConfig(restoredPage)) {
      console.warn("Restored background configuration is invalid");
      return null;
    }

    return restoredPage;
  } catch (error) {
    console.error("Failed to restore background from backup:", error);
    return null;
  }
};

/**
 * Monitors storage usage for background images
 */
export const getBackgroundStorageUsage = (): {
  totalImages: number;
  totalSize: number;
  largestImage: { url: string; size: number } | null;
} => {
  if (!isStorageAvailable()) {
    return { totalImages: 0, totalSize: 0, largestImage: null };
  }

  let totalImages = 0;
  let totalSize = 0;
  let largestImage: { url: string; size: number } | null = null;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("bio-page-")) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const page = JSON.parse(value);
            if (page.theme?.backgroundImage?.url) {
              totalImages++;
              const imageSize = value.length; // Approximate size
              totalSize += imageSize;

              if (!largestImage || imageSize > largestImage.size) {
                largestImage = {
                  url: page.theme.backgroundImage.url,
                  size: imageSize,
                };
              }
            }
          } catch {
            // Skip invalid entries
          }
        }
      }
    }
  } catch (error) {
    console.warn("Failed to calculate storage usage:", error);
  }

  return { totalImages, totalSize, largestImage };
};

/**
 * Cleans up old background image data
 */
export const cleanupOldBackgroundData = (maxAge: number = 30): number => {
  if (!isStorageAvailable()) return 0;

  let cleanedCount = 0;
  const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("bio-page-") && key.endsWith("-backup")) {
        const timestampKey = key.replace("-backup", "-timestamp");
        const timestamp = localStorage.getItem(timestampKey);

        if (timestamp) {
          const backupDate = new Date(timestamp);
          if (backupDate < cutoffDate) {
            keysToRemove.push(key);
            keysToRemove.push(timestampKey);
          }
        }
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      cleanedCount++;
    });

    console.log(`Cleaned up ${cleanedCount} old background data entries`);
  } catch (error) {
    console.warn("Failed to cleanup old background data:", error);
  }

  return cleanedCount;
};

/**
 * Monitors background configuration changes and triggers persistence events
 * @param oldTheme Previous theme configuration
 * @param newTheme Updated theme configuration
 */
export const monitorBackgroundChanges = (
  oldTheme: BioPageTheme,
  newTheme: BioPageTheme
): boolean => {
  // Check if background configuration has changed
  const backgroundChanged =
    oldTheme.backgroundType !== newTheme.backgroundType ||
    oldTheme.backgroundColor !== newTheme.backgroundColor ||
    JSON.stringify(oldTheme.backgroundGradient) !==
      JSON.stringify(newTheme.backgroundGradient) ||
    JSON.stringify(oldTheme.backgroundImage) !==
      JSON.stringify(newTheme.backgroundImage);

  if (backgroundChanged) {
    emitPersistenceEvent("save_started", {
      oldType: oldTheme.backgroundType,
      newType: newTheme.backgroundType,
    });
  }

  return backgroundChanged;
};

/**
 * Creates a session backup of background configuration
 * This is useful for temporary storage during the current session
 */
export const createSessionBackup = (
  pageId: string,
  theme: BioPageTheme
): void => {
  if (!isStorageAvailable()) return;

  try {
    const sessionKey = `bio-page-${pageId}-session-backup`;
    const backup = {
      backgroundType: theme.backgroundType,
      backgroundColor: theme.backgroundColor,
      backgroundGradient: theme.backgroundGradient,
      backgroundImage: theme.backgroundImage,
      timestamp: new Date().toISOString(),
    };

    sessionStorage.setItem(sessionKey, JSON.stringify(backup));
    console.log("Created session backup of background configuration");
  } catch (error) {
    console.warn("Failed to create session backup:", error);
  }
};

/**
 * Restores background configuration from session backup
 */
export const restoreFromSessionBackup = (
  pageId: string
): Partial<BioPageTheme> | null => {
  if (!isStorageAvailable()) return null;

  try {
    const sessionKey = `bio-page-${pageId}-session-backup`;
    const backup = sessionStorage.getItem(sessionKey);

    if (!backup) return null;

    const parsedBackup = JSON.parse(backup);
    console.log("Restored background configuration from session backup");

    return {
      backgroundType: parsedBackup.backgroundType,
      backgroundColor: parsedBackup.backgroundColor,
      backgroundGradient: parsedBackup.backgroundGradient,
      backgroundImage: parsedBackup.backgroundImage,
    };
  } catch (error) {
    console.warn("Failed to restore from session backup:", error);
    return null;
  }
};
