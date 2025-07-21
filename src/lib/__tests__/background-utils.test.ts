import { describe, it, expect } from "vitest";
import {
  getBackgroundStyle,
  generateGradientCSS,
  isValidHexColor,
  isValidGradient,
  getDirectionDegrees,
  getDirectionName,
  PRESET_GRADIENTS,
} from "../background-utils";

describe("Background Utilities", () => {
  describe("getBackgroundStyle", () => {
    it("returns solid color style for solid background type", () => {
      const theme = {
        backgroundType: "solid",
        backgroundColor: "#FF5733",
      };

      const style = getBackgroundStyle(theme);
      expect(style).toHaveProperty("backgroundColor", "#FF5733");
    });

    it("returns gradient style for gradient background type", () => {
      const theme = {
        backgroundType: "gradient",
        backgroundGradient: {
          type: "linear",
          direction: 90,
          colors: ["#FF5733", "#3366FF"],
        },
      };

      const style = getBackgroundStyle(theme);
      expect(style).toHaveProperty("background");
      expect(style.background).toContain("linear-gradient");
      expect(style.background).toContain("#FF5733");
      expect(style.background).toContain("#3366FF");
    });

    it("returns image style for image background type", () => {
      const theme = {
        backgroundType: "image",
        backgroundImage: {
          url: "https://example.com/image.jpg",
          blur: 0,
          position: "center",
          size: "cover",
        },
      };

      const style = getBackgroundStyle(theme);
      expect(style).toHaveProperty("backgroundImage");
      expect(style.backgroundImage).toContain("https://example.com/image.jpg");
      expect(style).toHaveProperty("backgroundSize", "cover");
      expect(style).toHaveProperty("backgroundPosition", "center");
    });

    it("applies blur effect to image background", () => {
      const theme = {
        backgroundType: "image",
        backgroundImage: {
          url: "https://example.com/image.jpg",
          blur: 5,
          position: "center",
          size: "cover",
        },
      };

      const style = getBackgroundStyle(theme);
      expect(style).toHaveProperty("filter");
      expect(style.filter).toContain("blur(5px)");
    });

    it("returns default style for unknown background type", () => {
      const theme = {
        backgroundType: "unknown",
      };

      const style = getBackgroundStyle(theme);
      expect(style).toHaveProperty("backgroundColor");
      expect(style.backgroundColor.toLowerCase()).toBe("#ffffff");
    });
  });

  describe("generateGradientCSS", () => {
    it("generates linear gradient CSS", () => {
      const css = generateGradientCSS("linear", ["#FF5733", "#3366FF"], 45);
      expect(css).toBe("linear-gradient(45deg, #FF5733, #3366FF)");
    });

    it("generates radial gradient CSS", () => {
      const css = generateGradientCSS("radial", ["#FF5733", "#3366FF"]);
      expect(css).toBe("radial-gradient(circle, #FF5733, #3366FF)");
    });

    it("uses default direction for linear gradient when not provided", () => {
      const css = generateGradientCSS("linear", ["#FF5733", "#3366FF"]);
      expect(css).toBe("linear-gradient(90deg, #FF5733, #3366FF)");
    });
  });

  describe("isValidHexColor", () => {
    it("validates correct hex colors", () => {
      expect(isValidHexColor("#FF5733")).toBe(true);
      expect(isValidHexColor("#123")).toBe(true);
      expect(isValidHexColor("#FFFFFF")).toBe(true);
    });

    it("rejects invalid hex colors", () => {
      expect(isValidHexColor("FF5733")).toBe(false); // Missing #
      expect(isValidHexColor("#FF573")).toBe(false); // Wrong length
      expect(isValidHexColor("#FFZZTT")).toBe(false); // Invalid characters
      expect(isValidHexColor("red")).toBe(false); // Not hex
    });
  });

  describe("isValidGradient", () => {
    it("validates correct gradient configurations", () => {
      const validGradient = {
        type: "linear",
        direction: 90,
        colors: ["#FF5733", "#3366FF"],
      };

      expect(isValidGradient(validGradient)).toBe(true);
    });

    it("rejects invalid gradient types", () => {
      const invalidTypeGradient = {
        type: "diagonal",
        direction: 90,
        colors: ["#FF5733", "#3366FF"],
      };

      expect(isValidGradient(invalidTypeGradient)).toBe(false);
    });

    it("rejects invalid color formats", () => {
      const invalidColorsGradient = {
        type: "linear",
        direction: 90,
        colors: ["FF5733", "#3366FF"], // First color missing #
      };

      expect(isValidGradient(invalidColorsGradient)).toBe(false);
    });

    it("rejects invalid direction values", () => {
      const invalidDirectionGradient = {
        type: "linear",
        direction: 400, // Out of 0-360 range
        colors: ["#FF5733", "#3366FF"],
      };

      expect(isValidGradient(invalidDirectionGradient)).toBe(false);
    });
  });

  describe("Direction utilities", () => {
    it("converts direction name to degrees", () => {
      expect(getDirectionDegrees("to-right")).toBe(90);
      expect(getDirectionDegrees("to-bottom")).toBe(180);
      expect(getDirectionDegrees("to-top-right")).toBe(45);
    });

    it("finds closest direction name from degrees", () => {
      expect(getDirectionName(90)).toBe("to-right");
      expect(getDirectionName(182)).toBe("to-bottom"); // Close to 180
      expect(getDirectionName(44)).toBe("to-top-right"); // Close to 45
    });
  });

  describe("Preset gradients", () => {
    it("has the expected number of preset gradients", () => {
      expect(PRESET_GRADIENTS.length).toBeGreaterThan(0);
    });

    it("each preset has required properties", () => {
      PRESET_GRADIENTS.forEach((preset) => {
        expect(preset).toHaveProperty("name");
        expect(preset).toHaveProperty("colors");
        expect(preset).toHaveProperty("direction");
        expect(preset).toHaveProperty("type");
        expect(preset.colors.length).toBe(2);
      });
    });
  });
});
