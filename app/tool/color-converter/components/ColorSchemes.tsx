"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import colorUtil from "@/lib/colorUtils";

type ColorSchemeProps = {
  currentColor: string;
};

export default function ColorSchemes({ currentColor }: ColorSchemeProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("harmonies");

  // Generate color schemes
  const complementary = colorUtil.getComplementaryColor(currentColor);
  const analogous = colorUtil.getAnalogousColors(currentColor, 3);
  const triadic = colorUtil.getTriadColors(currentColor);
  const tetradic = colorUtil.getTetradColors(currentColor);
  const shades = colorUtil.getShades(currentColor, 5);
  const tints = colorUtil.getTints(currentColor, 5);

  // Copy color to clipboard
  const copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(color);
      
      toast({
        title: "Color copied",
        description: (
          <div className="flex items-center gap-2">
            <div 
              className="h-4 w-4 rounded border border-border" 
              style={{ backgroundColor: color.startsWith('#') ? color : currentColor }}
            />
            <span>Copied {color}</span>
          </div>
        ),
      });

      // Clear the copied state after 2 seconds
      setTimeout(() => {
        if (copied === color) {
          setCopied(null);
        }
      }, 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  // Get readable text color for a background
  const getTextColor = (bgColor: string) => {
    return colorUtil.isLightColor(bgColor) ? "#000000" : "#ffffff";
  };

  // Calculate contrast ratio with white and black
  const getAccessibility = (color: string) => {
    const whiteContrast = colorUtil.getContrastRatio(color, "#ffffff");
    const blackContrast = colorUtil.getContrastRatio(color, "#000000");
    
    const whitePass = {
      aa: whiteContrast >= 4.5,
      aaa: whiteContrast >= 7
    };
    
    const blackPass = {
      aa: blackContrast >= 4.5,
      aaa: blackContrast >= 7
    };
    
    return { white: { contrast: whiteContrast, ...whitePass }, black: { contrast: blackContrast, ...blackPass } };
  };

  // Check if a color will be accessible when used with white or black text
  const accessibility = getAccessibility(currentColor);

  // Render a color swatch with copy functionality
  const ColorSwatch = ({ color, label }: { color: string; label?: string }) => (
    <div className="flex flex-col">
      <div 
        className="h-16 rounded-md relative group"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => copyToClipboard(color)}
            style={{ color: getTextColor(color) }}
            className="h-8 w-8 backdrop-blur-sm bg-white/10 hover:bg-white/20 copy-icon-transition"
          >
            <span className="w-4 h-4 relative">
              <Copy className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === color ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} transition-all duration-200`} />
              <Check className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === color ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all duration-200`} />
            </span>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs mt-1">
        <span className="font-mono truncate">{color}</span>
        {label && <span className="text-muted-foreground ml-2">{label}</span>}
      </div>
    </div>
  );

  return (
    <div className="mt-6">
      <Tabs defaultValue="harmonies" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="harmonies">Color Harmonies</TabsTrigger>
          <TabsTrigger value="variations">Shades & Tints</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>
        
        <TabsContent value="harmonies" className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Complementary</h3>
            <div className="grid grid-cols-2 gap-4">
              <ColorSwatch color={currentColor} label="Base" />
              <ColorSwatch color={complementary} label="Complementary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Analogous</h3>
            <div className="grid grid-cols-3 gap-4">
              {analogous.map((color, index) => (
                <ColorSwatch 
                  key={`analogous-${index}`} 
                  color={color} 
                  label={index === 1 ? "Base" : `${index === 0 ? "-" : "+"}30°`} 
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Triadic</h3>
            <div className="grid grid-cols-3 gap-4">
              {triadic.map((color, index) => (
                <ColorSwatch 
                  key={`triadic-${index}`} 
                  color={color} 
                  label={index === 0 ? "Base" : `+${index * 120}°`} 
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Tetradic</h3>
            <div className="grid grid-cols-4 gap-4">
              {tetradic.map((color, index) => (
                <ColorSwatch 
                  key={`tetradic-${index}`} 
                  color={color} 
                  label={index === 0 ? "Base" : `+${index * 90}°`} 
                />
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="variations" className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Shades (Darker)</h3>
            <div className="grid grid-cols-5 gap-2">
              {shades.map((color, index) => (
                <ColorSwatch 
                  key={`shade-${index}`} 
                  color={color} 
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Tints (Lighter)</h3>
            <div className="grid grid-cols-5 gap-2">
              {tints.map((color, index) => (
                <ColorSwatch 
                  key={`tint-${index}`} 
                  color={color} 
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Closest Named Colors</h3>
            <div className="grid grid-cols-1 gap-4">
              {(() => {
                const closestColor = colorUtil.getClosestNamedColor(currentColor);
                return (
                  closestColor.distance < 30 && (
                    <div className="flex items-center space-x-4">
                      <div
                        className="h-10 w-10 rounded-md"
                        style={{ backgroundColor: closestColor.hex }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{closestColor.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">{closestColor.hex}</div>
                      </div>
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(closestColor.name)}
                        className="hover:bg-muted/50 rounded-full copy-icon-transition"
                      >
                        <span className="w-4 h-4 relative">
                          <Copy className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === closestColor.name ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} transition-all duration-200`} />
                          <Check className={`h-4 w-4 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === closestColor.name ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all duration-200`} />
                        </span>
                      </Button>
                    </div>
                  )
                );
              })()}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="accessibility" className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-medium">Color Contrast</h3>
              <p className="text-xs text-muted-foreground">
                WCAG 2.1 requires a contrast ratio of at least 4.5:1 for normal text (AA) and 7:1 for enhanced contrast (AAA).
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* White text on color background */}
              <div className="border rounded-md overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-center"
                  style={{ backgroundColor: currentColor }}
                >
                  <span className="text-base font-medium" style={{ color: "#ffffff" }}>
                    White text on color
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Contrast ratio:</span>
                    <span className="font-mono text-sm">{accessibility.white.contrast}:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AA compliant:</span>
                    <span className={cn(
                      "text-sm font-medium",
                      accessibility.white.aa ? "text-green-500" : "text-red-500"
                    )}>
                      {accessibility.white.aa ? "Pass ✓" : "Fail ✗"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AAA compliant:</span>
                    <span className={cn(
                      "text-sm font-medium",
                      accessibility.white.aaa ? "text-green-500" : "text-red-500"
                    )}>
                      {accessibility.white.aaa ? "Pass ✓" : "Fail ✗"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Black text on color background */}
              <div className="border rounded-md overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-center"
                  style={{ backgroundColor: currentColor }}
                >
                  <span className="text-base font-medium" style={{ color: "#000000" }}>
                    Black text on color
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Contrast ratio:</span>
                    <span className="font-mono text-sm">{accessibility.black.contrast}:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AA compliant:</span>
                    <span className={cn(
                      "text-sm font-medium",
                      accessibility.black.aa ? "text-green-500" : "text-red-500"
                    )}>
                      {accessibility.black.aa ? "Pass ✓" : "Fail ✗"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AAA compliant:</span>
                    <span className={cn(
                      "text-sm font-medium",
                      accessibility.black.aaa ? "text-green-500" : "text-red-500"
                    )}>
                      {accessibility.black.aaa ? "Pass ✓" : "Fail ✗"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Suggested Text Color</h3>
              <p className="text-xs text-muted-foreground">
                For optimal readability, use this text color with your background color.
              </p>
              
              <div className="border rounded-md overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-center"
                  style={{ 
                    backgroundColor: currentColor,
                    color: colorUtil.getReadableTextColor(currentColor)
                  }}
                >
                  <span className="text-base font-medium">
                    Optimal text color
                  </span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm">Recommended text color:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: colorUtil.getReadableTextColor(currentColor) }}
                    />
                    <span className="font-mono text-sm">
                      {colorUtil.getReadableTextColor(currentColor)}
                    </span>
                    <Button
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(colorUtil.getReadableTextColor(currentColor))}
                      className="h-6 w-6 hover:bg-muted/50 rounded-full copy-icon-transition"
                    >
                      <span className="w-3 h-3 relative">
                        <Copy className={`h-3 w-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === colorUtil.getReadableTextColor(currentColor) ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} transition-all duration-200`} />
                        <Check className={`h-3 w-3 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === colorUtil.getReadableTextColor(currentColor) ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all duration-200`} />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 