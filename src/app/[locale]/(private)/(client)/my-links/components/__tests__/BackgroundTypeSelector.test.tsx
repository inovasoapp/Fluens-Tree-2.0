import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackgroundTypeSelector } from "../BackgroundTypeSelector";

describe("BackgroundTypeSelector", () => {
  const mockOnTypeChange = vi.fn();

  it("renders all background type options", () => {
    render(
      <BackgroundTypeSelector
        selectedType="solid"
        onTypeChange={mockOnTypeChange}
      />
    );

    expect(screen.getByText(/Cor/i)).toBeInTheDocument();
    expect(screen.getByText(/Gradiente/i)).toBeInTheDocument();
    expect(screen.getByText(/Imagem/i)).toBeInTheDocument();
  });

  it("highlights the selected type", () => {
    render(
      <BackgroundTypeSelector
        selectedType="gradient"
        onTypeChange={mockOnTypeChange}
      />
    );

    const gradientTab = screen.getByText(/Gradiente/i).closest("button");
    expect(gradientTab).toHaveClass("bg-background"); // Class used for selected tab
  });

  it("calls onTypeChange when a different type is selected", () => {
    render(
      <BackgroundTypeSelector
        selectedType="solid"
        onTypeChange={mockOnTypeChange}
      />
    );

    const imageTab = screen.getByText(/Imagem/i).closest("button");
    fireEvent.click(imageTab!);

    expect(mockOnTypeChange).toHaveBeenCalledWith("image");
  });

  it("still calls onTypeChange when the current type is selected", () => {
    render(
      <BackgroundTypeSelector
        selectedType="solid"
        onTypeChange={mockOnTypeChange}
      />
    );

    const solidTab = screen.getByText(/Cor/i).closest("button");
    fireEvent.click(solidTab!);

    // The component doesn't prevent clicking the same tab
    expect(mockOnTypeChange).toHaveBeenCalledWith("solid");
  });
});
