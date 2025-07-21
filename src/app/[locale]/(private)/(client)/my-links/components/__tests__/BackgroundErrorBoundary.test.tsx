import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { BackgroundErrorBoundary } from "../BackgroundErrorBoundary";

// Create a component that throws an error
const ErrorComponent = () => {
  throw new Error("Test error");
};

// Suppress console.error for cleaner test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("BackgroundErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <BackgroundErrorBoundary>
        <div data-testid="child">Test Child</div>
      </BackgroundErrorBoundary>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders fallback UI when an error occurs", () => {
    // We need to mock the console.error to prevent test output noise
    const spy = vi.spyOn(console, "error");
    spy.mockImplementation(() => {});

    render(
      <BackgroundErrorBoundary>
        <ErrorComponent />
      </BackgroundErrorBoundary>
    );

    // Check for error message in the fallback UI
    expect(screen.getByText(/Algo deu errado/i)).toBeInTheDocument();
    expect(screen.getByText(/Tentar novamente/i)).toBeInTheDocument();

    spy.mockRestore();
  });
});
