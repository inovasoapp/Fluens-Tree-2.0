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

export interface BioPage {
  id: string;
  title: string;
  slug: string;
  elements: BioElement[];
  theme: {
    backgroundColor: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
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
