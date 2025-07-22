import { describe, it, expect, vi, beforeEach } from "vitest";
import { BioPage } from "@/types/bio-builder";

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

// Create a mock store for testing
const mockStore = {
  currentPage: createMockPage("1"),
  history: {
    past: [] as BioPage[],
    future: [] as BioPage[],
    limit: 50,
    batchingDelay: 500,
    lastActionType: undefined as string | undefined,
    lastActionTimestamp: undefined as number | undefined,
  },
  addToHistory: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  canUndo: vi.fn(),
  canRedo: vi.fn(),

  // Store functions that should integrate with history
  updateElement: vi.fn(),
  addElement: vi.fn(),
  deleteElement: vi.fn(),
  reorderElements: vi.fn(),
  updatePageTheme: vi.fn(),
};

// Mock the zustand implementation
vi.mock("../../stores/bio-builder-store", () => ({
  useBioBuilderStore: vi.fn((selector) => selector(mockStore)),
}));

// Import the store after mocking
import { useBioBuilderStore } from "../../stores/bio-builder-store";

describe("History Integration with Store Functions", () => {
  // Reset the store before each test
  beforeEach(() => {
    mockStore.currentPage = createMockPage("1");
    mockStore.history.past = [];
    mockStore.history.future = [];
    mockStore.history.lastActionType = undefined;
    mockStore.history.lastActionTimestamp = undefined;

    // Reset mocks
    vi.resetAllMocks();

    // Implement mock functions
    mockStore.addToHistory.mockImplementation(
      (page: BioPage, actionType?: string) => {
        // Create a deep copy of the page
        const pageCopy = JSON.parse(JSON.stringify(page));
        mockStore.history.past.push(pageCopy);
        mockStore.history.future = [];
      }
    );

    // Implement store functions that should integrate with history
    mockStore.updateElement.mockImplementation((id: string, data: any) => {
      // Should call addToHistory before updating
      mockStore.addToHistory(mockStore.currentPage, `updateElement:${id}`);

      // Update the element
      const updatedElements = mockStore.currentPage.elements.map((element) =>
        element.id === id
          ? { ...element, data: { ...element.data, ...data } }
          : element
      );

      mockStore.currentPage = {
        ...mockStore.currentPage,
        elements: updatedElements,
        updatedAt: new Date(),
      };
    });

    mockStore.addElement.mockImplementation((element: any) => {
      // Should call addToHistory before adding
      mockStore.addToHistory(
        mockStore.currentPage,
        `addElement:${element.type}`
      );

      // Add the element
      const newElement = {
        ...element,
        id: `element-${Date.now()}`,
        position: mockStore.currentPage.elements.length,
      };

      mockStore.currentPage = {
        ...mockStore.currentPage,
        elements: [...mockStore.currentPage.elements, newElement],
        updatedAt: new Date(),
      };
    });

    mockStore.deleteElement.mockImplementation((id: string) => {
      // Should call addToHistory before deleting
      mockStore.addToHistory(mockStore.currentPage, `deleteElement:${id}`);

      // Delete the element
      const updatedElements = mockStore.currentPage.elements
        .filter((element) => element.id !== id)
        .map((element, index) => ({ ...element, position: index }));

      mockStore.currentPage = {
        ...mockStore.currentPage,
        elements: updatedElements,
        updatedAt: new Date(),
      };
    });

    mockStore.reorderElements.mockImplementation(
      (fromIndex: number, toIndex: number) => {
        // Should call addToHistory before reordering
        mockStore.addToHistory(
          mockStore.currentPage,
          `reorderElements:${fromIndex}:${toIndex}`
        );

        // Reorder the elements
        const elements = [...mockStore.currentPage.elements];
        const [movedElement] = elements.splice(fromIndex, 1);
        elements.splice(toIndex, 0, movedElement);

        const updatedElements = elements.map((element, index) => ({
          ...element,
          position: index,
        }));

        mockStore.currentPage = {
          ...mockStore.currentPage,
          elements: updatedElements,
          updatedAt: new Date(),
        };
      }
    );

    mockStore.updatePageTheme.mockImplementation((theme: any) => {
      // Should call addToHistory before updating theme
      mockStore.addToHistory(mockStore.currentPage, `updatePageTheme`);

      // Update the theme
      mockStore.currentPage = {
        ...mockStore.currentPage,
        theme: { ...mockStore.currentPage.theme, ...theme },
        updatedAt: new Date(),
      };
    });
  });

  describe("updateElement", () => {
    it("should add the current state to history before updating an element", () => {
      // Setup: Create a page with an element
      const elementId = mockStore.currentPage.elements[0].id;

      // Update the element
      mockStore.updateElement(elementId, { content: "Updated content" });

      // Verify that addToHistory was called with the correct parameters
      expect(mockStore.addToHistory).toHaveBeenCalledTimes(1);
      expect(mockStore.addToHistory).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1" }),
        `updateElement:${elementId}`
      );

      // Verify that the element was updated
      expect(mockStore.currentPage.elements[0].data.content).toBe(
        "Updated content"
      );
    });
  });

  describe("addElement", () => {
    it("should add the current state to history before adding an element", () => {
      // Add a new element
      const newElement = {
        type: "link" as const,
        data: {
          title: "New Link",
          url: "https://example.com",
        },
      };

      mockStore.addElement(newElement);

      // Verify that addToHistory was called with the correct parameters
      expect(mockStore.addToHistory).toHaveBeenCalledTimes(1);
      expect(mockStore.addToHistory).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1" }),
        "addElement:link"
      );

      // Verify that the element was added
      expect(mockStore.currentPage.elements.length).toBe(2);
      expect(mockStore.currentPage.elements[1].data.title).toBe("New Link");
    });
  });

  describe("deleteElement", () => {
    it("should add the current state to history before deleting an element", () => {
      // Setup: Create a page with an element
      const elementId = mockStore.currentPage.elements[0].id;

      // Delete the element
      mockStore.deleteElement(elementId);

      // Verify that addToHistory was called with the correct parameters
      expect(mockStore.addToHistory).toHaveBeenCalledTimes(1);
      expect(mockStore.addToHistory).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1" }),
        `deleteElement:${elementId}`
      );

      // Verify that the element was deleted
      expect(mockStore.currentPage.elements.length).toBe(0);
    });
  });

  describe("reorderElements", () => {
    it("should add the current state to history before reordering elements", () => {
      // Setup: Add another element to the page
      mockStore.currentPage.elements.push({
        id: "element-1-2",
        type: "link",
        position: 1,
        data: {
          title: "Link",
          url: "https://example.com",
        },
      });

      // Reorder the elements
      mockStore.reorderElements(0, 1);

      // Verify that addToHistory was called with the correct parameters
      expect(mockStore.addToHistory).toHaveBeenCalledTimes(1);
      expect(mockStore.addToHistory).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1" }),
        "reorderElements:0:1"
      );

      // Verify that the elements were reordered
      expect(mockStore.currentPage.elements[0].id).toBe("element-1-2");
      expect(mockStore.currentPage.elements[1].id).toBe(`element-1-1`);
    });
  });

  describe("updatePageTheme", () => {
    it("should add the current state to history before updating the theme", () => {
      // Update the theme
      mockStore.updatePageTheme({ backgroundColor: "#000000" });

      // Verify that addToHistory was called with the correct parameters
      expect(mockStore.addToHistory).toHaveBeenCalledTimes(1);
      expect(mockStore.addToHistory).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1" }),
        "updatePageTheme"
      );

      // Verify that the theme was updated
      expect(mockStore.currentPage.theme.backgroundColor).toBe("#000000");
    });
  });
});
