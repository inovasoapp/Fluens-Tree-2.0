import { BioPageTheme } from "@/types/bio-builder";

// Predefined gradient combinations for quick selection
export const PRESET_GRADIENTS = [
  {
    name: "Sunset",
    colors: ["#ff7e5f", "#feb47b"] as [string, string],
    direction: 45,
    type: "linear" as const,
  },
  {
    name: "Ocean",
    colors: ["#667eea", "#764ba2"] as [string, string],
    direction: 135,
    type: "linear" as const,
  },
  {
    name: "Forest",
    colors: ["#11998e", "#38ef7d"] as [string, string],
    direction: 90,
    type: "linear" as const,
  },
  {
    name: "Purple Dream",
    colors: ["#667eea", "#764ba2"] as [string, string],
    direction: 180,
    type: "linear" as const,
  },
  {
    name: "Fire",
    colors: ["#ff416c", "#ff4b2b"] as [string, string],
    direction: 45,
    type: "linear" as const,
  },
  {
    name: "Cool Blue",
    colors: ["#2196f3", "#21cbf3"] as [string, string],
    direction: 135,
    type: "linear" as const,
  },
  {
    name: "Warm Sunset",
    colors: ["#fa709a", "#fee140"] as [string, string],
    direction: 45,
    type: "linear" as const,
  },
  {
    name: "Deep Space",
    colors: ["#000428", "#004e92"] as [string, string],
    direction: 180,
    type: "linear" as const,
  },
  {
    name: "Green Mint",
    colors: ["#00b09b", "#96c93d"] as [string, string],
    direction: 90,
    type: "linear" as const,
  },
  {
    name: "Pink Glow",
    colors: ["#fc466b", "#3f5efb"] as [string, string],
    direction: 135,
    type: "linear" as const,
  },
] as const;

// Gradient direction presets with human-readable names
export const GRADIENT_DIRECTIONS = {
  "to-right": 90,
  "to-left": 270,
  "to-bottom": 180,
  "to-top": 0,
  "to-bottom-right": 135,
  "to-bottom-left": 225,
  "to-top-right": 45,
  "to-top-left": 315,
} as const;

export type GradientDirectionName = keyof typeof GRADIENT_DIRECTIONS;

/**
 * Generates CSS styles for background based on theme configuration with error handling
 */
// Keep track of the last valid background type to prevent unwanted reversions
let lastValidBackgroundType: string | null = null;

export const getBackgroundStyle = (
  theme: BioPageTheme
): React.CSSProperties => {
  try {
    // Validate theme object
    if (!theme || typeof theme !== "object") {
      console.warn("Invalid theme object, using default background");
      return { backgroundColor: "#ffffff" };
    }

    const backgroundType = theme.backgroundType || "solid";
    const fallbackColor = theme.backgroundColor || "#ffffff";

    // Update our last valid background type
    if (
      backgroundType &&
      (backgroundType === "solid" ||
        backgroundType === "gradient" ||
        backgroundType === "image")
    ) {
      lastValidBackgroundType = backgroundType;
      console.log(
        `background-utils: Updated last valid background type to ${backgroundType}`
      );
    }

    // Special handling for image type to prevent unwanted reversions
    if (backgroundType === "image" && !theme.backgroundImage?.url) {
      console.log(
        "background-utils: Image type with no URL, maintaining image type"
      );
    }

    switch (backgroundType) {
      case "solid":
        // Validate background color
        if (!theme.backgroundColor || !isValidHexColor(theme.backgroundColor)) {
          console.warn("Invalid background color, using fallback");
          return { backgroundColor: "#ffffff" };
        }
        return {
          backgroundColor: theme.backgroundColor,
        };

      case "gradient":
        if (!theme.backgroundGradient) {
          console.warn(
            "Gradient configuration missing, falling back to solid color"
          );
          return { backgroundColor: fallbackColor };
        }

        const { type, direction, colors } = theme.backgroundGradient;

        // Validate gradient configuration
        if (!isValidGradient({ type, direction, colors })) {
          console.warn(
            "Invalid gradient configuration, falling back to solid color"
          );
          return { backgroundColor: fallbackColor };
        }

        try {
          if (type === "linear") {
            return {
              background: `linear-gradient(${direction}deg, ${colors[0]}, ${colors[1]})`,
              // Add fallback color in case gradient fails
              backgroundColor: fallbackColor,
            };
          } else if (type === "radial") {
            return {
              background: `radial-gradient(circle, ${colors[0]}, ${colors[1]})`,
              backgroundColor: fallbackColor,
            };
          }
        } catch (gradientError) {
          console.error("Error generating gradient CSS:", gradientError);
          return { backgroundColor: fallbackColor };
        }

        // Fallback to solid color for unknown gradient types
        return { backgroundColor: fallbackColor };

      case "image":
        if (!theme.backgroundImage) {
          console.warn(
            "Image configuration missing, using fallback color but MAINTAINING image type"
          );
          // Return a simple background color without changing the type
          // Add a custom property to indicate this is an image background without an image
          return {
            backgroundColor: fallbackColor,
            // This custom property won't affect rendering but helps identify the background type
            "--background-type": "image-pending" as any,
          };
        }

        const { url, blur, position, size } = theme.backgroundImage;

        // Validate image URL
        if (!url || typeof url !== "string" || url.trim() === "") {
          console.warn(
            "Invalid image URL, using fallback color but MAINTAINING image type"
          );
          // Return a simple background color without changing the type
          // Add a custom property to indicate this is an image background without an image
          return {
            backgroundColor: fallbackColor,
            // This custom property won't affect rendering but helps identify the background type
            "--background-type": "image-pending" as any,
          };
        }

        // Validate blur value
        const validBlur =
          typeof blur === "number" && blur >= 0 && blur <= 20 ? blur : 0;
        if (blur !== validBlur) {
          console.warn(`Invalid blur value ${blur}, using ${validBlur}`);
        }

        // Validate position and size
        const validPosition = ["center", "top", "bottom"].includes(position)
          ? position
          : "center";
        const validSize = ["cover", "contain"].includes(size) ? size : "cover";

        try {
          return {
            backgroundImage: `url("${url}")`,
            backgroundSize: validSize,
            backgroundPosition: validPosition,
            backgroundRepeat: "no-repeat",
            filter: validBlur > 0 ? `blur(${validBlur}px)` : undefined,
            // Add fallback color in case image fails to load
            backgroundColor: fallbackColor,
          };
        } catch (imageError) {
          console.error("Error generating image background CSS:", imageError);
          return { backgroundColor: fallbackColor };
        }

      default:
        console.warn(
          `Unknown background type: ${backgroundType}, using solid color`
        );
        return { backgroundColor: fallbackColor };
    }
  } catch (error) {
    console.error("Error in getBackgroundStyle:", error);
    // Ultimate fallback
    return { backgroundColor: "#ffffff" };
  }
};

/**
 * Generates CSS class names for background styling when CSS-in-JS is not suitable
 */
export const getBackgroundClassName = (theme: BioPageTheme): string => {
  const baseClasses = "w-full h-full transition-all duration-300";

  switch (theme.backgroundType) {
    case "solid":
      return baseClasses;
    case "gradient":
      return `${baseClasses} bg-gradient`;
    case "image":
      return `${baseClasses} bg-image`;
    default:
      return baseClasses;
  }
};

/**
 * Generates CSS gradient string from gradient configuration
 */
export const generateGradientCSS = (
  type: "linear" | "radial",
  colors: [string, string],
  direction?: number
): string => {
  if (type === "linear") {
    const deg = direction ?? 90;
    return `linear-gradient(${deg}deg, ${colors[0]}, ${colors[1]})`;
  } else if (type === "radial") {
    return `radial-gradient(circle, ${colors[0]}, ${colors[1]})`;
  }

  // Fallback to linear gradient
  return `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`;
};

/**
 * Converts direction name to degrees
 */
export const getDirectionDegrees = (
  direction: GradientDirectionName
): number => {
  return GRADIENT_DIRECTIONS[direction];
};

/**
 * Converts degrees to closest direction name
 */
export const getDirectionName = (degrees: number): GradientDirectionName => {
  // Normalize degrees to 0-360 range
  const normalizedDegrees = ((degrees % 360) + 360) % 360;

  // Find the closest direction
  let closestDirection: GradientDirectionName = "to-right";
  let minDifference = Infinity;

  Object.entries(GRADIENT_DIRECTIONS).forEach(([name, deg]) => {
    const difference = Math.abs(normalizedDegrees - deg);
    const wrappedDifference = Math.abs(normalizedDegrees - (deg + 360));
    const minDiff = Math.min(difference, wrappedDifference);

    if (minDiff < minDifference) {
      minDifference = minDiff;
      closestDirection = name as GradientDirectionName;
    }
  });

  return closestDirection;
};

/**
 * Creates a gradient configuration from a preset
 */
export const createGradientFromPreset = (presetName: string) => {
  const preset = PRESET_GRADIENTS.find((g) => g.name === presetName);
  if (!preset) {
    // Return default gradient if preset not found
    return {
      type: "linear" as const,
      colors: ["#667eea", "#764ba2"] as [string, string],
      direction: 90,
    };
  }

  return {
    type: preset.type,
    colors: preset.colors,
    direction: preset.direction,
  };
};

/**
 * Validates gradient colors (basic hex color validation)
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Validates gradient configuration
 */
export const isValidGradient = (gradient: {
  type: string;
  colors: [string, string];
  direction: number;
}): boolean => {
  return (
    (gradient.type === "linear" || gradient.type === "radial") &&
    Array.isArray(gradient.colors) &&
    gradient.colors.length === 2 &&
    gradient.colors.every(isValidHexColor) &&
    typeof gradient.direction === "number" &&
    gradient.direction >= 0 &&
    gradient.direction <= 360
  );
};

/**
 * Gets a random preset gradient
 */
export const getRandomPresetGradient = () => {
  const randomIndex = Math.floor(Math.random() * PRESET_GRADIENTS.length);
  return PRESET_GRADIENTS[randomIndex];
};

/**
 * Validates image URL and provides fallback handling
 */
export const validateImageUrl = async (
  url: string
): Promise<{
  isValid: boolean;
  error?: string;
  fallbackUrl?: string;
}> => {
  try {
    if (!url || typeof url !== "string" || url.trim() === "") {
      return {
        isValid: false,
        error: "URL da imagem está vazia ou inválida",
      };
    }

    // Check if it's a data URL (base64)
    if (url.startsWith("data:image/")) {
      return { isValid: true };
    }

    // Check if it's a blob URL
    if (url.startsWith("blob:")) {
      return { isValid: true };
    }

    // For HTTP URLs, we can't easily validate without CORS issues
    // So we'll assume they're valid and let the browser handle errors
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return { isValid: true };
    }

    return {
      isValid: false,
      error: "Formato de URL não suportado",
    };
  } catch (error) {
    return {
      isValid: false,
      error: "Erro ao validar URL da imagem",
    };
  }
};

/**
 * Creates a safe background style with error handling for images
 */
export const getSafeBackgroundStyle = async (
  theme: BioPageTheme
): Promise<React.CSSProperties> => {
  try {
    const baseStyle = getBackgroundStyle(theme);

    // If it's an image background, validate the URL
    if (theme.backgroundType === "image" && theme.backgroundImage?.url) {
      const validation = await validateImageUrl(theme.backgroundImage.url);

      if (!validation.isValid) {
        console.warn("Image validation failed:", validation.error);
        // Fallback to solid color
        return {
          backgroundColor: theme.backgroundColor || "#ffffff",
        };
      }
    }

    return baseStyle;
  } catch (error) {
    console.error("Error in getSafeBackgroundStyle:", error);
    return { backgroundColor: "#ffffff" };
  }
};

/**
 * Handles image load errors and provides fallback
 */
export const handleImageLoadError = (
  imageUrl: string,
  fallbackColor: string = "#ffffff"
): React.CSSProperties => {
  console.warn(`Failed to load background image: ${imageUrl}`);

  return {
    backgroundColor: fallbackColor,
    // Add a subtle pattern as visual indicator of failed image load
    backgroundImage: `linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 50%, transparent 50%, transparent 75%, rgba(0,0,0,0.05) 75%)`,
    backgroundSize: "20px 20px",
  };
};

/**
 * Validates and sanitizes blur value
 */
export const sanitizeBlurValue = (blur: unknown): number => {
  if (typeof blur !== "number") {
    return 0;
  }

  if (isNaN(blur) || blur < 0) {
    return 0;
  }

  if (blur > 20) {
    return 20;
  }

  return Math.round(blur);
};

/**
 * Error boundary fallback for background rendering
 */
export const getErrorFallbackStyle = (): React.CSSProperties => {
  return {
    backgroundColor: "#f8f9fa",
    backgroundImage: `linear-gradient(45deg, #e9ecef 25%, transparent 25%, transparent 75%, #e9ecef 75%), 
                     linear-gradient(45deg, #e9ecef 25%, transparent 25%, transparent 75%, #e9ecef 75%)`,
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 10px 10px",
  };
};
