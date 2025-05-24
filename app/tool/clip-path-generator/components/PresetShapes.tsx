"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  createTriangle,
  createSquare,
  createStar,
  createDiamond,
  createPlus,
  createLeftArrow,
  createRightArrow,
  createPentagon,
  createCylinder
} from './utils';
import { ShapeProperties } from './types';

interface PresetShapesProps {
  onSelectShape: (shape: ShapeProperties) => void;
  currentBackgroundColor?: string;
}

const PresetShapes = ({ onSelectShape, currentBackgroundColor }: PresetShapesProps) => {
  const handlePresetClick = (type: 'triangle' | 'square' | 'star' | 'diamond' | 'plus' | 'leftArrow' | 'rightArrow' | 'pentagon' | 'cylinder') => {
    let newShape: ShapeProperties;
    
    if (type === 'triangle') {
      newShape = createTriangle();
    } else if (type === 'square') {
      newShape = createSquare();
    } else if (type === 'star') {
      newShape = createStar();
    } else if (type === 'diamond') {
      newShape = createDiamond();
    } else if (type === 'plus') {
      newShape = createPlus();
    } else if (type === 'leftArrow') {
      newShape = createLeftArrow();
    } else if (type === 'rightArrow') {
      newShape = createRightArrow();
    } else if (type === 'pentagon') {
      newShape = createPentagon();
    } else {
      newShape = createCylinder();
    }
    
    if (currentBackgroundColor) {
      newShape.backgroundColor = currentBackgroundColor;
    }
    
    onSelectShape(newShape);
  };

  return (
    <div className="grid grid-cols-5 md:grid-cols-2 lg:grid-cols-3 gap-2">
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

      <Button
        variant="outline"
        className="h-16 flex flex-col items-center justify-center"
        onClick={() => handlePresetClick('pentagon')}
      >
        <div className="text-2xl mb-1">⬠</div>
        <span className="text-xs">Pentagon</span>
      </Button>

      <Button
        variant="outline"
        className="h-16 flex flex-col items-center justify-center"
        onClick={() => handlePresetClick('cylinder')}
      >
        <div className="text-2xl mb-1">⬭</div>
        <span className="text-xs">Cylinder</span>
      </Button>

      <Button
        variant="outline"
        className="h-16 flex flex-col items-center justify-center"
        onClick={() => handlePresetClick('star')}
      >
        <div className="text-2xl mb-1">★</div>
        <span className="text-xs">Star</span>
      </Button>

      <Button
        variant="outline"
        className="h-16 flex flex-col items-center justify-center"
        onClick={() => handlePresetClick('diamond')}
      >
        <div className="text-2xl mb-1">◆</div>
        <span className="text-xs">Diamond</span>
      </Button>

      <Button
        variant="outline"
        className="h-16 flex flex-col items-center justify-center"
        onClick={() => handlePresetClick('plus')}
      >
        <div className="text-2xl mb-1">✚</div>
        <span className="text-xs">Plus</span>
      </Button>

      <Button
        variant="outline"
        className="h-16 flex flex-col items-center justify-center"
        onClick={() => handlePresetClick('leftArrow')}
      >
        <div className="text-2xl mb-1">←</div>
        <span className="text-xs">Left Arrow</span>
      </Button>

      <Button
        variant="outline"
        className="h-16 flex flex-col items-center justify-center"
        onClick={() => handlePresetClick('rightArrow')}
      >
        <div className="text-2xl mb-1">→</div>
        <span className="text-xs">Right Arrow</span>
      </Button>
    </div>
  );
};

export default PresetShapes; 