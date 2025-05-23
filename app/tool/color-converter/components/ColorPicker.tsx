"use client";

import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Copy, Check, Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import useColorConvertorStore from "@/store/colorConvertor";
import colorUtil from "@/lib/colorUtils";

// Helper function to validate hex
const isValidHex = (hex: string): boolean => {
  // Add # if missing
  const hexWithHash = hex.startsWith('#') ? hex : `#${hex}`;
  return /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hexWithHash);
};

export default function ColorPicker() {
  const { toast } = useToast();
  const { 
    color, setColor, 
    rgb, setRgb, 
    hsl, setHsl, 
    cmyk, setCmyk,
    addRecentColor, addToHistory
  } = useColorConvertorStore();
  
  const [inputHex, setInputHex] = useState(color);
  const [copied, setCopied] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize on client
  useEffect(() => {
    setIsClient(true);
    updateAllFormats(color);
  }, []);

  // Update hex input when color changes
  useEffect(() => {
    // Remove # from the beginning for display
    setInputHex(color.startsWith('#') ? color.substring(1) : color);
  }, [color]);

  // Update all color formats based on hex
  const updateAllFormats = (hexValue: string) => {
    try {
      if (isValidHex(hexValue)) {
        // Update main color
        setColor(hexValue);
        
        // Update all formats
        const rgbValue = colorUtil.hexToRgb(hexValue);
        const hslValue = colorUtil.hexToHsl(hexValue);
        const cmykValue = colorUtil.hexToCmyk(hexValue);
        
        setRgb(rgbValue);
        setHsl(hslValue);
        setCmyk(cmykValue);
        
        // Add to history
        const namedColor = colorUtil.getClosestNamedColor(hexValue);
        addToHistory({
          hex: hexValue,
          rgb: rgbValue,
          name: namedColor.distance < 10 ? namedColor.name : undefined,
          timestamp: Date.now()
        });
        
        // Add to recent colors
        addRecentColor(hexValue);
      }
    } catch (error) {
      console.error("Error updating formats:", error);
    }
  };

  // Handle hex input change
  const handleHexChange = (value: string) => {
    // Add # if it doesn't exist
    const hexValue = value.startsWith('#') ? value : `#${value}`;
    
    // Always update the input field - remove # for display
    setInputHex(value);
    
    // Only update the color when the hex is valid
    if (isValidHex(hexValue)) {
      updateAllFormats(hexValue);
    }
  };

  // Handle RGB changes
  const handleRgbChange = (component: 'r' | 'g' | 'b' | 'a', value: number) => {
    const newRgb = { ...rgb, [component]: value };
    setRgb(newRgb);
    
    const newHex = colorUtil.rgbToHex(newRgb);
    updateAllFormats(newHex);
  };

  // Handle HSL changes
  const handleHslChange = (component: 'h' | 's' | 'l' | 'a', value: number) => {
    const newHsl = { ...hsl, [component]: value };
    setHsl(newHsl);
    
    const newHex = colorUtil.hslToHex(newHsl);
    updateAllFormats(newHex);
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      
      toast({
        title: "Color copied",
        description: (
          <div className="flex items-center gap-2">
            <div 
              className="h-4 w-4 rounded border border-border" 
              style={{ backgroundColor: color }}
            />
            <span>Copied {text}</span>
          </div>
        ),
      });

      // Clear the copied state after 2 seconds
      setTimeout(() => {
        if (copied === text) {
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

  // Update color when using color picker or eyedropper
  const updateColorWithToast = (newColor: string) => {
    updateAllFormats(newColor);
    
    // toast({
    //   title: "Color updated",
    //   description: (
    //     <div className="flex items-center gap-2">
    //       <div 
    //         className="h-4 w-4 rounded border border-border" 
    //         style={{ backgroundColor: newColor }}
    //       />
    //       <span>Updated fill to {newColor}</span>
    //     </div>
    //   ),
    // });
  };

  // Check if the browser supports EyeDropper API
  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  // Use EyeDropper to pick color from screen
  const pickColor = async () => {
    try {
      // @ts-expect-error - EyeDropper is not in the standard lib.dom
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      updateColorWithToast(result.sRGBHex);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not access the color picker",
        variant: "destructive"
      });
    }
  };

  // Don't render on server
  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Color picker */}
        <div className="flex-1 min-w-[280px]">
          <HexColorPicker 
            color={color} 
            onChange={updateColorWithToast} 
            className="w-full !h-[280px]"
          />
          
          {/* Color preview and hex input */}
          <div className="flex items-center mt-4 gap-2">
            <div 
              className="h-10 w-10 rounded-md border"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 relative">
              <Input
                value={inputHex.startsWith('#') ? inputHex.substring(1) : inputHex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="pl-8 font-mono"
                placeholder="000000"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">#</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(color)}
              className="h-10 w-10 hover:bg-muted/50 copy-icon-transition"
            >
              <span className="w-4 h-4 relative">
                <Copy className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === color ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} transition-all duration-200`} />
                <Check className={`h-4 w-4 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === color ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all duration-200`} />
              </span>
            </Button>
            {hasEyeDropper && (
              <Button
                variant="outline"
                size="icon"
                onClick={pickColor}
                className="h-10 w-10 hover:bg-muted/50 copy-icon-transition"
                title="Pick color from screen"
              >
                <Pipette className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Color adjustments */}
        <div className="flex-1 flex flex-col gap-6">
          {/* RGB Sliders */}
          <div>
            <h3 className="text-sm font-medium mb-3">RGB</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Red</span>
                  <span className="text-xs font-mono">{rgb.r}</span>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-md pointer-events-none" 
                    style={{
                      background: `linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))`,
                      height: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} 
                  />
                  <Slider 
                    value={[rgb.r]} 
                    min={0} 
                    max={255} 
                    step={1}
                    onValueChange={(value) => handleRgbChange('r', value[0])}
                    className="z-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Green</span>
                  <span className="text-xs font-mono">{rgb.g}</span>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-md pointer-events-none" 
                    style={{
                      background: `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))`,
                      height: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} 
                  />
                  <Slider 
                    value={[rgb.g]} 
                    min={0} 
                    max={255} 
                    step={1}
                    onValueChange={(value) => handleRgbChange('g', value[0])}
                    className="z-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Blue</span>
                  <span className="text-xs font-mono">{rgb.b}</span>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-md pointer-events-none" 
                    style={{
                      background: `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))`,
                      height: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} 
                  />
                  <Slider 
                    value={[rgb.b]} 
                    min={0} 
                    max={255} 
                    step={1}
                    onValueChange={(value) => handleRgbChange('b', value[0])}
                    className="z-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Alpha</span>
                  <span className="text-xs font-mono">{rgb.a.toFixed(2)}</span>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-md pointer-events-none" 
                    style={{
                      background: `linear-gradient(to right, transparent, rgb(${rgb.r}, ${rgb.g}, ${rgb.b})), 
                                   repeating-conic-gradient(#808080 0% 25%, white 0% 50%) 
                                   50% / 10px 10px`,
                      height: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} 
                  />
                  <Slider 
                    value={[rgb.a * 100]} 
                    min={0} 
                    max={100} 
                    step={1}
                    onValueChange={(value) => handleRgbChange('a', value[0] / 100)}
                    className="z-10"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* HSL Sliders */}
          <div>
            <h3 className="text-sm font-medium mb-3">HSL</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Hue</span>
                  <span className="text-xs font-mono">{hsl.h}°</span>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-md pointer-events-none" 
                    style={{
                      background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                      height: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} 
                  />
                  <Slider 
                    value={[hsl.h]} 
                    min={0} 
                    max={360} 
                    step={1}
                    onValueChange={(value) => handleHslChange('h', value[0])}
                    className="z-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Saturation</span>
                  <span className="text-xs font-mono">{hsl.s}%</span>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-md pointer-events-none" 
                    style={{
                      background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`,
                      height: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} 
                  />
                  <Slider 
                    value={[hsl.s]} 
                    min={0} 
                    max={100} 
                    step={1}
                    onValueChange={(value) => handleHslChange('s', value[0])}
                    className="z-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Lightness</span>
                  <span className="text-xs font-mono">{hsl.l}%</span>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-md pointer-events-none" 
                    style={{
                      background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`,
                      height: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} 
                  />
                  <Slider 
                    value={[hsl.l]} 
                    min={0} 
                    max={100} 
                    step={1}
                    onValueChange={(value) => handleHslChange('l', value[0])}
                    className="z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Color information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">HEX</div>
          <div className="flex items-center">
            <code className="text-sm font-mono flex-1">{color}</code>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 hover:bg-muted/50 rounded-full copy-icon-transition"
              onClick={() => copyToClipboard(color)}
            >
              <span className="w-3 h-3 relative">
                <Copy className={`h-3 w-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === color ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} transition-all duration-200`} />
                <Check className={`h-3 w-3 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === color ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all duration-200`} />
              </span>
            </Button>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">RGB</div>
          <div className="flex items-center">
            <code className="text-sm font-mono flex-1">
              {colorUtil.formatRgb(rgb)}
            </code>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 hover:bg-muted/50 rounded-full copy-icon-transition"
              onClick={() => copyToClipboard(colorUtil.formatRgb(rgb))}
            >
              <span className="w-3 h-3 relative">
                <Copy className={`h-3 w-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === colorUtil.formatRgb(rgb) ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} transition-all duration-200`} />
                <Check className={`h-3 w-3 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === colorUtil.formatRgb(rgb) ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all duration-200`} />
              </span>
            </Button>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">HSL</div>
          <div className="flex items-center">
            <code className="text-sm font-mono flex-1">
              {colorUtil.formatHsl(hsl)}
            </code>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 hover:bg-muted/50 rounded-full copy-icon-transition"
              onClick={() => copyToClipboard(colorUtil.formatHsl(hsl))}
            >
              <span className="w-3 h-3 relative">
                <Copy className={`h-3 w-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === colorUtil.formatHsl(hsl) ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} transition-all duration-200`} />
                <Check className={`h-3 w-3 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === colorUtil.formatHsl(hsl) ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all duration-200`} />
              </span>
            </Button>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">CMYK</div>
          <div className="flex items-center">
            <code className="text-sm font-mono flex-1">
              {colorUtil.formatCmyk(cmyk)}
            </code>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 hover:bg-muted/50 rounded-full copy-icon-transition"
              onClick={() => copyToClipboard(colorUtil.formatCmyk(cmyk))}
            >
              <span className="w-3 h-3 relative">
                <Copy className={`h-3 w-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === colorUtil.formatCmyk(cmyk) ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} transition-all duration-200`} />
                <Check className={`h-3 w-3 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${copied === colorUtil.formatCmyk(cmyk) ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all duration-200`} />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 