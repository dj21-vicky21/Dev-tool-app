"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  predefinedBoxShadows, 
  generateRandomBoxShadow 
} from "./predefined-shadows";
import { Wand2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BoxShadowParams {
  horizontalOffset: number;
  verticalOffset: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

interface PredefinedBoxShadowsProps {
  onSelectShadow: (params: BoxShadowParams) => void;
}

export default function PredefinedBoxShadows({ onSelectShadow }: PredefinedBoxShadowsProps) {
  const [templates, setTemplates] = useState(predefinedBoxShadows);
  
  const handleRandomShadow = () => {
    const randomParams = generateRandomBoxShadow();
    onSelectShadow(randomParams as BoxShadowParams);
  };
  
  const regenerateTemplates = () => {
    // Generate completely new random templates instead of shuffling
    const newTemplates = Array.from({ length: templates.length }, (_, index) => {
      const params = generateRandomBoxShadow();
      const rgba = `rgba(${parseInt(params.color.slice(1, 3), 16)}, ${parseInt(params.color.slice(3, 5), 16)}, ${parseInt(params.color.slice(5, 7), 16)}, ${params.opacity})`;
      
      return {
        name: `Shadow ${index + 1}`,
        type: "box" as const,
        css: `${params.inset ? 'inset ' : ''}${params.horizontalOffset}px ${params.verticalOffset}px ${params.blur}px ${params.spread}px ${rgba}`,
        params
      };
    });
    
    setTemplates(newTemplates);
  };
  
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Predefined Box Shadows</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRandomShadow}
          >
            <Wand2 className="h-4 w-4 mr-1" />
            Random
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={regenerateTemplates}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {templates.map((shadow, index) => (
          <Card 
            key={`${shadow.name}-${index}`}
            className="p-2 cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-200"
            onClick={() => onSelectShadow(shadow.params as BoxShadowParams)}
          >
            <div className="flex flex-col items-center">
              <div 
                className="w-16 h-16 rounded bg-white mb-2"
                style={{ boxShadow: shadow.css }}
              />
              <span className="text-xs text-center font-medium truncate w-full">
                {shadow.name}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 