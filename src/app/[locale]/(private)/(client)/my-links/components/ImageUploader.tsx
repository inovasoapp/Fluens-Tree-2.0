"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, AlertCircle, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  onImageRemove?: () => void;
  onError?: (errorMessage: string) => void;
}

interface UploadError {
  type: "upload" | "format" | "size" | "network";
  message: string;
  recoverable: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ImageUploader({
  onImageUpload,
  currentImage,
  onImageRemove,
  onError,
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<UploadError | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImage || null
  );
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  // Add state to track if component is mounted
  const [isMounted, setIsMounted] = useState(true);

  // Use ref for tracking mounted state to avoid closure issues in async callbacks
  const isMountedRef = useRef(true);

  // Set up effect to track component mounting state
  useEffect(() => {
    // Set mounted state to true when component mounts
    setIsMounted(true);
    isMountedRef.current = true;

    // Clean up function to set mounted state to false when component unmounts
    return () => {
      setIsMounted(false);
      isMountedRef.current = false;
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced validation function that handles async validation
  const validateFileAsync = async (file: File): Promise<UploadError | null> => {
    // Basic synchronous checks first
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return {
        type: "format",
        message:
          "Formato não suportado. Use JPG, PNG ou WebP. O tipo de fundo 'imagem' será mantido para você tentar novamente.",
        recoverable: true,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        type: "size",
        message:
          "Arquivo muito grande. Máximo 5MB. O tipo de fundo 'imagem' será mantido para você tentar novamente com um arquivo menor.",
        recoverable: true,
      };
    }

    // Asynchronous image validation
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        // Check minimum dimensions
        if (img.width < 100 || img.height < 100) {
          resolve({
            type: "format",
            message:
              "Imagem muito pequena. Mínimo 100x100 pixels. O tipo de fundo 'imagem' será mantido para você tentar novamente.",
            recoverable: true,
          });
        } else if (img.width > 4000 || img.height > 4000) {
          // Check maximum dimensions for performance
          resolve({
            type: "size",
            message:
              "Imagem muito grande. Máximo 4000x4000 pixels. O tipo de fundo 'imagem' será mantido para você tentar novamente com uma imagem menor.",
            recoverable: true,
          });
        } else {
          resolve(null);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          type: "format",
          message:
            "Arquivo corrompido ou não é uma imagem válida. O tipo de fundo 'imagem' será mantido para você tentar novamente.",
          recoverable: true,
        });
      };

      img.src = url;
    });
  };

  const simulateUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Create object URL for preview (in real app, this would be the uploaded URL)
          const url = URL.createObjectURL(file);
          resolve(url);
        }
        setUploadProgress(Math.min(progress, 100));
      }, 200);

      // Simulate potential network error (5% chance)
      if (Math.random() < 0.05) {
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error("Network error"));
        }, 1000);
      }
    });
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      // Log the start of the upload process for debugging
      console.log("Starting image upload process");

      // Only update state if component is still mounted
      if (!isMountedRef.current) {
        console.log("Component unmounted, aborting upload");
        return;
      }

      setError(null);
      setImageLoadError(false);

      const validationError = await validateFileAsync(file);
      if (validationError) {
        // Check if component is still mounted before updating state
        if (isMountedRef.current) {
          setError(validationError);
          onError?.(validationError.message);
        }
        return;
      }

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const imageUrl = await simulateUpload(file);

        // Check if component is still mounted before updating state
        if (isMountedRef.current) {
          console.log(
            "Upload successful, updating preview and notifying parent"
          );
          setPreviewUrl(imageUrl);
          setRetryCount(0); // Reset retry count on successful upload

          // Notify parent component about the successful upload
          // This will trigger the BackgroundEditor's handleImageUpload
          onImageUpload(imageUrl);
        } else {
          console.log("Component unmounted during upload, cleanup needed");
          // If component unmounted during upload, we should clean up the blob URL
          if (imageUrl.startsWith("blob:")) {
            URL.revokeObjectURL(imageUrl);
          }
        }
      } catch (err) {
        // Check if component is still mounted before updating state
        if (isMountedRef.current) {
          console.log("Upload failed:", err);
          const errorMessage = "Erro ao fazer upload. Tente novamente.";
          setError({
            type: "network",
            message: errorMessage,
            recoverable: true,
          });
          onError?.(errorMessage);
        }
      } finally {
        // Check if component is still mounted before updating state
        if (isMountedRef.current) {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }
    },
    [onImageUpload, onError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleRemoveImage = useCallback(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    setImageLoadError(false);
    setRetryCount(0);
    onImageRemove?.();

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl, onImageRemove]);

  // Handle image load errors with fallback
  const handleImageError = useCallback(() => {
    setImageLoadError(true);

    if (retryCount < 2) {
      // Try to reload the image up to 2 times
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setImageLoadError(false);
      }, 1000);
    } else {
      // After 2 retries, show error and fallback
      setError({
        type: "network",
        message: "Erro ao carregar imagem. Verifique sua conexão.",
        recoverable: true,
      });
    }
  }, [retryCount]);

  // Handle successful image load
  const handleImageLoad = useCallback(() => {
    setImageLoadError(false);
    setRetryCount(0);
  }, []);

  // Retry loading current image
  const retryImageLoad = useCallback(() => {
    if (previewUrl) {
      setImageLoadError(false);
      setError(null);
      setRetryCount((prev) => prev + 1);
    }
  }, [previewUrl]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground">
        Imagem de Fundo
      </label>

      {/* Current Image Preview */}
      {previewUrl && !isUploading && (
        <div className="relative">
          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
            {imageLoadError ? (
              // Fallback UI when image fails to load
              <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground text-center px-2">
                  Erro ao carregar imagem
                </span>
                <button
                  onClick={retryImageLoad}
                  className="text-xs text-primary hover:text-primary/80 underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <img
                src={`${previewUrl}?retry=${retryCount}`}
                alt="Background preview"
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            )}

            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={handleRemoveImage}
                className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                title="Remover imagem"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image Load Status */}
          {imageLoadError && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3" />
              <span>Tentativa {retryCount + 1} de 3</span>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={cn(
            "relative w-full h-32 border-2 border-dashed rounded-lg transition-all cursor-pointer",
            "flex flex-col items-center justify-center gap-2",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            isUploading && "pointer-events-none"
          )}
        >
          {isUploading ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Fazendo upload...
                </span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Clique ou arraste uma imagem
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG ou WebP até 5MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Replace Image Button */}
      {previewUrl && !isUploading && (
        <button
          onClick={openFileDialog}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-md border border-border bg-background",
            "hover:bg-muted transition-colors",
            "flex items-center justify-center gap-2"
          )}
        >
          <ImageIcon className="w-4 h-4" />
          Trocar Imagem
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">
              Erro no upload
            </p>
            <p className="text-xs text-destructive/80 mt-1">{error.message}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-2 py-1 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded transition-colors"
              >
                Tentar novamente
              </button>
              <span className="text-xs text-destructive/70">
                O tipo de fundo "imagem" será mantido
              </span>
            </div>
          </div>
          {error.recoverable && (
            <button
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
