"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Image, Palette, SwatchBook } from "lucide-react";

interface BackgroundTypeSelectorProps {
  selectedType: "solid" | "gradient" | "image";
  onTypeChange: (type: "solid" | "gradient" | "image") => void;
}

const backgroundTypes = [
  { id: "solid", label: "Cor", icon: <Palette size={18} strokeWidth={1} /> },
  {
    id: "gradient",
    label: "Gradiente",
    icon: <SwatchBook size={18} strokeWidth={1} />,
  },
  { id: "image", label: "Imagem", icon: <Image size={18} strokeWidth={1} /> },
] as const;

export function BackgroundTypeSelector({
  selectedType,
  onTypeChange,
}: BackgroundTypeSelectorProps) {
  // Add state to track which type is transitioning (for visual feedback)
  const [transitioningType, setTransitioningType] = useState<string | null>(
    null
  );

  // Add state to track the last selected type
  const [lastSelectedType, setLastSelectedType] = useState<string | null>(
    selectedType
  );

  // Update lastSelectedType when selectedType changes
  useEffect(() => {
    if (selectedType !== lastSelectedType) {
      setLastSelectedType(selectedType);
    }
  }, [selectedType, lastSelectedType]);

  // Enhanced type change handler with visual feedback
  const handleTypeChange = useCallback(
    (typeId: "solid" | "gradient" | "image") => {
      // Skip if already selected
      if (typeId === selectedType) return;

      // Set transitioning state for visual feedback
      setTransitioningType(typeId);

      // Update our last selected type
      setLastSelectedType(typeId);

      // Call the parent's onTypeChange handler
      onTypeChange(typeId);

      // Clear transitioning state after a short delay
      setTimeout(() => {
        setTransitioningType(null);
      }, 500);
    },
    [selectedType, onTypeChange]
  );

  return (
    <div className="flex w-full rounded-lg bg-muted p-1">
      {backgroundTypes.map((type) => {
        // Determine if this type is currently transitioning
        const isTransitioning = transitioningType === type.id;

        return (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            disabled={isTransitioning}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all",
              "hover:bg-background/50",
              selectedType === type.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              // Add pulsing animation when transitioning
              isTransitioning && "animate-pulse bg-background/30"
            )}
          >
            <span className="text-base">{type.icon}</span>
            <span>{type.label}</span>

            {/* Show loading indicator when transitioning */}
            {isTransitioning && (
              <span className="ml-1 w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        );
      })}
    </div>
  );
}
