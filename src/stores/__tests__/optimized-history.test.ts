import { describe, it, expect } from "vitest";
import { BioPage } from "@/types/bio-builder";
import {
  createOptimizedHistoryEntry,
  serializeHistoryEntry,
  deserializeHistoryEntry,
} from "../optimized-history";

// Helper function to create a mock page
const createMockPage = (id: string): BioPage => ({
  id,
  title: `Page ${id}`,
  slug: `page-${id}`,
  elements: [
    {
      id: `element-${id}-1`,
      type: "text",
      position: 0,
      data: {
        content: "Test content",
        backgroundColor: "#ffffff",
        textColor: "#000000",
      },
    },
  ],
  theme: {
    backgroundColor: "#ffffff",
    primaryColor: "#000000",
    secondaryColor: "#666666",
    fontFamily: "Inter",
    backgroundType: "solid",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("Optimized History Functions", () => {
  describe("createOptimizedHistoryEntry", () => {
    it("should create an optimized version of a page", () => {
      const originalPage = createMockPage("1");
      const optimizedPage = createOptimizedHistoryEntry(originalPage);

      // Verify that the optimized page has all the essential fields
      expect(optimizedPage.id).toBe(originalPage.id);
      expect(optimizedPage.title).toBe(originalPage.title);
      expect(optimizedPage.slug).toBe(originalPage.slug);
      expect(optimizedPage.elements.length).toBe(originalPage.elements.length);
      expect(optimizedPage.theme).toEqual(originalPage.theme);
      expect(optimizedPage.createdAt).toEqual(originalPage.createdAt);
      expect(optimizedPage.updatedAt).toEqual(originalPage.updatedAt);

      // Verify that the elements have all the essential fields
      expect(optimizedPage.elements[0].id).toBe(originalPage.elements[0].id);
      expect(optimizedPage.elements[0].type).toBe(
        originalPage.elements[0].type
      );
      expect(optimizedPage.elements[0].position).toBe(
        originalPage.elements[0].position
      );
      expect(optimizedPage.elements[0].data).toEqual(
        originalPage.elements[0].data
      );
    });
  });

  describe("serializeHistoryEntry", () => {
    it("should serialize a page with Date objects", () => {
      const originalPage = createMockPage("1");
      const serializedPage = serializeHistoryEntry(originalPage);

      // Verify that Date objects are serialized
      expect(serializedPage.createdAt.__type).toBe("Date");
      expect(serializedPage.updatedAt.__type).toBe("Date");
      expect(typeof serializedPage.createdAt.value).toBe("string");
      expect(typeof serializedPage.updatedAt.value).toBe("string");
    });
  });

  describe("deserializeHistoryEntry", () => {
    it("should deserialize a page with Date objects", () => {
      const originalPage = createMockPage("1");
      const serializedPage = serializeHistoryEntry(originalPage);
      const deserializedPage = deserializeHistoryEntry(serializedPage);

      // Verify that Date objects are deserialized
      expect(deserializedPage.createdAt instanceof Date).toBe(true);
      expect(deserializedPage.updatedAt instanceof Date).toBe(true);
      expect(deserializedPage.createdAt.getTime()).toBe(
        originalPage.createdAt.getTime()
      );
      expect(deserializedPage.updatedAt.getTime()).toBe(
        originalPage.updatedAt.getTime()
      );
    });
  });

  describe("Full Serialization Cycle", () => {
    it("should preserve all essential data through the full cycle", () => {
      const originalPage = createMockPage("1");

      // Run through the full optimization and serialization cycle
      const optimizedPage = createOptimizedHistoryEntry(originalPage);
      const serializedPage = serializeHistoryEntry(optimizedPage);
      const deserializedPage = deserializeHistoryEntry(serializedPage);

      // Verify that all essential data is preserved
      expect(deserializedPage.id).toBe(originalPage.id);
      expect(deserializedPage.title).toBe(originalPage.title);
      expect(deserializedPage.slug).toBe(originalPage.slug);
      expect(deserializedPage.elements.length).toBe(
        originalPage.elements.length
      );
      expect(deserializedPage.theme).toEqual(originalPage.theme);
      expect(deserializedPage.createdAt.getTime()).toBe(
        originalPage.createdAt.getTime()
      );
      expect(deserializedPage.updatedAt.getTime()).toBe(
        originalPage.updatedAt.getTime()
      );

      // Verify that element data is preserved
      expect(deserializedPage.elements[0].id).toBe(originalPage.elements[0].id);
      expect(deserializedPage.elements[0].type).toBe(
        originalPage.elements[0].type
      );
      expect(deserializedPage.elements[0].position).toBe(
        originalPage.elements[0].position
      );
      expect(deserializedPage.elements[0].data).toEqual(
        originalPage.elements[0].data
      );
    });
  });
});
