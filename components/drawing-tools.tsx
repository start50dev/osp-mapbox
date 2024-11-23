"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  MousePointer2, 
  Pencil,
  MinusSquare,
  Circle, 
  Square,
  Type
} from "lucide-react";

export type DrawingTool = "select" | "line" | "straightLine" | "point" | "polygon" | "text";

interface DrawingToolsProps {
  onToolChange: (tool: DrawingTool) => void;
  activeTool: DrawingTool;
}

export function DrawingTools({ onToolChange, activeTool }: DrawingToolsProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 p-1 rounded-lg shadow-lg border">
      <ToggleGroup type="single" value={activeTool} onValueChange={(value) => value && onToolChange(value as DrawingTool)}>
        <ToggleGroupItem value="select" aria-label="Select tool">
          <MousePointer2 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="line" aria-label="Freehand line tool">
          <Pencil className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="straightLine" aria-label="Straight line tool">
          <MinusSquare className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="point" aria-label="Point tool">
          <Circle className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="polygon" aria-label="Polygon tool">
          <Square className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="text" aria-label="Text tool">
          <Type className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}