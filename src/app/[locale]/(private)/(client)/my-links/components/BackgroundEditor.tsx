"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { BackgroundTypeSelector } from "./BackgroundTypeSelector";
import { SolidColorPicker } from "./SolidColorPicker";
import { GradientEditor } from "./GradientEditor";
import { ImageUploader } from "./ImageUploader";
import { BlurControl } from "./BlurControl";
import { BackgroundErrorBoundary } from "./BackgroundErrorBoundary";
import { useBioBuilderStore } from "@/stores/bio-builder-store";
import { BackgroundGradient, BackgroundImage } from "@/types/bio-builder";

interface BackgroundError {
  type: "upload" | "format" | "size" | "network" | "general";
  message: string;
  recoverable: boolean;
}

interface BackgroundEditorProps {
  className?: string;
}

export function BackgroundEditor({ className }: BackgroundEditorProps) {
  const {
    currentPage,
    updatePageTheme,
    updateBackgroundType,
    updateBackgroundGradient,
    updateBackgroundImage,
  } = useBioBuilderStore();

  // Local state for error handling and user feedback
  const [error, setError] = useState<BackgroundError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add local state to track the selected background type
  // This ensures we maintain the type even if the store gets updated elsewhere
  const [localBackgroundType, setLocalBackgroundType] = useState<
    "solid" | "gradient" | "image" | null
  >(null);

  // Get current theme values with fallbacks
  const theme = currentPage?.theme;
  // Use local background type if set, otherwise use the one from the theme
  const backgroundType =
    localBackgroundType || theme?.backgroundType || "solid";
  const backgroundColor = theme?.backgroundColor || "#ffffff";
  const backgroundGradient = theme?.backgroundGradient;
  const backgroundImage = theme?.backgroundImage;

  // Sync local background type with theme when theme changes
  useEffect(() => {
    if (theme?.backgroundType && !localBackgroundType) {
      setLocalBackgroundType(theme.backgroundType);
    }
  }, [theme?.backgroundType, localBackgroundType]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error && error.recoverable) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Error handling wrapper for operations
  const withErrorHandling = useCallback(
    async (operation: () => Promise<void> | void, operationName: string) => {
      try {
        setError(null);
        setIsProcessing(true);
        await operation();
        setSuccessMessage(`${operationName} aplicado com sucesso!`);
      } catch (err) {
        console.error(`Error in ${operationName}:`, err);
        setError({
          type: "general",
          message: `Erro ao aplicar ${operationName.toLowerCase()}. Tente novamente.`,
          recoverable: true,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Background type change handler
  const handleBackgroundTypeChange = useCallback(
    (newType: "solid" | "gradient" | "image") => {
      withErrorHandling(() => {
        // Log the type change for debugging
        console.log(
          `Changing background type from ${backgroundType} to ${newType}`
        );

        // IMPORTANT: Update our local state first to ensure UI consistency
        setLocalBackgroundType(newType);

        // Update the background type in the store
        updateBackgroundType(newType);

        // Set default values for new background types
        if (newType === "gradient" && !backgroundGradient) {
          updateBackgroundGradient({
            type: "linear",
            direction: 45,
            colors: ["#667eea", "#764ba2"],
          });
        }

        // For image type, we don't need to set a default image
        // But we should log that we're waiting for the user to upload one
        if (newType === "image") {
          console.log(
            "Image type selected, waiting for user to upload an image"
          );
          // Force the background type to "image" in our local state
          setLocalBackgroundType("image");
        }
      }, "Tipo de fundo");
    },
    [
      updateBackgroundType,
      updateBackgroundGradient,
      backgroundType,
      backgroundGradient,
      withErrorHandling,
    ]
  );

  // Solid color change handler
  const handleSolidColorChange = useCallback(
    (color: string) => {
      withErrorHandling(() => {
        updatePageTheme({ backgroundColor: color });
      }, "Cor de fundo");
    },
    [updatePageTheme, withErrorHandling]
  );

  // Gradient change handler
  const handleGradientChange = useCallback(
    (gradient: BackgroundGradient) => {
      withErrorHandling(() => {
        updateBackgroundGradient(gradient);
      }, "Gradiente");
    },
    [updateBackgroundGradient, withErrorHandling]
  );

  // Image upload handler
  const handleImageUpload = useCallback(
    (imageUrl: string) => {
      withErrorHandling(async () => {
        // Validate image URL
        if (!imageUrl || typeof imageUrl !== "string") {
          throw new Error("URL da imagem inválida");
        }

        // Log the current background type before making changes
        console.log(
          `Current background type before image upload: ${backgroundType}`
        );

        // IMPORTANT: Ensure our local state is set to "image" first
        setLocalBackgroundType("image");

        // First, ensure the background type is set to "image"
        // This is crucial to prevent any race conditions where the type might be reverted
        if (backgroundType !== "image") {
          console.log("Setting background type to image before updating image");
          updateBackgroundType("image");
        }

        // Create the new background image configuration
        const newBackgroundImage: BackgroundImage = {
          url: imageUrl,
          blur: 0,
          position: "center",
          size: "cover",
        };

        // Update the background image in the store
        // The updateBackgroundImage function will also set the type to "image"
        updateBackgroundImage(newBackgroundImage);

        // Log success for debugging
        console.log("Image upload successful, background type set to image");
      }, "Imagem de fundo");
    },
    [
      updateBackgroundImage,
      updateBackgroundType,
      backgroundType,
      withErrorHandling,
    ]
  );

  // Image remove handler
  const handleImageRemove = useCallback(() => {
    withErrorHandling(() => {
      // Update our local state first
      setLocalBackgroundType("solid");

      // Switch back to solid color when image is removed
      updateBackgroundType("solid");
    }, "Remoção da imagem");
  }, [updateBackgroundType, withErrorHandling]);

  // Blur change handler
  const handleBlurChange = useCallback(
    (blur: number) => {
      withErrorHandling(() => {
        if (!backgroundImage) return;

        const updatedImage: BackgroundImage = {
          ...backgroundImage,
          blur,
        };

        updateBackgroundImage(updatedImage);
      }, "Blur da imagem");
    },
    [backgroundImage, updateBackgroundImage, withErrorHandling]
  );

  // Handle image upload errors from ImageUploader component
  const handleImageUploadError = useCallback((errorMessage: string) => {
    setError({
      type: "upload",
      message: errorMessage,
      recoverable: true,
    });
  }, []);

  // Clear error handler
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear success message handler
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  if (!currentPage) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        Nenhuma página carregada
      </div>
    );
  }

  return (
    <BackgroundErrorBoundary section="Editor Principal">
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Editor de Fundo
          </h3>
          <p className="text-sm text-muted-foreground">
            Personalize o fundo do seu mockup com cores, gradientes ou imagens
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-destructive">
                Erro no Editor de Fundo
              </p>
              <p className="text-xs text-destructive/80">{error.message}</p>
              {backgroundType === "image" && (
                <p className="text-xs text-destructive/70 mt-1 italic">
                  O tipo de fundo "imagem" será mantido enquanto você resolve
                  este problema.
                </p>
              )}
            </div>
            <button
              onClick={clearError}
              className="text-destructive hover:text-destructive/80 transition-colors"
              title="Fechar erro"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
            <button
              onClick={clearSuccessMessage}
              className="text-green-600 hover:text-green-500 transition-colors"
              title="Fechar mensagem"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-blue-800">Processando...</span>
          </div>
        )}

        {/* Background Type Selector */}
        <BackgroundErrorBoundary section="Seletor de Tipo">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Tipo de Fundo
            </label>
            <BackgroundTypeSelector
              selectedType={backgroundType}
              onTypeChange={handleBackgroundTypeChange}
            />
            {/* Debug info - remove in production */}
            <div className="text-xs text-gray-400 mt-1">
              Tipo atual: {backgroundType} (local:{" "}
              {localBackgroundType || "não definido"})
            </div>
          </div>
        </BackgroundErrorBoundary>

        {/* Background Configuration */}
        <div className="space-y-4">
          {/* Force the image UI to be shown when localBackgroundType is "image", 
              regardless of what the store says */}
          {backgroundType === "solid" && localBackgroundType !== "image" && (
            <BackgroundErrorBoundary section="Cor Sólida">
              <SolidColorPicker
                color={backgroundColor}
                onColorChange={handleSolidColorChange}
              />
            </BackgroundErrorBoundary>
          )}

          {backgroundType === "gradient" && localBackgroundType !== "image" && (
            <BackgroundErrorBoundary section="Gradiente">
              <GradientEditor
                gradient={backgroundGradient}
                onGradientChange={handleGradientChange}
              />
            </BackgroundErrorBoundary>
          )}

          {/* Show image UI when either the store or local state says "image" */}
          {(backgroundType === "image" || localBackgroundType === "image") && (
            <div className="space-y-4">
              <BackgroundErrorBoundary section="Upload de Imagem">
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  currentImage={backgroundImage?.url}
                  onImageRemove={handleImageRemove}
                  onError={handleImageUploadError}
                />
              </BackgroundErrorBoundary>

              {/* Blur Control - only show when image is uploaded */}
              {backgroundImage?.url && (
                <BackgroundErrorBoundary section="Controle de Blur">
                  <BlurControl
                    blur={backgroundImage.blur}
                    onBlurChange={handleBlurChange}
                    previewImage={backgroundImage.url}
                  />
                </BackgroundErrorBoundary>
              )}
            </div>
          )}
        </div>

        {/* Current Settings Summary */}
        <BackgroundErrorBoundary section="Resumo de Configurações">
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Configuração Atual
            </h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>
                Tipo:{" "}
                {backgroundType === "solid"
                  ? "Cor Sólida"
                  : backgroundType === "gradient"
                  ? "Gradiente"
                  : "Imagem"}
              </div>

              {backgroundType === "solid" && (
                <div className="flex items-center gap-2">
                  Cor:
                  <div
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor }}
                  />
                  <span>{backgroundColor}</span>
                </div>
              )}

              {backgroundType === "gradient" && backgroundGradient && (
                <div>
                  Gradiente: {backgroundGradient.colors[0]} →{" "}
                  {backgroundGradient.colors[1]} ({backgroundGradient.direction}
                  °)
                </div>
              )}

              {backgroundType === "image" && backgroundImage && (
                <div className="space-y-1">
                  <div>
                    Imagem:{" "}
                    {backgroundImage.url.length > 50
                      ? `${backgroundImage.url.substring(0, 50)}...`
                      : backgroundImage.url}
                  </div>
                  <div>Blur: {backgroundImage.blur}px</div>
                  <div>Posição: {backgroundImage.position}</div>
                  <div>Tamanho: {backgroundImage.size}</div>
                </div>
              )}
            </div>
          </div>
        </BackgroundErrorBoundary>
      </div>
    </BackgroundErrorBoundary>
  );
}
