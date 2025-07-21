import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Canvas } from "../Canvas";

// Mock the bio-builder-store
vi.mock("@/stores/bio-builder-store", () => ({
  useBioBuilderStore: (selector) => {
    // Mock store state
    const state = {
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
        elements: [],
      },
    };

    // Call the selector with our mock state
    return selector(state);
  },
}));

describe("Canvas", () => {
  it("renders the canvas component", () => {
    // Mock implementation to avoid errors
    Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        width: 100,
        height: 100,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      }),
    });

    const { container } = render(<Canvas />);

    // Check that the canvas container is rendered
    expect(container.querySelector(".canvas-container")).not.toBeNull();
  });
});
