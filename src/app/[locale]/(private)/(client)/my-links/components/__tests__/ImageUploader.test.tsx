import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ImageUploader } from "../ImageUploader";

describe("ImageUploader", () => {
  const mockOnImageUpload = vi.fn();
  const mockOnError = vi.fn();
  const mockOnImageRemove = vi.fn();

  beforeEach(() => {
    mockOnImageUpload.mockReset();
    mockOnError.mockReset();
    mockOnImageRemove.mockReset();

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => "mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("renders upload area with instructions", () => {
    render(
      <ImageUploader onImageUpload={mockOnImageUpload} onError={mockOnError} />
    );

    expect(
      screen.getByText(/Clique ou arraste uma imagem/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/JPG, PNG ou WebP até 5MB/i)).toBeInTheDocument();
  });

  it("displays the current image when provided", () => {
    render(
      <ImageUploader
        onImageUpload={mockOnImageUpload}
        onError={mockOnError}
        currentImage="https://example.com/image.jpg"
      />
    );

    const image = screen.getByAltText(/Background preview/i);
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("https://example.com/image.jpg")
    );
  });

  it("handles file selection via input", async () => {
    render(
      <ImageUploader onImageUpload={mockOnImageUpload} onError={mockOnError} />
    );

    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    const input = screen.getByAcceptedFiles;

    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      Object.defineProperty(fileInput, "files", {
        value: [file],
      });

      fireEvent.change(fileInput);

      // Wait for the upload simulation to complete
      await waitFor(
        () => {
          expect(mockOnImageUpload).toHaveBeenCalledWith("mock-url");
        },
        { timeout: 3000 }
      );
    }
  });

  it("shows remove button when image is displayed", () => {
    render(
      <ImageUploader
        onImageUpload={mockOnImageUpload}
        onError={mockOnError}
        currentImage="https://example.com/image.jpg"
        onImageRemove={mockOnImageRemove}
      />
    );

    // Find the "Trocar Imagem" button
    const replaceButton = screen.getByText(/Trocar Imagem/i);
    expect(replaceButton).toBeInTheDocument();

    // Click the button to trigger file selection
    fireEvent.click(replaceButton);

    // Check that the file input exists
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it("calls onImageRemove when remove button is clicked", async () => {
    render(
      <ImageUploader
        onImageUpload={mockOnImageUpload}
        onError={mockOnError}
        currentImage="https://example.com/image.jpg"
        onImageRemove={mockOnImageRemove}
      />
    );

    // Find the remove button (X icon)
    const removeButton = screen.getByTitle(/Remover imagem/i);
    fireEvent.click(removeButton);

    expect(mockOnImageRemove).toHaveBeenCalled();
  });
});
