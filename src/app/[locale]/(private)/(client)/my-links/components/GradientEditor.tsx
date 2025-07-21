"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BackgroundGradient } from "@/types/bio-builder";
import {
  PRESET_GRADIENTS,
  GRADIENT_DIRECTIONS,
  generateGradientCSS,
  type GradientDirectionName,
} from "@/lib/background-utils";

interface GradientEditorProps {
  gradient: BackgroundGradient | undefined;
  onGradientChange: (gradient: BackgroundGradient) => void;
}

const DIRECTION_OPTIONS = [
  {
    label: "↗",
    value: GRADIENT_DIRECTIONS["to-top-right"],
    name: "Diagonal ↗",
  },
  { label: "→", value: GRADIENT_DIRECTIONS["to-right"], name: "Horizontal →" },
  {
    label: "↘",
    value: GRADIENT_DIRECTIONS["to-bottom-right"],
    name: "Diagonal ↘",
  },
  { label: "↓", value: GRADIENT_DIRECTIONS["to-bottom"], name: "Vertical ↓" },
  {
    label: "↙",
    value: GRADIENT_DIRECTIONS["to-bottom-left"],
    name: "Diagonal ↙",
  },
  { label: "←", value: GRADIENT_DIRECTIONS["to-left"], name: "Horizontal ←" },
  { label: "↖", value: GRADIENT_DIRECTIONS["to-top-left"], name: "Diagonal ↖" },
  { label: "↑", value: GRADIENT_DIRECTIONS["to-top"], name: "Vertical ↑" },
];

export function GradientEditor({
  gradient,
  onGradientChange,
}: GradientEditorProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);

  const currentGradient = gradient || {
    type: "linear" as const,
    direction: 45,
    colors: ["#667eea", "#764ba2"] as [string, string],
  };

  const handlePresetClick = (preset: (typeof PRESET_GRADIENTS)[number]) => {
    onGradientChange({
      type: "linear",
      direction: preset.direction,
      colors: preset.colors as [string, string],
    });
    setIsCustomMode(false);
  };

  const handleCustomColorChange = (index: 0 | 1, color: string) => {
    const newColors = [...currentGradient.colors] as [string, string];
    newColors[index] = color;
    onGradientChange({
      ...currentGradient,
      colors: newColors,
    });
  };

  const handleDirectionChange = (direction: number) => {
    onGradientChange({
      ...currentGradient,
      direction,
    });
  };

  const getGradientStyle = (colors: [string, string], direction: number) => ({
    background: generateGradientCSS("linear", colors, direction),
  });

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsCustomMode(false)}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md transition-all",
            !isCustomMode
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          Predefinidos
        </button>
        <button
          onClick={() => setIsCustomMode(true)}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md transition-all",
            isCustomMode
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          Personalizado
        </button>
      </div>

      {!isCustomMode ? (
        /* Preset Gradients */
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Gradientes Predefinidos
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_GRADIENTS.map((preset) => {
              const isSelected =
                currentGradient.colors[0] === preset.colors[0] &&
                currentGradient.colors[1] === preset.colors[1] &&
                currentGradient.direction === preset.direction;

              return (
                <button
                  key={preset.name}
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "h-12 rounded-lg border-2 transition-all hover:scale-105",
                    isSelected
                      ? "border-ring ring-2 ring-ring/20"
                      : "border-border hover:border-ring/50"
                  )}
                  style={getGradientStyle(
                    preset.colors as [string, string],
                    preset.direction
                  )}
                  title={preset.name}
                >
                  <span className="text-white text-xs font-medium drop-shadow-sm">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Custom Gradient Creator */
        <div className="space-y-4">
          {/* Color Pickers */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Cores do Gradiente
            </label>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-12">
                  Cor 1:
                </span>
                <div
                  className="w-8 h-8 rounded border-2 border-border"
                  style={{ backgroundColor: currentGradient.colors[0] }}
                />
                <input
                  type="color"
                  value={currentGradient.colors[0]}
                  onChange={(e) => handleCustomColorChange(0, e.target.value)}
                  className="flex-1 h-8 rounded border border-border bg-transparent cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-12">
                  Cor 2:
                </span>
                <div
                  className="w-8 h-8 rounded border-2 border-border"
                  style={{ backgroundColor: currentGradient.colors[1] }}
                />
                <input
                  type="color"
                  value={currentGradient.colors[1]}
                  onChange={(e) => handleCustomColorChange(1, e.target.value)}
                  className="flex-1 h-8 rounded border border-border bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Direction Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Direção do Gradiente
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DIRECTION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDirectionChange(option.value)}
                  className={cn(
                    "h-10 rounded-md border-2 transition-all text-lg",
                    currentGradient.direction === option.value
                      ? "border-ring bg-ring/10 text-ring"
                      : "border-border hover:border-ring/50 text-muted-foreground hover:text-foreground"
                  )}
                  title={option.name}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Visualização
        </label>
        <div
          className="h-16 rounded-lg border-2 border-border"
          style={getGradientStyle(
            currentGradient.colors,
            currentGradient.direction
          )}
        />
      </div>
    </div>
  );
}
