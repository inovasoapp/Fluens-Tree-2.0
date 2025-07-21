import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GradientEditor from "../GradientEditor";

describe("GradientEditor", () => {
  const mockOnChange = vi.fn();
  const defaultGradient = {
    type: "linear",
    direction: 90,
    colors: ["#FF5733", "#3366FF"],
  };

  beforeEach(() => {
    mockOnChange.mockReset();
  });

  it("renders with the provided gradient value", () => {
    render(<GradientEditor value={defaultGradient} onChange={mockOnChange} />);

    // Check if color pickers have the correct values
    const colorPickers = screen.getAllByLabelText(/color/i);
    expect(colorPickers[0]).toHaveValue("#FF5733");
    expect(colorPickers[1]).toHaveValue("#3366FF");

    // Check if direction control is set correctly
    const directionControl = screen.getByLabelText(/direction/i);
    expect(directionControl).toHaveValue("90");
  });

  it("calls onChange when gradient colors are changed", () => {
    render(<GradientEditor value={defaultGradient} onChange={mockOnChange} />);

    const colorPickers = screen.getAllByLabelText(/color/i);
    fireEvent.change(colorPickers[0], { target: { value: "#00FF00" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultGradient,
      colors: ["#00FF00", "#3366FF"],
    });
  });

  it("calls onChange when gradient direction is changed", () => {
    render(<GradientEditor value={defaultGradient} onChange={mockOnChange} />);

    const directionControl = screen.getByLabelText(/direction/i);
    fireEvent.change(directionControl, { target: { value: "45" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultGradient,
      direction: 45,
    });
  });

  it("renders preset gradients", () => {
    render(<GradientEditor value={defaultGradient} onChange={mockOnChange} />);

    const presetSection = screen.getByText(/presets/i);
    expect(presetSection).toBeInTheDocument();

    // Assuming there are gradient preset buttons with data-testid="gradient-preset"
    const presetButtons = screen.getAllByTestId("gradient-preset");
    expect(presetButtons.length).toBeGreaterThan(0);
  });

  it("selects a preset gradient when clicked", () => {
    render(<GradientEditor value={defaultGradient} onChange={mockOnChange} />);

    const presetButtons = screen.getAllByTestId("gradient-preset");
    fireEvent.click(presetButtons[0]);

    // Verify onChange was called with the preset gradient
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("toggles between linear and radial gradient types", () => {
    render(<GradientEditor value={defaultGradient} onChange={mockOnChange} />);

    const typeToggle = screen.getByLabelText(/gradient type/i);
    fireEvent.click(typeToggle);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultGradient,
      type: "radial",
    });
  });
});
