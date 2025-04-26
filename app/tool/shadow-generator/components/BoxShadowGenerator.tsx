"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Clipboard, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PredefinedBoxShadows from "./PredefinedBoxShadows";

interface BoxShadowParams {
  horizontalOffset: number;
  verticalOffset: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export default function BoxShadowGenerator() {
  const [boxShadowParams, setBoxShadowParams] = useState<BoxShadowParams>({
    horizontalOffset: 5,
    verticalOffset: 5,
    blur: 10,
    spread: 0,
    color: "#000000",
    opacity: 0.5,
    inset: false,
  });

  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [boxColor, setBoxColor] = useState("#fcfcfc");

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const rgbaColor = hexToRgba(boxShadowParams.color, boxShadowParams.opacity);
  
  const generateBoxShadowCSS = () => {
    const { horizontalOffset, verticalOffset, blur, spread, inset } = boxShadowParams;
    return `${inset ? 'inset ' : ''}${horizontalOffset}px ${verticalOffset}px ${blur}px ${spread}px ${rgbaColor}`;
  };
  
  const boxShadowCSS = generateBoxShadowCSS();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`box-shadow: ${boxShadowCSS};`);
    toast({
      title: "Copied to clipboard",
      description: "CSS has been copied to your clipboard",
    });
  };
  
  const resetValues = () => {
    setBoxShadowParams({
      horizontalOffset: 5,
      verticalOffset: 5,
      blur: 10,
      spread: 0,
      color: "#000000",
      opacity: 0.5,
      inset: false,
    });
    setBackgroundColor("#ffffff");
    setBoxColor("#4f46e5");
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Section */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-80 flex items-center justify-center" style={{ backgroundColor }}>
            <div 
              className="w-40 h-40 rounded-md transition-all duration-300" 
              style={{ 
                backgroundColor: boxColor,
                boxShadow: boxShadowCSS
              }}
            ></div>
          </Card>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex mt-1">
                  <Input 
                    type="color"
                    id="background-color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 p-1 mr-2"
                  />
                  <Input 
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="box-color">Box Color</Label>
                <div className="flex mt-1">
                  <Input 
                    type="color"
                    id="box-color"
                    value={boxColor}
                    onChange={(e) => setBoxColor(e.target.value)}
                    className="w-10 h-10 p-1 mr-2"
                  />
                  <Input 
                    type="text"
                    value={boxColor}
                    onChange={(e) => setBoxColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">CSS Output</Label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetValues}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
              <pre className="mt-2 p-2 bg-background rounded border text-sm overflow-x-auto">
                {`box-shadow: ${boxShadowCSS};`}
              </pre>
            </div>
          </div>
        </div>
        
        {/* Controls Section */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Horizontal Offset: {boxShadowParams.horizontalOffset}px</Label>
                </div>
                <Slider 
                  value={[boxShadowParams.horizontalOffset]} 
                  min={-50} 
                  max={50} 
                  step={1}
                  onValueChange={(value) => setBoxShadowParams({...boxShadowParams, horizontalOffset: value[0]})}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Vertical Offset: {boxShadowParams.verticalOffset}px</Label>
                </div>
                <Slider 
                  value={[boxShadowParams.verticalOffset]} 
                  min={-50} 
                  max={50} 
                  step={1}
                  onValueChange={(value) => setBoxShadowParams({...boxShadowParams, verticalOffset: value[0]})}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Blur Radius: {boxShadowParams.blur}px</Label>
                </div>
                <Slider 
                  value={[boxShadowParams.blur]} 
                  min={0} 
                  max={100} 
                  step={1}
                  onValueChange={(value) => setBoxShadowParams({...boxShadowParams, blur: value[0]})}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Spread Radius: {boxShadowParams.spread}px</Label>
                </div>
                <Slider 
                  value={[boxShadowParams.spread]} 
                  min={-50} 
                  max={100} 
                  step={1}
                  onValueChange={(value) => setBoxShadowParams({...boxShadowParams, spread: value[0]})}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Shadow Color</Label>
                </div>
                <div className="flex mt-1">
                  <Input 
                    type="color"
                    value={boxShadowParams.color}
                    onChange={(e) => setBoxShadowParams({...boxShadowParams, color: e.target.value})}
                    className="w-10 h-10 p-1 mr-2"
                  />
                  <Input 
                    type="text"
                    value={boxShadowParams.color}
                    onChange={(e) => setBoxShadowParams({...boxShadowParams, color: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Opacity: {Math.round(boxShadowParams.opacity * 100)}%</Label>
                </div>
                <Slider 
                  value={[boxShadowParams.opacity * 100]} 
                  min={0} 
                  max={100} 
                  step={1}
                  onValueChange={(value) => setBoxShadowParams({...boxShadowParams, opacity: value[0] / 100})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="inset" 
                  checked={boxShadowParams.inset}
                  onCheckedChange={(checked) => setBoxShadowParams({...boxShadowParams, inset: checked})}
                />
                <Label htmlFor="inset">Inset Shadow</Label>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <PredefinedBoxShadows onSelectShadow={setBoxShadowParams} />
    </div>
  );
} 