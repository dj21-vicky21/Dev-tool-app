"use client";

import { Button } from "@/components/ui/button";
import {
  createTriangle,
  createSquare,
  createPentagon,
  createCircle,
} from './utils';
import { ShapeProperties } from './types';

interface PresetShapesProps {
  onSelectShape: (shape: ShapeProperties) => void;
}

export default function PresetShapes({ onSelectShape }: PresetShapesProps) {
  const presets = [
    { name: 'Triangle', shape: createTriangle(), icon: '△' },
    { name: 'Square', shape: createSquare(), icon: '□' },
    { name: 'Pentagon', shape: createPentagon(), icon: '⬠' },
    { name: 'Circle', shape: createCircle(), icon: '○' },
  ];
  
  return (
    <div className="grid grid-cols-4 gap-2">
      {presets.map((preset, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center p-1"
          onClick={() => onSelectShape(preset.shape)}
        >
          <span className="text-xl">{preset.icon}</span>
          <span className="text-xs mt-1">{preset.name}</span>
        </Button>
      ))}
    </div>
  );
} 