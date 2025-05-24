"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  createTriangle,
  createSquare,
} from './utils';
import { ShapeProperties } from './types';

interface PresetShapesProps {
  onSelectShape: (shape: ShapeProperties) => void;
  currentBackgroundColor?: string;
}

const PresetShapes = ({ onSelectShape, currentBackgroundColor }: PresetShapesProps) => {
  const handlePresetClick = (type: 'triangle' | 'square') => {
    let newShape;
    
    if (type === 'triangle') {
      newShape = createTriangle();
    } else {
      newShape = createSquare();
    }
    
    if (currentBackgroundColor) {
      newShape.backgroundColor = currentBackgroundColor;
    }
    
    onSelectShape(newShape);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="outline"
        className="h-16 flex flex-col items-center justify-center"
        onClick={() => handlePresetClick('triangle')}
      >
        <div className="text-2xl mb-1">△</div>
        <span className="text-xs">Triangle</span>
      </Button>
      
      <Button
        variant="outline"
        className="h-16 flex flex-col items-center justify-center"
        onClick={() => handlePresetClick('square')}
      >
        <div className="text-2xl mb-1">□</div>
        <span className="text-xs">Square</span>
      </Button>
    </div>
  );
};

export default PresetShapes; 