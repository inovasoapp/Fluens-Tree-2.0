"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackgroundErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface BackgroundErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  section?: string;
}

export class BackgroundErrorBoundary extends Component<
  BackgroundErrorBoundaryProps,
  BackgroundErrorBoundaryState
> {
  constructor(props: BackgroundErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): BackgroundErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("BackgroundErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log error details for debugging
    console.group("Background Editor Error Details");
    console.error("Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("Error Boundary Section:", this.props.section || "Unknown");
    console.groupEnd();
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Erro no Editor de Fundo
              </h3>
              <p className="text-sm text-muted-foreground">
                {this.props.section
                  ? `Ocorreu um erro na seção "${this.props.section}" do editor de fundo.`
                  : "Ocorreu um erro inesperado no editor de fundo."}
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 p-3 bg-muted rounded text-left">
                  <summary className="cursor-pointer text-sm font-medium">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="mt-2 space-y-2 text-xs">
                    <div>
                      <strong>Erro:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 overflow-auto text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 overflow-auto text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm rounded-md",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "transition-colors"
                )}
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </button>

              <button
                onClick={this.handleReload}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm rounded-md",
                  "border border-border bg-background hover:bg-muted",
                  "transition-colors"
                )}
              >
                <Home className="w-4 h-4" />
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useBackgroundErrorHandler() {
  const handleError = React.useCallback((error: Error, section?: string) => {
    console.error(
      `Background Editor Error in ${section || "unknown section"}:`,
      error
    );

    // You could integrate with error reporting service here
    // Example: Sentry.captureException(error, { tags: { section } });
  }, []);

  return { handleError };
}
