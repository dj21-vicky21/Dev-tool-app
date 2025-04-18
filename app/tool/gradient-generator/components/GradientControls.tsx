"use client";

import { Pipette, Plus, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { HexColorPicker, RgbaColorPicker } from "react-colorful";
import { GradientControlsProps, ColorStop } from "./types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the EyeDropper interface for TypeScript
interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperConstructor {
  new(): {
    open: () => Promise<EyeDropperResult>;
  };
}

export default function GradientControls({
  colorStops,
  setColorStops,
  gradientType,
  setGradientType,
  rotation,
  setRotation,
}: GradientControlsProps) {
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);
  const activeStop = colorStops[activeStopIndex];
  const colorStopRangeRef = useRef<HTMLDivElement>(null);
  
  // Eyedropper API support
  const supportsEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  const handleColorChange = (newColor: string) => {
    const newStops = [...colorStops];
    newStops[activeStopIndex] = {
      ...newStops[activeStopIndex],
      color: newColor,
    };
    setColorStops(newStops);
  };
  
  const handleRgbaChange = (rgba: { r: number; g: number; b: number; a: number }) => {
    const { r, g, b, a } = rgba;
    const rgbaColor = `rgba(${r}, ${g}, ${b}, ${a})`;
    
    const newStops = [...colorStops];
    newStops[activeStopIndex] = {
      ...newStops[activeStopIndex],
      color: rgbaColor,
    };
    setColorStops(newStops);
  };
  
  const pickColor = async () => {
    if (!supportsEyeDropper) return;
    
    try {
      // Use the defined interface to avoid 'any'
      const EyeDropper = window.EyeDropper as unknown as EyeDropperConstructor;
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      handleColorChange(result.sRGBHex);
    } catch {
      console.log('User canceled the eyedropper');
    }
  };

  const handleColorStopClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!colorStopRangeRef.current) return;
    
    const rect = colorStopRangeRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const totalWidth = rect.width;
    const percentage = Math.min(Math.max((clickPosition / totalWidth) * 100, 0), 100);
    
    // Check if user clicked near an existing stop
    const clickedNearStop = colorStops.some((stop, index) => {
      const stopX = (stop.position / 100) * totalWidth;
      const distance = Math.abs(clickPosition - stopX);
      if (distance < 15) { // 15px tolerance
        setActiveStopIndex(index);
        return true;
      }
      return false;
    });
    
    // If not near a stop, add a new one
    if (!clickedNearStop && colorStops.length < 5) {
      addColorStop(Math.round(percentage));
    }
  };
  
  const handleColorStopDrag = (e: React.MouseEvent<HTMLButtonElement>, index: number, isClick: boolean = false) => {
    if (isClick) {
      setActiveStopIndex(index);
      return;
    }
    
    e.preventDefault();
    setActiveStopIndex(index);
    
    const startX = e.clientX;
    const startPosition = colorStops[index].position;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!colorStopRangeRef.current) return;
      
      const rect = colorStopRangeRef.current.getBoundingClientRect();
      const deltaX = moveEvent.clientX - startX;
      const deltaPercentage = (deltaX / rect.width) * 100;
      const newPosition = Math.min(Math.max(startPosition + deltaPercentage, 0), 100);
      
      const newStops = [...colorStops];
      newStops[index] = {
        ...newStops[index],
        position: Math.round(newPosition),
      };
      setColorStops(newStops.sort((a, b) => a.position - b.position));
      
      // Find the new index of the current stop after sorting
      const newIndex = newStops.sort((a, b) => a.position - b.position)
        .findIndex(stop => stop === newStops[index]);
      setActiveStopIndex(newIndex >= 0 ? newIndex : index);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRotationChange = (newRotation: number[]) => {
    setRotation(newRotation[0]);
  };
  
  const handleRotationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setRotation(Math.min(Math.max(value, 0), 359));
    }
  };
  
  const handleRotationInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setRotation(0);
    }
  };

  const addColorStop = (position?: number) => {
    if (colorStops.length >= 5) return; // Limit to 5 stops for simplicity

    // Find a position between existing stops if not provided
    let newPosition = position ?? 50;
    if (!position && colorStops.length >= 2) {
      // Find the largest gap
      let maxGap = 0;
      let maxGapPos = 50;
      
      for (let i = 0; i < colorStops.length - 1; i++) {
        const gap = colorStops[i + 1].position - colorStops[i].position;
        if (gap > maxGap) {
          maxGap = gap;
          maxGapPos = colorStops[i].position + gap / 2;
        }
      }
      
      newPosition = Math.round(maxGapPos);
    }

    const newStop: ColorStop = {
      color: "#FFFFFF",
      position: newPosition,
    };

    const newStops = [...colorStops, newStop].sort((a, b) => a.position - b.position);
    setColorStops(newStops);
    
    // Find the index of the new stop in the sorted array
    const newIndex = newStops.findIndex(
      stop => stop.color === newStop.color && stop.position === newStop.position
    );
    
    setActiveStopIndex(newIndex >= 0 ? newIndex : activeStopIndex);
  };

  const removeColorStop = () => {
    if (colorStops.length <= 2) return; // Minimum 2 color stops

    const newStops = colorStops.filter((_, index) => index !== activeStopIndex);
    setColorStops(newStops);
    setActiveStopIndex(Math.min(activeStopIndex, newStops.length - 1));
  };
  
  // Parse color to rgba format for the picker
  const parseColor = (color: string) => {
    // For hex colors
    if (color.startsWith('#')) {
      return { 
        r: parseInt(color.slice(1, 3), 16), 
        g: parseInt(color.slice(3, 5), 16), 
        b: parseInt(color.slice(5, 7), 16),
        a: 1
      };
    }
    
    // For rgba colors
    const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
    if (rgba) {
      return {
        r: parseInt(rgba[1], 10),
        g: parseInt(rgba[2], 10),
        b: parseInt(rgba[3], 10),
        a: rgba[4] ? parseFloat(rgba[4]) : 1
      };
    }
    
    // Default to black if color can't be parsed
    return { r: 0, g: 0, b: 0, a: 1 };
  };

  return (
    <Card className="h-full p-4 space-y-4 flex flex-col">
      {/* Color Stops Section */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Color Stops</Label>
        
        <div 
          ref={colorStopRangeRef}
          className="relative h-8 bg-gray-200 dark:bg-gray-800 rounded-md cursor-pointer"
          onClick={handleColorStopClick}
        >
          <div 
            className="absolute inset-0 rounded-md"
            style={{
              backgroundImage: `linear-gradient(to right, ${colorStops
                .map((stop) => `${stop.color} ${stop.position}%`)
                .join(", ")})`,
            }}
          />
          
          {colorStops.map((stop, index) => (
            <button
              key={`${stop.color}-${stop.position}`}
              className={`absolute top-1/2 w-6 h-6 -ml-3 rounded-full border-2 transform -translate-y-1/2 cursor-move transition-all ${
                index === activeStopIndex
                  ? "border-black dark:border-white ring-2 ring-blue-500 z-10"
                  : "border-gray-400"
              }`}
              style={{
                backgroundColor: stop.color,
                left: `${stop.position}%`,
              }}
              onMouseDown={(e) => handleColorStopDrag(e, index)}
              onClick={(e) => {
                e.stopPropagation();
                handleColorStopDrag(e, index, true);
              }}
            />
          ))}
        </div>
        
        <div className="flex justify-between mt-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => addColorStop()}
            disabled={colorStops.length >= 5}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Stop
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={removeColorStop}
            disabled={colorStops.length <= 2}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
      
      {/* Gradient Type Section */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Gradient Type</Label>
        <div className="flex gap-2">
          <Button
            variant={gradientType === "linear" ? "default" : "outline"}
            onClick={() => setGradientType("linear")}
            className="flex-1"
          >
            Linear
          </Button>
          <Button
            variant={gradientType === "radial" ? "default" : "outline"}
            onClick={() => setGradientType("radial")}
            className="flex-1"
          >
            Radial
          </Button>
        </div>
      </div>
      
      {/* Linear Gradient Rotation */}
      {gradientType === "linear" && (
        <div className="space-y-2">
          <Label htmlFor="rotation">Rotation</Label>
          <div className="flex gap-2 items-center">
            <Slider
              id="rotation"
              min={0}
              max={359}
              step={1}
              value={[rotation]}
              onValueChange={handleRotationChange}
              className="flex-1"
            />
            <Input
              type="number"
              value={rotation}
              onChange={handleRotationInputChange}
              onBlur={handleRotationInputBlur}
              min={0}
              max={359}
              className="w-20"
            />
          </div>
        </div>
      )}
      
      {/* Color Picker Section */}
      {activeStop && (
        <div className="space-y-3 mt-2 border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-lg font-semibold">Color Editor</Label>
            <div className="flex items-center gap-1">
              <div
                className="w-8 h-8 rounded-md border shadow-sm"
                style={{ backgroundColor: activeStop.color }}
              />
              <div className="text-sm text-muted-foreground">
                {activeStop.position}%
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Input
                id="color"
                onFocus={(e) => e.target.select()}
                value={activeStop.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="font-mono text-sm pl-10"
              />
              <div 
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-sm border"
                style={{ backgroundColor: activeStop.color }}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-10 w-10 p-0 border-2"
                  style={{ 
                    backgroundColor: activeStop.color,
                    boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <span className="sr-only">Open color picker</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="end">
                <Tabs defaultValue="hex" className="w-[260px]">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="hex" className="flex-1">Hex</TabsTrigger>
                    <TabsTrigger value="rgba" className="flex-1">RGBA</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="hex" className="mt-0 space-y-4">
                    <HexColorPicker
                      color={activeStop.color.startsWith('#') ? activeStop.color : '#ffffff'}
                      onChange={handleColorChange}
                      className="w-full !h-[180px]"
                    />
                  </TabsContent>
                  
                  <TabsContent value="rgba" className="mt-0 space-y-4">
                    <RgbaColorPicker
                      color={parseColor(activeStop.color)}
                      onChange={handleRgbaChange}
                      className="w-full"
                    />
                  </TabsContent>
                  
                  <div className="flex justify-between mt-4 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleColorChange('#FFFFFF')}
                    >
                      Reset
                    </Button>
                    
                    {supportsEyeDropper && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={pickColor}
                        className="text-xs"
                      >
                        <Pipette className="h-3 w-3 mr-1" />
                        Pick Color
                      </Button>
                    )}
                  </div>
                </Tabs>
              </PopoverContent>
            </Popover>
            
            {supportsEyeDropper && (
              <Button
                variant="outline"
                size="icon"
                onClick={pickColor}
                className="h-10 w-10"
                title="Pick color from screen"
              >
                <Pipette className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
} 