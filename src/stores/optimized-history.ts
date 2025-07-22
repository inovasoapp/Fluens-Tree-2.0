/**
 * Optimized history management functions for the BioBuilderStore
 * This file contains functions to optimize the storage of states in the history
 */

import { BioPage } from "@/types/bio-builder";

/**
 * Creates an optimized version of a page for storage in history
 * Only stores the essential information needed to restore the state
 * @param page The page to optimize
 * @returns An optimized version of the page
 * @throws Error if the page is invalid or cannot be optimized
 */
export function createOptimizedHistoryEntry(page: BioPage): BioPage {
  // Validate input
  if (!page) {
    throw new Error("Cannot create history entry from undefined or null page");
  }

  try {
    // Create a minimal version of the page with only the necessary fields
    const minimalPage = {
      id: page.id || `recovery-${Date.now()}`,
      title: page.title || "Recovered Page",
      slug: page.slug || "recovered-page",
      elements: Array.isArray(page.elements)
        ? page.elements.map((element) => ({
            id:
              element.id ||
              `element-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 11)}`,
            type: element.type || "text",
            position:
              typeof element.position === "number" ? element.position : 0,
            data: element.data ? { ...element.data } : {},
          }))
        : [],
      theme: page.theme
        ? { ...page.theme }
        : {
            backgroundColor: "#ffffff",
            primaryColor: "#000000",
            secondaryColor: "#666666",
            fontFamily: "Inter",
            backgroundType: "solid",
          },
      createdAt: page.createdAt instanceof Date ? page.createdAt : new Date(),
      updatedAt: page.updatedAt instanceof Date ? page.updatedAt : new Date(),
    };

    return minimalPage;
  } catch (error) {
    console.error("Error creating optimized history entry:", error);
    throw new Error(
      `Failed to create optimized history entry: ${error.message}`
    );
  }
}

/**
 * Serializes a page for storage in history
 * Handles Date objects and other special types
 * @param page The page to serialize
 * @returns A serialized version of the page
 * @throws Error if serialization fails
 */
export function serializeHistoryEntry(page: BioPage): any {
  // Validate input
  if (!page) {
    throw new Error("Cannot serialize undefined or null page");
  }

  try {
    // Create a deep copy of the page and handle Date objects
    const serialized = {};

    // Copy all properties except dates
    Object.keys(page).forEach((key) => {
      try {
        if (key === "createdAt" || key === "updatedAt") {
          // Handle Date objects
          if (page[key] instanceof Date) {
            serialized[key] = {
              __type: "Date",
              value: page[key].toISOString(),
            };
          } else {
            // If not a Date, create a default date
            serialized[key] = {
              __type: "Date",
              value: new Date().toISOString(),
            };
          }
        } else if (key === "elements") {
          // Deep copy elements array
          serialized[key] = Array.isArray(page[key]) ? [...page[key]] : [];
        } else if (key === "theme") {
          // Deep copy theme object
          serialized[key] = page[key]
            ? { ...page[key] }
            : {
                backgroundColor: "#ffffff",
                primaryColor: "#000000",
                secondaryColor: "#666666",
                fontFamily: "Inter",
                backgroundType: "solid",
              };
        } else {
          // Copy other properties
          serialized[key] = page[key];
        }
      } catch (propertyError) {
        console.error(`Error serializing property ${key}:`, propertyError);
        // Set a default value for the property to maintain structure
        if (key === "elements") {
          serialized[key] = [];
        } else if (key === "theme") {
          serialized[key] = {
            backgroundColor: "#ffffff",
            primaryColor: "#000000",
            secondaryColor: "#666666",
            fontFamily: "Inter",
            backgroundType: "solid",
          };
        } else if (key === "createdAt" || key === "updatedAt") {
          serialized[key] = {
            __type: "Date",
            value: new Date().toISOString(),
          };
        } else {
          serialized[key] = null;
        }
      }
    });

    return serialized;
  } catch (error) {
    console.error("Error serializing history entry:", error);
    throw new Error(`Failed to serialize history entry: ${error.message}`);
  }
}

/**
 * Deserializes a page from history storage
 * Restores Date objects and other special types
 * @param serializedPage The serialized page
 * @returns A deserialized version of the page
 * @throws Error if deserialization fails
 */
export function deserializeHistoryEntry(serializedPage: any): BioPage {
  // Validate input
  if (!serializedPage) {
    throw new Error("Cannot deserialize undefined or null page");
  }

  try {
    // Create a new object to hold the deserialized page
    const deserialized: any = { ...serializedPage };

    // Ensure required properties exist
    if (!deserialized.id) {
      deserialized.id = `recovery-${Date.now()}`;
    }

    if (!deserialized.title) {
      deserialized.title = "Recovered Page";
    }

    if (!deserialized.slug) {
      deserialized.slug = "recovered-page";
    }

    if (!Array.isArray(deserialized.elements)) {
      deserialized.elements = [];
    }

    if (!deserialized.theme || typeof deserialized.theme !== "object") {
      deserialized.theme = {
        backgroundColor: "#ffffff",
        primaryColor: "#000000",
        secondaryColor: "#666666",
        fontFamily: "Inter",
        backgroundType: "solid",
      };
    }

    // Convert date objects back to Date instances
    try {
      if (deserialized.createdAt && deserialized.createdAt.__type === "Date") {
        deserialized.createdAt = new Date(deserialized.createdAt.value);
      } else {
        deserialized.createdAt = new Date();
      }
    } catch (dateError) {
      console.error("Error deserializing createdAt date:", dateError);
      deserialized.createdAt = new Date();
    }

    try {
      if (deserialized.updatedAt && deserialized.updatedAt.__type === "Date") {
        deserialized.updatedAt = new Date(deserialized.updatedAt.value);
      } else {
        deserialized.updatedAt = new Date();
      }
    } catch (dateError) {
      console.error("Error deserializing updatedAt date:", dateError);
      deserialized.updatedAt = new Date();
    }

    // Validate elements structure
    deserialized.elements = deserialized.elements.map((element: any) => {
      if (!element || typeof element !== "object") {
        return {
          id: `element-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 11)}`,
          type: "text",
          position: 0,
          data: {},
        };
      }

      return {
        id:
          element.id ||
          `element-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 11)}`,
        type: element.type || "text",
        position: typeof element.position === "number" ? element.position : 0,
        data:
          element.data && typeof element.data === "object"
            ? { ...element.data }
            : {},
      };
    });

    return deserialized as BioPage;
  } catch (error) {
    console.error("Error deserializing history entry:", error);
    throw new Error(`Failed to deserialize history entry: ${error.message}`);
  }
}
