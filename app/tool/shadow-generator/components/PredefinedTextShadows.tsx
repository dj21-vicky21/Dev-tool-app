"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  predefinedTextShadows, 
  generateRandomTextShadow 
} from "./predefined-shadows";
import { Wand2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PredefinedTextShadowsProps {
  onSelectShadow: (params: {
    horizontalOffset: number;
    verticalOffset: number;
    blur: number;
    color: string;
    opacity: number;
  }) => void;
}

export default function PredefinedTextShadows({ onSelectShadow }: PredefinedTextShadowsProps) {
  const [templates, setTemplates] = useState(predefinedTextShadows);
  
  const handleRandomShadow = () => {
    const randomParams = generateRandomTextShadow();
    onSelectShadow(randomParams);
  };
  
  const regenerateTemplates = () => {
    // Generate completely new random templates instead of shuffling
    const newTemplates = Array.from({ length: templates.length }, (_, index) => {
      const params = generateRandomTextShadow();
      const rgba = `rgba(${parseInt(params.color.slice(1, 3), 16)}, ${parseInt(params.color.slice(3, 5), 16)}, ${parseInt(params.color.slice(5, 7), 16)}, ${params.opacity})`;
      
      return {
        name: `Shadow ${index + 1}`,
        type: "text" as const,
        css: `${params.horizontalOffset}px ${params.verticalOffset}px ${params.blur}px ${rgba}`,
        params
      };
    });
    
    setTemplates(newTemplates);
  };
  
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Predefined Text Shadows</h3>
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
            onClick={() => onSelectShadow(shadow.params)}
          >
            <div className="flex flex-col items-center">
              <div 
                className="h-16 flex items-center justify-center mb-2 w-full"
              >
                <span
                  className="text-lg font-bold"
                  style={{ 
                    textShadow: shadow.css,
                    color: "#ffffff" 
                  }}
                >
                  Aa
                </span>
              </div>
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