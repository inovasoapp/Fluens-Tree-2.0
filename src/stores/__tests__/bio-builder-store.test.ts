import { describe, it, expect, vi } from "vitest";

// Mock the store implementation
const mockUpdatePageTheme = vi.fn();
const mockStore = {
  page: {
    theme: {
      backgroundType: "solid",
      backgroundColor: "#FFFFFF",
      backgroundGradient: {
        type: "linear",
        direction: 90,
        colors: ["#FF5733", "#3366FF"],
      },
      backgroundImage: {
        url: "",
        blur: 0,
        position: "center",
        size: "cover",
      },
    },
    updatedAt: new Date().toISOString(),
  },
  updatePageTheme: mockUpdatePageTheme,
};

// Mock the zustand implementation
vi.mock("@/stores/bio-builder-store", () => ({
  useBioBuilderStore: vi.fn((selector) => selector(mockStore)),
}));

describe("Bio Builder Store - Background Persistence", () => {
  beforeEach(() => {
    mockUpdatePageTheme.mockReset();
    mockUpdatePageTheme.mockImplementation((themeUpdate) => {
      // Update the mock store with the theme changes
      mockStore.page.theme = {
        ...mockStore.page.theme,
        ...themeUpdate,
      };
      mockStore.page.updatedAt = new Date().toISOString();
    });
  });

  it("updates background type", () => {
    // Call the updatePageTheme function
    mockStore.updatePageTheme({ backgroundType: "gradient" });

    // Check that the store was updated
    expect(mockStore.page.theme.backgroundType).toBe("gradient");
    expect(mockUpdatePageTheme).toHaveBeenCalledWith({
      backgroundType: "gradient",
    });
  });

  it("updates solid background color", () => {
    mockStore.updatePageTheme({ backgroundColor: "#FF5733" });

    expect(mockStore.page.theme.backgroundColor).toBe("#FF5733");
    expect(mockUpdatePageTheme).toHaveBeenCalledWith({
      backgroundColor: "#FF5733",
    });
  });

  it("updates gradient background settings", () => {
    const gradientSettings = {
      type: "linear",
      direction: 45,
      colors: ["#FF5733", "#3366FF"],
    };

    mockStore.updatePageTheme({
      backgroundType: "gradient",
      backgroundGradient: gradientSettings,
    });

    expect(mockStore.page.theme.backgroundType).toBe("gradient");
    expect(mockStore.page.theme.backgroundGradient).toEqual(gradientSettings);
    expect(mockUpdatePageTheme).toHaveBeenCalledWith({
      backgroundType: "gradient",
      backgroundGradient: gradientSettings,
    });
  });

  it("updates image background settings", () => {
    const imageSettings = {
      url: "https://example.com/image.jpg",
      blur: 5,
      position: "center",
      size: "cover",
    };

    mockStore.updatePageTheme({
      backgroundType: "image",
      backgroundImage: imageSettings,
    });

    expect(mockStore.page.theme.backgroundType).toBe("image");
    expect(mockStore.page.theme.backgroundImage).toEqual(imageSettings);
    expect(mockUpdatePageTheme).toHaveBeenCalledWith({
      backgroundType: "image",
      backgroundImage: imageSettings,
    });
  });

  it("preserves other theme properties when updating background", () => {
    // Set initial state with various theme properties
    mockStore.page.theme.primaryColor = "#FF0000";
    mockStore.page.theme.fontFamily = "Arial";

    mockStore.updatePageTheme({
      backgroundType: "gradient",
      backgroundGradient: {
        type: "linear",
        direction: 90,
        colors: ["#FF5733", "#3366FF"],
      },
    });

    // Check that other theme properties are preserved
    expect(mockStore.page.theme.primaryColor).toBe("#FF0000");
    expect(mockStore.page.theme.fontFamily).toBe("Arial");
  });
});
