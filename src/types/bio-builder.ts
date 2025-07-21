export interface BioElement {
  id: string;
  type: "profile" | "link" | "text" | "social" | "divider" | "image";
  position: number;
  data: {
    // Profile element
    name?: string;
    bio?: string;
    avatar?: string;

    // Link element
    title?: string;
    url?: string;
    icon?: string;

    // Text element
    content?: string;

    // Social element
    platform?: "instagram" | "twitter" | "youtube" | "tiktok" | "linkedin";
    username?: string;

    // Image element
    src?: string;
    alt?: string;

    // Common styling
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    padding?: number;
    margin?: number;
    fontSize?: number;
    fontWeight?: "normal" | "bold" | "light";
    textAlign?: "left" | "center" | "right";
  };
}

export interface BackgroundGradient {
  type: "linear" | "radial";
  direction: number; // degrees for linear
  colors: [string, string];
}

export interface BackgroundImage {
  url: string;
  blur: number; // 0-20px
  position: "center" | "top" | "bottom";
  size: "cover" | "contain";
}

export interface BioPageTheme {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  // New background fields
  backgroundType: "solid" | "gradient" | "image";
  backgroundGradient?: BackgroundGradient;
  backgroundImage?: BackgroundImage;
}

export interface BioPage {
  id: string;
  title: string;
  slug: string;
  elements: BioElement[];
  theme: BioPageTheme;
  createdAt: Date;
  updatedAt: Date;
}

export interface ElementTemplate {
  id: string;
  type: BioElement["type"];
  name: string;
  icon: string;
  defaultData: BioElement["data"];
}
