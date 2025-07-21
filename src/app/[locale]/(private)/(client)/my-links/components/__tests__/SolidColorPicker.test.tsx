import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SolidColorPicker } from "../SolidColorPicker";

describe("SolidColorPicker", () => {
  const mockOnColorChange = vi.fn();

  it("renders with the provided color value", () => {
    render(
      <SolidColorPicker color="#FF5733" onColorChange={mockOnColorChange} />
    );

    // Check for the label
    expect(screen.getByText(/Cor Personalizada/i)).toBeInTheDocument();

    // Check for the color inputs
    const colorInputs = screen.getAllByDisplayValue("#FF5733");
    expect(colorInputs.length).toBeGreaterThan(0);
  });

  it("calls onColorChange when color is changed", () => {
    render(
      <SolidColorPicker color="#FF5733" onColorChange={mockOnColorChange} />
    );

    const colorInput = screen.getAllByDisplayValue("#FF5733")[0];
    fireEvent.change(colorInput, { target: { value: "#3366FF" } });

    expect(mockOnColorChange).toHaveBeenCalledWith("#3366FF");
  });

  it("displays color preview with the selected color", () => {
    render(
      <SolidColorPicker color="#FF5733" onColorChange={mockOnColorChange} />
    );

    // Find the color preview div
    const colorPreview = screen
      .getByText(/Cor Personalizada/i)
      .parentElement?.querySelector(".w-10.h-10");

    expect(colorPreview).toHaveStyle("background-color: #FF5733");
  });

  it("renders preset colors", () => {
    render(
      <SolidColorPicker color="#FF5733" onColorChange={mockOnColorChange} />
    );

    const presetSection = screen.getByText(/Cores Predefinidas/i);
    expect(presetSection).toBeInTheDocument();

    // Check that preset buttons are rendered
    const presetButtons = screen.getAllByRole("button");
    expect(presetButtons.length).toBeGreaterThan(10); // There should be many preset colors
  });

  it("selects a preset color when clicked", () => {
    render(
      <SolidColorPicker color="#FF5733" onColorChange={mockOnColorChange} />
    );

    // Find a preset color button (we'll use the first one)
    const presetButtons = screen.getAllByRole("button");
    fireEvent.click(presetButtons[0]); // Click the first preset

    expect(mockOnColorChange).toHaveBeenCalled();
  });
});
