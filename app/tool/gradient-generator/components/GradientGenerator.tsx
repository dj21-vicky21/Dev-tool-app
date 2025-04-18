"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorStop } from "./types";
import GradientPreview from "./GradientPreview";
import GradientControls from "./GradientControls";
import CodeOutput from "./CodeOutput";
import PredefinedGradients from "./PredefinedGradients";
import { Separator } from "@/components/ui/separator";

export default function GradientGenerator() {
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { color: "#2A7B9B", position: 0 },
    { color: "#57C785", position: 50 },
    { color: "#EDDD53", position: 100 },
  ]);
  
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [rotation, setRotation] = useState<number>(90);
  const [activeTab, setActiveTab] = useState<string>("css");
  
  const generateRandomGradient = () => {
    const randomColor = () => {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
    
    const numStops = 2 + Math.floor(Math.random() * 2); // 2-3 stops
    
    const newStops: ColorStop[] = [];
    
    for (let i = 0; i < numStops; i++) {
      newStops.push({
        color: randomColor(),
        position: i === 0 ? 0 : i === numStops - 1 ? 100 : Math.floor(Math.random() * 80) + 10,
      });
    }
    
    // Sort by position
    newStops.sort((a, b) => a.position - b.position);
    
    // 50% chance of radial gradient
    const randomType = Math.random() > 0.5 ? "linear" : "radial";
    setGradientType(randomType as "linear" | "radial");
    setColorStops(newStops);
    setRotation(Math.floor(Math.random() * 360));
  };

  const handlePresetSelect = (
    stops: ColorStop[], 
    type: "linear" | "radial", 
    rotation: number
  ) => {
    setColorStops(stops);
    setGradientType(type);
    setRotation(rotation);
  };

  return (
    <div className="space-y-6">
      {/* Top Section - Preview and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Preview - Takes up 2/3 on medium screens and above */}
        <div className="md:col-span-2">
          <GradientPreview 
            colorStops={colorStops} 
            gradientType={gradientType}
            rotation={rotation}
          />
        </div>
        
        {/* Controls - Color stop bar and type selector */}
        <div className="md:col-span-1">
          <GradientControls
            colorStops={colorStops}
            setColorStops={setColorStops}
            gradientType={gradientType}
            setGradientType={setGradientType}
            rotation={rotation}
            setRotation={setRotation}
          />
        </div>
      </div>
      
      {/* Bottom Section - Code Output */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Code Output</Label>
          <div className="flex gap-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={generateRandomGradient}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Random
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="css" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="values">Values</TabsTrigger>
          </TabsList>
          
          <CodeOutput 
            colorStops={colorStops}
            gradientType={gradientType}
            rotation={rotation}
            activeTab={activeTab}
          />
        </Tabs>
      </div>
      
      <Separator />
      
      {/* Predefined Gradients Section */}
      <div>
        <PredefinedGradients onSelectGradient={handlePresetSelect} />
      </div>
    </div>
  );
} 