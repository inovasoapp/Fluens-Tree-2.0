"use client";

import { BioElement } from "@/types/bio-builder";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
} from "lucide-react";

interface ElementRendererProps {
  element: BioElement;
}

export function ElementRenderer({ element }: ElementRendererProps) {
  const { type, data } = element;

  const commonStyles = {
    backgroundColor: data.backgroundColor || "transparent",
    color: data.textColor || "#000000",
    borderRadius: `${data.borderRadius || 0}px`,
    padding: `${data.padding || 0}px`,
    margin: `${data.margin || 0}px`,
    fontSize: `${data.fontSize || 14}px`,
    fontWeight: data.fontWeight || "normal",
    textAlign: data.textAlign || ("left" as const),
  };

  switch (type) {
    case "profile":
      return (
        <div
          className="flex flex-col items-center space-y-3"
          style={commonStyles}
        >
          <Avatar className="w-20 h-20">
            <AvatarImage src={data.avatar} alt={data.name} />
            <AvatarFallback className="text-2xl">
              {data.name?.charAt(0) || "👤"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ color: data.textColor }}>
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-sm opacity-80 mt-1"
              style={{ color: data.textColor }}
            >
              {data.bio || "Your bio description"}
            </p>
          </div>
        </div>
      );

    case "link":
      return (
        <Button
          className="w-full justify-between h-auto py-3 px-4"
          style={{
            ...commonStyles,
            border: "none",
          }}
          variant="outline"
        >
          <span>{data.title || "Link Title"}</span>
          <ExternalLink className="w-4 h-4" />
        </Button>
      );

    case "text":
      return (
        <div style={commonStyles}>
          <p>{data.content || "Your text content here"}</p>
        </div>
      );

    case "social":
      const getSocialIcon = () => {
        switch (data.platform) {
          case "instagram":
            return <Instagram className="w-4 h-4" />;
          case "twitter":
            return <Twitter className="w-4 h-4" />;
          case "youtube":
            return <Youtube className="w-4 h-4" />;
          case "linkedin":
            return <Linkedin className="w-4 h-4" />;
          default:
            return <ExternalLink className="w-4 h-4" />;
        }
      };

      const getSocialColor = () => {
        switch (data.platform) {
          case "instagram":
            return "#E4405F";
          case "twitter":
            return "#1DA1F2";
          case "youtube":
            return "#FF0000";
          case "linkedin":
            return "#0077B5";
          default:
            return "#000000";
        }
      };

      return (
        <Button
          className="w-full justify-between h-auto py-3 px-4"
          style={{
            ...commonStyles,
            backgroundColor: data.backgroundColor || getSocialColor(),
            border: "none",
          }}
          variant="outline"
        >
          <span className="flex items-center space-x-2">
            {getSocialIcon()}
            <span>@{data.username || "username"}</span>
          </span>
          <ExternalLink className="w-4 h-4" />
        </Button>
      );

    case "divider":
      return (
        <div
          className="w-full h-px"
          style={{
            backgroundColor: data.backgroundColor || "#e0e0e0",
            margin: `${data.margin || 16}px 0`,
          }}
        />
      );

    case "image":
      return (
        <div style={{ margin: `${data.margin || 0}px` }}>
          {data.src ? (
            <img
              src={data.src}
              alt={data.alt || "Image"}
              className="w-full h-auto object-cover"
              style={{ borderRadius: `${data.borderRadius || 0}px` }}
            />
          ) : (
            <div
              className="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400"
              style={{ borderRadius: `${data.borderRadius || 0}px` }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🖼️</div>
                <div className="text-sm">Add image URL</div>
              </div>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded text-center">
          Unknown element type: {type}
        </div>
      );
  }
}
