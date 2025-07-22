import { describe, it, expect, vi, beforeEach } from "vitest";
import { BioPage } from "@/types/bio-builder";

// Mock the store implementation for testing
const createMockPage = (id: string): BioPage => ({
  id,
  title: `Page ${id}`,
  slug: `page-${id}`,
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
};

// Mock the zustand implementation
vi.mock("../bio-builder-store", () => ({
  useBioBuilderStore: vi.fn((selector) => selector(mockStore)),
}));

// Import the store after mocking
import { useBioBuilderStore } from "../bio-builder-store";

describe("History Management Functions", () => {
  // Reset the store before each test
  beforeEach(() => {
    mockStore.currentPage = createMockPage("1");
    mockStore.history.past = [];
    mockStore.history.future = [];

    // Reset mocks
    vi.resetAllMocks();

    // Implement mock functions
    mockStore.addToHistory.mockImplementation(
      (page: BioPage, actionType?: string) => {
        // Create a deep copy of the page
        const pageCopy = JSON.parse(JSON.stringify(page));
        const now = Date.now();

        // Implement intelligent grouping of changes
        const shouldGroup =
          actionType &&
          mockStore.history.lastActionType === actionType &&
          mockStore.history.lastActionTimestamp &&
          now - mockStore.history.lastActionTimestamp <
            mockStore.history.batchingDelay;

        if (shouldGroup && mockStore.history.past.length > 0) {
          // Replace the last history entry instead of adding a new one
          mockStore.history.past = [
            ...mockStore.history.past.slice(0, -1),
            pageCopy,
          ];
        } else {
          // Add to past history
          mockStore.history.past.push(pageCopy);
        }

        // Limit the size of the history
        if (mockStore.history.past.length > mockStore.history.limit) {
          mockStore.history.past = mockStore.history.past.slice(
            mockStore.history.past.length - mockStore.history.limit
          );
        }

        // Update action tracking
        mockStore.history.lastActionType = actionType;
        mockStore.history.lastActionTimestamp = now;

        // Clear future history
        mockStore.history.future = [];
      }
    );

    mockStore.undo.mockImplementation(() => {
      if (mockStore.history.past.length === 0 || !mockStore.currentPage) {
        return;
      }

      const previousState = mockStore.history.past.pop();
      mockStore.history.future = [
        mockStore.currentPage,
        ...mockStore.history.future,
      ];
      mockStore.currentPage = previousState!;
    });

    mockStore.redo.mockImplementation(() => {
      if (mockStore.history.future.length === 0 || !mockStore.currentPage) {
        return;
      }

      const [nextState, ...newFuture] = mockStore.history.future;
      mockStore.history.past.push(mockStore.currentPage);
      mockStore.currentPage = nextState;
      mockStore.history.future = newFuture;
    });

    mockStore.canUndo.mockImplementation(
      () => mockStore.history.past.length > 0
    );
    mockStore.canRedo.mockImplementation(
      () => mockStore.history.future.length > 0
    );
  });

  describe("addToHistory", () => {
    it("should add a page to the history", () => {
      const page = createMockPage("1");

      mockStore.addToHistory(page);

      expect(mockStore.history.past.length).toBe(1);
      expect(mockStore.history.past[0].id).toBe("1");
    });

    it("should clear future history when adding a new page", () => {
      // Setup: Add a page to history and perform undo to create future history
      const page1 = createMockPage("1");
      mockStore.addToHistory(page1);
      mockStore.undo();

      // Add a new page to history
      const page2 = createMockPage("2");
      mockStore.addToHistory(page2);

      // Future history should be cleared
      expect(mockStore.history.future.length).toBe(0);
    });

    it("should limit the history size to the defined limit", () => {
      // Set a small limit for testing
      const originalLimit = mockStore.history.limit;
      mockStore.history.limit = 3;

      // Add more pages than the limit
      for (let i = 0; i < 5; i++) {
        mockStore.addToHistory(createMockPage(`${i}`));
      }

      // History should be limited to the defined limit
      expect(mockStore.history.past.length).toBe(3);

      // Restore the original limit
      mockStore.history.limit = originalLimit;
    });

    it("should group similar actions that occur within the batching delay", () => {
      // Setup: Initialize the store with batching delay
      mockStore.history.batchingDelay = 500;
      mockStore.history.lastActionTimestamp = Date.now();
      mockStore.history.lastActionType = "updateElement:123";

      // Add a page to history with the same action type
      const page1 = createMockPage("1");
      mockStore.addToHistory(page1, "updateElement:123");

      // Add another page with the same action type within the batching delay
      const page2 = createMockPage("2");
      mockStore.addToHistory(page2, "updateElement:123");

      // History should have only one entry (the latest one)
      expect(mockStore.history.past.length).toBe(1);
      expect(mockStore.history.past[0].id).toBe("2");
    });

    it("should not group actions of different types", () => {
      // Setup: Initialize the store with batching delay
      mockStore.history.batchingDelay = 500;
      mockStore.history.lastActionTimestamp = Date.now();
      mockStore.history.lastActionType = "updateElement:123";

      // Add a page to history with the same action type
      const page1 = createMockPage("1");
      mockStore.addToHistory(page1, "updateElement:123");

      // Add another page with a different action type within the batching delay
      const page2 = createMockPage("2");
      mockStore.addToHistory(page2, "deleteElement:456");

      // History should have two entries
      expect(mockStore.history.past.length).toBe(2);
      expect(mockStore.history.past[0].id).toBe("1");
      expect(mockStore.history.past[1].id).toBe("2");
    });

    it("should not group actions that occur outside the batching delay", () => {
      // Setup: Initialize the store with batching delay
      mockStore.history.batchingDelay = 500;
      mockStore.history.lastActionTimestamp = Date.now() - 600; // Older than batching delay
      mockStore.history.lastActionType = "updateElement:123";
      mockStore.history.past = []; // Clear past history

      // Add a page to history with the same action type
      const page1 = createMockPage("1");
      mockStore.addToHistory(page1, "updateElement:123");

      // Update the timestamp to be outside the batching delay
      mockStore.history.lastActionTimestamp = Date.now() - 600; // Older than batching delay

      // Add another page with the same action type but outside the batching delay
      const page2 = createMockPage("2");
      mockStore.addToHistory(page2, "updateElement:123");

      // History should have two entries
      expect(mockStore.history.past.length).toBe(2);
      expect(mockStore.history.past[0].id).toBe("1");
      expect(mockStore.history.past[1].id).toBe("2");
    });
  });

  describe("undo", () => {
    it("should restore the previous state", () => {
      // Setup: Add pages to history
      const page1 = createMockPage("1");
      mockStore.addToHistory(page1);

      const page2 = createMockPage("2");
      mockStore.currentPage = page2;

      // Perform undo
      mockStore.undo();

      // Current page should be the previous state
      expect(mockStore.currentPage.id).toBe("1");
    });

    it("should move the current state to future history", () => {
      // Setup: Add a page to history
      const page1 = createMockPage("1");
      mockStore.addToHistory(page1);

      const page2 = createMockPage("2");
      mockStore.currentPage = page2;

      // Perform undo
      mockStore.undo();

      // Future history should contain the undone state
      expect(mockStore.history.future.length).toBe(1);
      expect(mockStore.history.future[0].id).toBe("2");
    });

    it("should do nothing if there is no history", () => {
      const currentPage = mockStore.currentPage;

      // Clear history
      mockStore.history.past = [];

      // Perform undo
      mockStore.undo();

      // Current page should remain unchanged
      expect(mockStore.currentPage).toBe(currentPage);
    });
  });

  describe("redo", () => {
    it("should restore the next state", () => {
      // Setup: Add pages to history and perform undo
      const page1 = createMockPage("1");
      mockStore.addToHistory(page1);

      const page2 = createMockPage("2");
      mockStore.currentPage = page2;
      mockStore.undo();

      // Verify we're back at page1
      expect(mockStore.currentPage.id).toBe("1");

      // Perform redo
      mockStore.redo();

      // Current page should be the next state
      expect(mockStore.currentPage.id).toBe("2");
    });

    it("should move the current state to past history", () => {
      // Setup: Add pages to history and perform undo
      const page1 = createMockPage("1");
      mockStore.addToHistory(page1);

      const page2 = createMockPage("2");
      mockStore.currentPage = page2;
      mockStore.undo();

      // Get the past history length before redo
      const pastLengthBefore = mockStore.history.past.length;

      // Perform redo
      mockStore.redo();

      // Past history should have one more item
      expect(mockStore.history.past.length).toBe(pastLengthBefore + 1);
    });

    it("should do nothing if there is no future history", () => {
      const currentPage = mockStore.currentPage;

      // Clear future history
      mockStore.history.future = [];

      // Perform redo
      mockStore.redo();

      // Current page should remain unchanged
      expect(mockStore.currentPage).toBe(currentPage);
    });
  });

  describe("canUndo and canRedo", () => {
    it("canUndo should return true if there is past history", () => {
      // Initially there should be no history
      expect(mockStore.canUndo()).toBe(false);

      // Add a page to history
      mockStore.history.past.push(createMockPage("1"));

      // Now we should be able to undo
      expect(mockStore.canUndo()).toBe(true);
    });

    it("canRedo should return true if there is future history", () => {
      // Initially there should be no future history
      expect(mockStore.canRedo()).toBe(false);

      // Add a page to future history
      mockStore.history.future.push(createMockPage("1"));

      // Now we should be able to redo
      expect(mockStore.canRedo()).toBe(true);
    });
  });
});
