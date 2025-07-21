"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, RefreshCw } from "lucide-react";

interface BlurControlProps {
  blur: number;
  onBlurChange: (blur: number) => void;
  previewImage?: string;
}

const BLUR_PRESETS = [
  { label: "Nenhum", value: 0 },
  { label: "Leve", value: 2 },
  { label: "Médio", value: 8 },
  { label: "Intenso", value: 15 },
  { label: "Máximo", value: 20 },
];

export function BlurControl({
  blur,
  onBlurChange,
  previewImage,
}: BlurControlProps) {
  const [localBlur, setLocalBlur] = useState(blur);
  const [imageError, setImageError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSliderChange = useCallback(
    (values: number[]) => {
      try {
        setIsProcessing(true);
        const newBlur = values[0];

        // Validate blur value
        if (newBlur < 0 || newBlur > 20) {
          console.warn("Blur value out of range:", newBlur);
          return;
        }

        setLocalBlur(newBlur);
        onBlurChange(newBlur);
      } catch (error) {
        console.error("Error applying blur:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [onBlurChange]
  );

  const handlePresetClick = useCallback(
    (value: number) => {
      try {
        setIsProcessing(true);
        setLocalBlur(value);
        onBlurChange(value);
      } catch (error) {
        console.error("Error applying blur preset:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [onBlurChange]
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
  }, []);

  const retryImageLoad = useCallback(() => {
    setImageError(false);
  }, []);

  const getBlurIntensityLabel = (blurValue: number) => {
    if (blurValue === 0) return "Nenhum";
    if (blurValue <= 3) return "Leve";
    if (blurValue <= 8) return "Médio";
    if (blurValue <= 15) return "Intenso";
    return "Máximo";
  };

  const getBlurIntensityColor = (blurValue: number) => {
    if (blurValue === 0) return "text-muted-foreground";
    if (blurValue <= 3) return "text-blue-600";
    if (blurValue <= 8) return "text-yellow-600";
    if (blurValue <= 15) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Intensidade do Blur
        </label>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              getBlurIntensityColor(localBlur)
            )}
          >
            {getBlurIntensityLabel(localBlur)}
          </span>
          <span className="text-xs text-muted-foreground">({localBlur}px)</span>
        </div>
      </div>

      {/* Preview */}
      {previewImage && (
        <div className="relative">
          <div className="w-full h-20 rounded-lg overflow-hidden border border-border bg-muted">
            {imageError ? (
              // Fallback when preview image fails to load
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Erro no preview
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
                src={previewImage}
                alt="Blur preview"
                className="w-full h-full object-cover transition-all duration-300"
                style={{
                  filter: `blur(${localBlur}px)`,
                  opacity: isProcessing ? 0.7 : 1,
                }}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            )}
          </div>

          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded flex items-center gap-1">
            {isProcessing && (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            )}
            Preview
          </div>

          {/* Blur value indicator */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
            {localBlur === 0 ? "Sem blur" : `${localBlur}px`}
          </div>
        </div>
      )}

      {/* Slider Control */}
      <div className="space-y-3">
        <Slider
          value={[localBlur]}
          onValueChange={handleSliderChange}
          max={20}
          min={0}
          step={1}
          className="w-full"
        />

        {/* Slider Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0px</span>
          <span>5px</span>
          <span>10px</span>
          <span>15px</span>
          <span>20px</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Presets Rápidos
        </label>
        <div className="flex flex-wrap gap-2">
          {BLUR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md border transition-all",
                "hover:bg-muted",
                localBlur === preset.value
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Intensidade</span>
          <span className={cn("font-medium", getBlurIntensityColor(localBlur))}>
            {Math.round((localBlur / 20) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              localBlur === 0 && "bg-muted-foreground",
              localBlur > 0 && localBlur <= 3 && "bg-blue-500",
              localBlur > 3 && localBlur <= 8 && "bg-yellow-500",
              localBlur > 8 && localBlur <= 15 && "bg-orange-500",
              localBlur > 15 && "bg-red-500"
            )}
            style={{ width: `${(localBlur / 20) * 100}%` }}
          />
        </div>
      </div>

      {/* Visual Indicators */}
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const intensity = (i + 1) * 4; // 4, 8, 12, 16, 20
          const isActive = localBlur >= intensity - 2;
          return (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                isActive ? "bg-primary" : "bg-muted"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
