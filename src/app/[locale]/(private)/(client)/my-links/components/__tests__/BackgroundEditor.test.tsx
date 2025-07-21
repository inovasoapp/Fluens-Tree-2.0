import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackgroundEditor } from "../BackgroundEditor";

describe("BackgroundEditor", () => {
  const mockOnThemeUpdate = vi.fn();
  const defaultTheme = {
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
  };

  beforeEach(() => {
    mockOnThemeUpdate.mockReset();
  });

  it("renders with the type selector", () => {
    render(
      <BackgroundEditor
        theme={defaultTheme}
        onThemeUpdate={mockOnThemeUpdate}
      />
    );

    expect(screen.getByText(/Cor/i)).toBeInTheDocument();
    expect(screen.getByText(/Gradiente/i)).toBeInTheDocument();
    expect(screen.getByText(/Imagem/i)).toBeInTheDocument();
  });

  it("renders solid color editor when solid type is selected", () => {
    render(
      <BackgroundEditor
        theme={{ ...defaultTheme, backgroundType: "solid" }}
        onThemeUpdate={mockOnThemeUpdate}
      />
    );

    expect(screen.getByText(/Cor Personalizada/i)).toBeInTheDocument();
    expect(screen.getByText(/Cores Predefinidas/i)).toBeInTheDocument();
  });

  it("renders gradient editor when gradient type is selected", () => {
    render(
      <BackgroundEditor
        theme={{ ...defaultTheme, backgroundType: "gradient" }}
        onThemeUpdate={mockOnThemeUpdate}
      />
    );

    // Check for gradient-specific elements
    expect(screen.getByText(/Gradientes Predefinidos/i)).toBeInTheDocument();
  });

  it("renders image uploader when image type is selected", () => {
    render(
      <BackgroundEditor
        theme={{ ...defaultTheme, backgroundType: "image" }}
        onThemeUpdate={mockOnThemeUpdate}
      />
    );

    // Check for image-specific elements
    expect(screen.getByText(/Imagem de Fundo/i)).toBeInTheDocument();
  });

  it("changes background type when type selector is clicked", () => {
    render(
      <BackgroundEditor
        theme={{ ...defaultTheme, backgroundType: "solid" }}
        onThemeUpdate={mockOnThemeUpdate}
      />
    );

    // Click on gradient tab
    const gradientTab = screen.getByText(/Gradiente/i);
    fireEvent.click(gradientTab);

    expect(mockOnThemeUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ backgroundType: "gradient" })
    );
  });

  it("updates solid color when color picker changes", () => {
    render(
      <BackgroundEditor
        theme={{ ...defaultTheme, backgroundType: "solid" }}
        onThemeUpdate={mockOnThemeUpdate}
      />
    );

    // Find color input and change it
    const colorInput = screen.getByDisplayValue("#FFFFFF");
    fireEvent.change(colorInput, { target: { value: "#FF0000" } });

    expect(mockOnThemeUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ backgroundColor: "#FF0000" })
    );
  });
});
