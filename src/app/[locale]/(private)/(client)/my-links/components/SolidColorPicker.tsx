"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SolidColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

const presetColors = [
  "#ffffff",
  "#f8f9fa",
  "#e9ecef",
  "#dee2e6",
  "#ced4da",
  "#adb5bd",
  "#6c757d",
  "#495057",
  "#343a40",
  "#212529",
  "#000000",
  "#ff6b6b",
  "#ee5a52",
  "#ff8787",
  "#ffa8a8",
  "#ffc9c9",
  "#51cf66",
  "#40c057",
  "#69db7c",
  "#8ce99a",
  "#b2f2bb",
  "#339af0",
  "#228be6",
  "#74c0fc",
  "#a5d8ff",
  "#d0ebff",
  "#845ef7",
  "#7950f2",
  "#9775fa",
  "#b197fc",
  "#d0bfff",
  "#fd7e14",
  "#e8590c",
  "#ff922b",
  "#ffb366",
  "#ffd8a8",
  "#e64980",
  "#d6336c",
  "#f06595",
  "#f783ac",
  "#ffb3d1",
];

export function SolidColorPicker({
  color,
  onColorChange,
}: SolidColorPickerProps) {
  const [customColor, setCustomColor] = useState(color);

  const handleCustomColorChange = (newColor: string) => {
    setCustomColor(newColor);
    onColorChange(newColor);
  };

  const handlePresetColorClick = (presetColor: string) => {
    setCustomColor(presetColor);
    onColorChange(presetColor);
  };

  return (
    <div className="space-y-4">
      {/* Custom Color Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Cor Personalizada
        </label>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
            style={{ backgroundColor: customColor }}
          />
          <input
            type="color"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-transparent cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={customColor}
          onChange={(e) => handleCustomColorChange(e.target.value)}
          placeholder="#ffffff"
          className={cn(
            "w-full px-3 py-2 text-sm rounded-md border border-border bg-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "placeholder:text-muted-foreground"
          )}
        />
      </div>

      {/* Preset Colors */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Cores Predefinidas
        </label>
        <div className="grid grid-cols-11 gap-2">
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => handlePresetColorClick(presetColor)}
              className={cn(
                "w-6 h-6 rounded border-2 transition-all hover:scale-110",
                color === presetColor
                  ? "border-ring ring-2 ring-ring/20"
                  : "border-border hover:border-ring/50"
              )}
              style={{ backgroundColor: presetColor }}
              title={presetColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
