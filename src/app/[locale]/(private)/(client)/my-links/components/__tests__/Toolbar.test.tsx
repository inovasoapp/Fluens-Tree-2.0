import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toolbar } from "../Toolbar";
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
  updatePageTheme: vi.fn(),
  canvasPosition: { x: 0, y: 0, scale: 1 },
  setCanvasPosition: vi.fn(),
  centerCanvas: vi.fn(),
  isCanvasDragging: false,
  undo: vi.fn(),
  redo: vi.fn(),
  canUndo: vi.fn(),
  canRedo: vi.fn(),
};

// Mock the zustand implementation
vi.mock("@/stores/bio-builder-store", () => ({
  useBioBuilderStore: vi.fn(() => mockStore),
}));

// Mock the lucide-react icons
vi.mock("lucide-react", () => ({
  Save: () => <div data-testid="save-icon">Save</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  Smartphone: () => <div data-testid="smartphone-icon">Smartphone</div>,
  Monitor: () => <div data-testid="monitor-icon">Monitor</div>,
  Undo: () => <div data-testid="undo-icon">Undo</div>,
  Redo: () => <div data-testid="redo-icon">Redo</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Share: () => <div data-testid="share-icon">Share</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  RotateCcw: () => <div data-testid="rotate-ccw-icon">RotateCcw</div>,
  ZoomIn: () => <div data-testid="zoom-in-icon">ZoomIn</div>,
  ZoomOut: () => <div data-testid="zoom-out-icon">ZoomOut</div>,
  Move: () => <div data-testid="move-icon">Move</div>,
}));

describe("Toolbar Component", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    mockStore.canUndo.mockReturnValue(false);
    mockStore.canRedo.mockReturnValue(false);
  });

  it("should render the toolbar with undo/redo buttons", () => {
    render(<Toolbar />);

    // Check if undo and redo buttons are rendered
    expect(screen.getByTestId("undo-icon")).toBeInTheDocument();
    expect(screen.getByTestId("redo-icon")).toBeInTheDocument();
  });

  it("should disable the undo button when canUndo returns false", () => {
    mockStore.canUndo.mockReturnValue(false);

    render(<Toolbar />);

    // Find the undo button
    const undoButton = screen.getByTestId("undo-icon").closest("button");

    // Check if the button is disabled
    expect(undoButton).toBeDisabled();
  });

  it("should enable the undo button when canUndo returns true", () => {
    mockStore.canUndo.mockReturnValue(true);

    render(<Toolbar />);

    // Find the undo button
    const undoButton = screen.getByTestId("undo-icon").closest("button");

    // Check if the button is enabled
    expect(undoButton).not.toBeDisabled();
  });

  it("should disable the redo button when canRedo returns false", () => {
    mockStore.canRedo.mockReturnValue(false);

    render(<Toolbar />);

    // Find the redo button
    const redoButton = screen.getByTestId("redo-icon").closest("button");

    // Check if the button is disabled
    expect(redoButton).toBeDisabled();
  });

  it("should enable the redo button when canRedo returns true", () => {
    mockStore.canRedo.mockReturnValue(true);

    render(<Toolbar />);

    // Find the redo button
    const redoButton = screen.getByTestId("redo-icon").closest("button");

    // Check if the button is enabled
    expect(redoButton).not.toBeDisabled();
  });

  it("should call undo function when undo button is clicked", () => {
    mockStore.canUndo.mockReturnValue(true);

    render(<Toolbar />);

    // Find the undo button
    const undoButton = screen.getByTestId("undo-icon").closest("button");

    // Click the button
    fireEvent.click(undoButton!);

    // Check if the undo function was called
    expect(mockStore.undo).toHaveBeenCalledTimes(1);
  });

  it("should call redo function when redo button is clicked", () => {
    mockStore.canRedo.mockReturnValue(true);

    render(<Toolbar />);

    // Find the redo button
    const redoButton = screen.getByTestId("redo-icon").closest("button");

    // Click the button
    fireEvent.click(redoButton!);

    // Check if the redo function was called
    expect(mockStore.redo).toHaveBeenCalledTimes(1);
  });

  it("should not call undo function when disabled undo button is clicked", () => {
    mockStore.canUndo.mockReturnValue(false);

    render(<Toolbar />);

    // Find the undo button
    const undoButton = screen.getByTestId("undo-icon").closest("button");

    // Try to click the button (should be disabled)
    fireEvent.click(undoButton!);

    // Check that the undo function was not called
    expect(mockStore.undo).not.toHaveBeenCalled();
  });

  it("should not call redo function when disabled redo button is clicked", () => {
    mockStore.canRedo.mockReturnValue(false);

    render(<Toolbar />);

    // Find the redo button
    const redoButton = screen.getByTestId("redo-icon").closest("button");

    // Try to click the button (should be disabled)
    fireEvent.click(redoButton!);

    // Check that the redo function was not called
    expect(mockStore.redo).not.toHaveBeenCalled();
  });

  it("should display tooltips for undo and redo buttons", () => {
    render(<Toolbar />);

    // Find the undo button
    const undoButton = screen.getByTestId("undo-icon").closest("button");

    // Check if the button has a title attribute (tooltip)
    expect(undoButton).toHaveAttribute("title", "Desfazer última ação");

    // Find the redo button
    const redoButton = screen.getByTestId("redo-icon").closest("button");

    // Check if the button has a title attribute (tooltip)
    expect(redoButton).toHaveAttribute("title", "Refazer última ação");
  });
});
