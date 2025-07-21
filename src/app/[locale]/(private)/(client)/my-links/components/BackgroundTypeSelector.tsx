"use client";

import { cn } from "@/lib/utils";

interface BackgroundTypeSelectorProps {
  selectedType: "solid" | "gradient" | "image";
  onTypeChange: (type: "solid" | "gradient" | "image") => void;
}

const backgroundTypes = [
  { id: "solid", label: "Cor", icon: "⬜" },
  { id: "gradient", label: "Gradiente", icon: "🌈" },
  { id: "image", label: "Imagem", icon: "🖼️" },
] as const;

export function BackgroundTypeSelector({
  selectedType,
  onTypeChange,
}: BackgroundTypeSelectorProps) {
  return (
    <div className="flex w-full rounded-lg bg-muted p-1">
      {backgroundTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onTypeChange(type.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all",
            "hover:bg-background/50",
            selectedType === type.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="text-base">{type.icon}</span>
          <span>{type.label}</span>
        </button>
      ))}
    </div>
  );
}
