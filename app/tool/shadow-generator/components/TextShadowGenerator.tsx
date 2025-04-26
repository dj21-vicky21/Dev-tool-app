"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clipboard, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import PredefinedTextShadows from "./PredefinedTextShadows";

interface TextShadowParams {
  horizontalOffset: number;
  verticalOffset: number;
  blur: number;
  color: string;
  opacity: number;
}

export default function TextShadowGenerator() {
  const [textShadowParams, setTextShadowParams] = useState<TextShadowParams>({
    horizontalOffset: 2,
    verticalOffset: 2,
    blur: 4,
    color: "#000000",
    opacity: 0.5,
  });

  const [sampleText, setSampleText] = useState("Hello world");
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#fcfcfc");
  const [fontSize, setFontSize] = useState(36);

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const rgbaColor = hexToRgba(textShadowParams.color, textShadowParams.opacity);
  
  const generateTextShadowCSS = () => {
    const { horizontalOffset, verticalOffset, blur } = textShadowParams;
    return `${horizontalOffset}px ${verticalOffset}px ${blur}px ${rgbaColor}`;
  };
  
  const textShadowCSS = generateTextShadowCSS();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`text-shadow: ${textShadowCSS};`);
    toast({
      title: "Copied to clipboard",
      description: "CSS has been copied to your clipboard",
    });
  };
  
  const resetValues = () => {
    setTextShadowParams({
      horizontalOffset: 2,
      verticalOffset: 2,
      blur: 4,
      color: "#000000",
      opacity: 0.5,
    });
    setSampleText("Sample Text");
    setTextColor("#ffffff");
    setBackgroundColor("#4f46e5");
    setFontSize(36);
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Section */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-80 flex items-center justify-center" style={{ backgroundColor }}>
            <div 
              className="text-center transition-all duration-300 font-bold" 
              style={{ 
                color: textColor,
                textShadow: textShadowCSS,
                fontSize: `${fontSize}px`,
              }}
            >
              {sampleText}
            </div>
          </Card>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sample-text">Sample Text</Label>
                <Textarea 
                  id="sample-text"
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  className="mt-1 resize-none h-24"
                  placeholder="Enter text to preview"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                  <Slider 
                    id="font-size"
                    value={[fontSize]} 
                    min={12} 
                    max={72} 
                    step={1}
                    onValueChange={(value) => setFontSize(value[0])}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex mt-1">
                    <Input 
                      type="color"
                      id="text-color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 p-1 mr-2"
                    />
                    <Input 
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
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
                {`text-shadow: ${textShadowCSS};`}
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
                  <Label>Horizontal Offset: {textShadowParams.horizontalOffset}px</Label>
                </div>
                <Slider 
                  value={[textShadowParams.horizontalOffset]} 
                  min={-20} 
                  max={20} 
                  step={1}
                  onValueChange={(value) => setTextShadowParams({...textShadowParams, horizontalOffset: value[0]})}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Vertical Offset: {textShadowParams.verticalOffset}px</Label>
                </div>
                <Slider 
                  value={[textShadowParams.verticalOffset]} 
                  min={-20} 
                  max={20} 
                  step={1}
                  onValueChange={(value) => setTextShadowParams({...textShadowParams, verticalOffset: value[0]})}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Blur Radius: {textShadowParams.blur}px</Label>
                </div>
                <Slider 
                  value={[textShadowParams.blur]} 
                  min={0} 
                  max={20} 
                  step={1}
                  onValueChange={(value) => setTextShadowParams({...textShadowParams, blur: value[0]})}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Shadow Color</Label>
                </div>
                <div className="flex mt-1">
                  <Input 
                    type="color"
                    value={textShadowParams.color}
                    onChange={(e) => setTextShadowParams({...textShadowParams, color: e.target.value})}
                    className="w-10 h-10 p-1 mr-2"
                  />
                  <Input 
                    type="text"
                    value={textShadowParams.color}
                    onChange={(e) => setTextShadowParams({...textShadowParams, color: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Opacity: {Math.round(textShadowParams.opacity * 100)}%</Label>
                </div>
                <Slider 
                  value={[textShadowParams.opacity * 100]} 
                  min={0} 
                  max={100} 
                  step={1}
                  onValueChange={(value) => setTextShadowParams({...textShadowParams, opacity: value[0] / 100})}
                />
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  Multiple shadows can be added by separating each shadow with a comma in your CSS.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <PredefinedTextShadows onSelectShadow={setTextShadowParams} />
    </div>
  );
} 