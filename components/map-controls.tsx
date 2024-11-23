"use client";

import { Upload, MapPin, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MapControlsProps {
  onFileImport: (geojson: any) => void;
  onResetView: () => void;
}

export function MapControls({ onFileImport, onResetView }: MapControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geojson = JSON.parse(e.target?.result as string);
        onFileImport(geojson);
      } catch (error) {
        console.error("Error parsing GeoJSON:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <TooltipProvider>
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <input
          type="file"
          ref={fileInputRef}
          accept=".geojson,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white hover:bg-gray-100 text-gray-800 shadow-lg"
            >
              <FileJson className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import GeoJSON</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              onClick={onResetView}
              className="bg-white hover:bg-gray-100 text-gray-800 shadow-lg"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset View</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}