"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Folder,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tipo para representar uma pasta na biblioteca de mídia
interface MediaFolder {
  id: string;
  name: string;
  images: MediaImage[];
}

// Tipo para representar uma imagem na biblioteca de mídia
interface MediaImage {
  id: string;
  url: string;
  name: string;
}

// Dados de exemplo para a biblioteca de mídia
const SAMPLE_FOLDERS: MediaFolder[] = [
  {
    id: "heroes",
    name: "heros",
    images: [
      {
        id: "hero-1",
        url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&h=300&fit=crop",
        name: "Gradiente 1",
      },
      {
        id: "hero-2",
        url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=300&h=300&fit=crop",
        name: "Gradiente 2",
      },
    ],
  },
  {
    id: "backgrounds",
    name: "backgrounds",
    images: [
      {
        id: "bg-1",
        url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&h=300&fit=crop",
        name: "Céu estrelado",
      },
    ],
  },
  {
    id: "logos",
    name: "logos",
    images: [
      {
        id: "logo-1",
        url: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=300&h=300&fit=crop",
        name: "Logo 1",
      },
    ],
  },
];

export function MediaLibrary() {
  const [folders, setFolders] = useState<MediaFolder[]>(SAMPLE_FOLDERS);
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({
    heroes: true, // Pasta "heroes" expandida por padrão
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Função para alternar a expansão de uma pasta
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Função para simular o upload de uma imagem para uma pasta
  const handleUploadToFolder = (folderId: string) => {
    // Em uma implementação real, aqui abriríamos um seletor de arquivos
    console.log(`Upload para pasta ${folderId}`);
    // Simulando a adição de uma nova imagem
    const newImage = {
      id: `new-${Date.now()}`,
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&h=300&fit=crop",
      name: "Nova imagem",
    };

    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, images: [...folder.images, newImage] }
          : folder
      )
    );
  };

  // Função para criar uma nova pasta
  const handleCreateFolder = () => {
    const newFolder: MediaFolder = {
      id: `folder-${Date.now()}`,
      name: "Nova Pasta",
      images: [],
    };
    setFolders((prev) => [...prev, newFolder]);
    // Expandir a nova pasta automaticamente
    setExpandedFolders((prev) => ({
      ...prev,
      [newFolder.id]: true,
    }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header da biblioteca */}
      <div className="p-4">
        <h2 className="text-lg font-medium text-white mb-4">
          Biblioteca de Mídia
        </h2>
        <Button
          variant="default"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mb-4"
          onClick={handleCreateFolder}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Pasta
        </Button>
      </div>

      {/* Lista de pastas e imagens */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-2">
          {folders.map((folder) => (
            <div key={folder.id} className="mb-2">
              {/* Cabeçalho da pasta */}
              <div
                className="flex items-center justify-between p-3 bg-gray-800/70 rounded-md cursor-pointer"
                onClick={() => toggleFolder(folder.id)}
              >
                <div className="flex items-center">
                  <Folder className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-white">{folder.name}</span>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadToFolder(folder.id);
                    }}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  {expandedFolders[folder.id] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Conteúdo da pasta (imagens) */}
              {expandedFolders[folder.id] && (
                <div className="mt-2 pl-2">
                  {/* Botão de upload para esta pasta */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-2 w-full border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 bg-gray-800/50"
                    onClick={() => handleUploadToFolder(folder.id)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload para "{folder.name}"
                  </Button>

                  {/* Grid de imagens */}
                  <div className="grid grid-cols-3 gap-2">
                    {folder.images.map((image) => (
                      <div
                        key={image.id}
                        className={cn(
                          "relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer",
                          selectedImage === image.id
                            ? "border-blue-500"
                            : "border-transparent hover:border-gray-600"
                        )}
                        onClick={() => setSelectedImage(image.id)}
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
