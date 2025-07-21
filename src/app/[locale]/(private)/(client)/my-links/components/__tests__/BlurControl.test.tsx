import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlurControl } from "../BlurControl";

describe("BlurControl", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockReset();
  });

  it("renders with the blur intensity label", () => {
    render(<BlurControl value={5} onChange={mockOnChange} />);

    expect(screen.getByText(/Intensidade do Blur/i)).toBeInTheDocument();
  });

  it("displays the current blur value", () => {
    render(<BlurControl value={5} onChange={mockOnChange} />);

    // Check for the blur value display
    expect(screen.getByText(/Máximo/i)).toBeInTheDocument();
  });

  it("shows preset blur options", () => {
    render(<BlurControl value={5} onChange={mockOnChange} />);

    // Check for preset buttons
    expect(screen.getByText(/Presets Rápidos/i)).toBeInTheDocument();
    expect(screen.getByText(/Nenhum/i)).toBeInTheDocument();
    expect(screen.getByText(/Leve/i)).toBeInTheDocument();
    expect(screen.getByText(/Médio/i)).toBeInTheDocument();
    expect(screen.getByText(/Intenso/i)).toBeInTheDocument();
    expect(screen.getByText(/Máximo/i)).toBeInTheDocument();
  });

  it("calls onChange when a preset is clicked", () => {
    render(<BlurControl value={5} onChange={mockOnChange} />);

    // Click on a preset button
    const presetButton = screen.getByText(/Nenhum/i);
    fireEvent.click(presetButton);

    expect(mockOnChange).toHaveBeenCalled();
  });
});
