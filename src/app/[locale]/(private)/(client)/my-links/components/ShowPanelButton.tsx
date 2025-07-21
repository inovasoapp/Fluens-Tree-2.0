"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShowPanelButtonProps {
  onClick: () => void;
}

export function ShowPanelButton({ onClick }: ShowPanelButtonProps) {
  return (
    <div className=" w-8 z-50">
      <Button
        variant="ghost"
        onClick={onClick}
        className="dark:bg-zinc-900 dark:hover:bg-zinc-800 text-white p-1 border-r  border-zinc-800 transition-all duration-200 shadow-lg hover:shadow-xl h-full w-8 flex items-center justify-center"
        title="Mostrar painel de elementos"
      >
        <PanelLeft size={18} strokeWidth={1.5} className="text-gray-300" />
      </Button>
    </div>
  );
}
