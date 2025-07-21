"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from "./ImageUploader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Link as LinkIcon,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageSourceSelectorProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  onImageRemove?: () => void;
  onError?: (errorMessage: string) => void;
}

// Sample library images
const SAMPLE_IMAGES = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
    name: "Gradiente colorido",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
    name: "Gradiente roxo",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1559825481-12a05cc00344?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1559825481-12a05cc00344?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
    name: "Gradiente azul",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
    name: "Céu estrelado",
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
    name: "Luzes de neon",
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
    name: "Textura abstrata",
  },
];

export function ImageSourceSelector({
  onImageSelect,
  currentImage,
  onImageRemove,
  onError,
}: ImageSourceSelectorProps) {
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  // Handle URL input
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setUrlError("Por favor, insira uma URL válida");
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
      setUrlError(null);
      onImageSelect(urlInput);
    } catch (e) {
      setUrlError("URL inválida. Certifique-se de incluir http:// ou https://");
    }
  };

  // Handle library image selection
  const handleLibraryImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    // Switch to the upload tab after selection to show the preview
    setActiveTab("upload");
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Biblioteca</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-1">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>URL</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <ImageUploader
            onImageUpload={onImageSelect}
            currentImage={currentImage}
            onImageRemove={onImageRemove}
            onError={onError}
          />
        </TabsContent>

        <TabsContent value="library" className="mt-0">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Selecione uma imagem da nossa biblioteca:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "relative aspect-square rounded-md overflow-hidden border cursor-pointer transition-all",
                    "hover:opacity-90 hover:border-primary"
                  )}
                  onClick={() => handleLibraryImageSelect(image.url)}
                >
                  <img
                    src={image.thumbnail}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium px-2 py-1 bg-black/60 rounded">
                      Selecionar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-0">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Insira a URL da imagem:
            </div>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                className="flex-1"
              />
              <Button onClick={handleUrlSubmit} type="button">
                Usar
              </Button>
            </div>
            {urlError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{urlError}</span>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
