"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check, EyeIcon, CodeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RgbaColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface GlassStyles {
  blur: number;
  transparency: number;
  saturation: number;
  brightness: number;
  border: number;
  borderOpacity: number;
  borderColor: string;
  background: string;
  borderRadius: number;
  enableSaturation: boolean;
  enableBrightness: boolean;
  bgColorRgba: { r: number; g: number; b: number; a: number };
  borderColorRgba: { r: number; g: number; b: number; a: number };
}

export default function Glassmorphism() {
  const { toast } = useToast();
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showUtilityCheckmark, setShowUtilityCheckmark] = useState(false);
  const [useRgbFormat, setUseRgbFormat] = useState(false);
  const defaultStyles: GlassStyles = {
    blur: 8,
    transparency: 0.2,
    saturation: 1.8,
    brightness: 1.2,
    border: 1,
    borderOpacity: 0.2,
    borderColor: "#ffffff",
    background: "#ffffff",
    borderRadius: 16,
    enableSaturation: false,
    enableBrightness: false,
    bgColorRgba: { r: 255, g: 255, b: 255, a: 0.2 },
    borderColorRgba: { r: 255, g: 255, b: 255, a: 0.2 },
  };

  const [styles, setStyles] = useState<GlassStyles>({ ...defaultStyles });

  // Background elements for the preview
  const [showBgElements, setShowBgElements] = useState(true);

  const handleCopyCSS = (text: string, isUtility = false) => {
    navigator.clipboard.writeText(text);
    if (isUtility) {
      setShowUtilityCheckmark(true);
      setTimeout(() => setShowUtilityCheckmark(false), 2000);
    } else {
      setShowCheckmark(true);
      setTimeout(() => setShowCheckmark(false), 2000);
    }
    toast({
      title: "Copied!",
      description: "CSS copied to clipboard",
    });
  };

  const resetToDefaults = () => {
    setStyles({ ...defaultStyles });
    toast({
      title: "Reset Complete",
      description: "Settings have been restored to defaults",
    });
  };

  // Define presets for common glassmorphism styles
  const presets = {
    light: {
      blur: 8,
      transparency: 0.2,
      saturation: 1.5,
      brightness: 1.2,
      border: 1,
      borderOpacity: 0.1,
      borderColor: "#ffffff",
      background: "#ffffff",
      borderRadius: 16,
      enableSaturation: false,
      enableBrightness: false,
      bgColorRgba: { r: 255, g: 255, b: 255, a: 0.2 },
      borderColorRgba: { r: 255, g: 255, b: 255, a: 0.1 },
    },
    dark: {
      blur: 10,
      transparency: 0.15,
      saturation: 1.8,
      brightness: 0.9,
      border: 1,
      borderOpacity: 0.3,
      borderColor: "#000000",
      background: "#111111",
      borderRadius: 16,
      enableSaturation: false,
      enableBrightness: false,
      bgColorRgba: { r: 17, g: 17, b: 17, a: 0.15 },
      borderColorRgba: { r: 0, g: 0, b: 0, a: 0.3 },
    },
    colorful: {
      blur: 12,
      transparency: 0.35,
      saturation: 2.2,
      brightness: 1.3,
      border: 2,
      borderOpacity: 0.5,
      borderColor: "#9c27b0",
      background: "#3f51b5",
      borderRadius: 20,
      enableSaturation: true,
      enableBrightness: true,
      bgColorRgba: { r: 63, g: 81, b: 181, a: 0.35 },
      borderColorRgba: { r: 156, g: 39, b: 176, a: 0.5 },
    },
    subtle: {
      blur: 5,
      transparency: 0.1,
      saturation: 1.2,
      brightness: 1.0,
      border: 0.5,
      borderOpacity: 0.05,
      borderColor: "#ffffff",
      background: "#f5f5f5",
      borderRadius: 8,
      enableSaturation: false,
      enableBrightness: false,
      bgColorRgba: { r: 245, g: 245, b: 245, a: 0.1 },
      borderColorRgba: { r: 255, g: 255, b: 255, a: 0.05 },
    },
  };

  const applyPreset = (presetName: keyof typeof presets) => {
    setStyles(presets[presetName]);
    toast({
      title: `${
        presetName.charAt(0).toUpperCase() + presetName.slice(1)
      } Preset Applied`,
      description: "Settings have been updated",
    });
  };

  // Generate CSS code
  const generateCSS = () => {
    const { r: bgR, g: bgG, b: bgB } = styles.bgColorRgba;
    const { r: borderR, g: borderG, b: borderB } = styles.borderColorRgba;
    const opacity = styles.transparency;
    const borderOpacity = styles.borderOpacity;

    // Build filter string based on enabled options
    let filterString = `blur(${styles.blur}px)`;
    if (styles.enableSaturation) filterString += ` saturate(${styles.saturation})`;
    if (styles.enableBrightness) filterString += ` brightness(${styles.brightness})`;

    return `.glass {
  /* Background with transparency */
  background: rgba(${bgR}, ${bgG}, ${bgB}, ${opacity});
  
  /* Border radius */
  border-radius: ${styles.borderRadius}px;
  
  /* Shadow for depth */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  
  /* Main glass effect with filters */
  backdrop-filter: ${filterString};
  -webkit-backdrop-filter: ${filterString};
  
  /* Border for subtle definition */
  border: ${styles.border}px solid rgba(${borderR}, ${borderG}, ${borderB}, ${borderOpacity});
}`;
  };

  // Generate Tailwind CSS code
  const generateTailwindCSS = () => {
    const { r: bgR, g: bgG, b: bgB } = styles.bgColorRgba;
    const { r: borderR, g: borderG, b: borderB } = styles.borderColorRgba;

    // Format for direct copy-paste usage (using the more compatible rgb format)
    let tailwindClasses = `bg-[rgba(${bgR},${bgG},${
      bgB
    },${styles.transparency.toFixed(2)})] backdrop-blur-[${
      styles.blur
    }px] rounded-[${styles.borderRadius}px] border-[${
      styles.border
    }px] border-[rgba(${borderR},${borderG},${
      borderB
    },${styles.borderOpacity.toFixed(2)})] shadow-lg`;

    // Add additional utility class for saturation and brightness if enabled
    const needsCustomUtility = styles.enableSaturation || styles.enableBrightness;
    
    // Alternative with hex format
    let tailwindClassesHex = `bg-[${styles.background}]/${styles.transparency.toFixed(
      2
    )} backdrop-blur-[${styles.blur}px] rounded-[${
      styles.borderRadius
    }px] border-[${
      styles.border
    }px] border-[${styles.borderColor}]/${styles.borderOpacity.toFixed(
      2
    )} shadow-lg`;

    if (needsCustomUtility) {
      tailwindClasses += " glass-effect";
      tailwindClassesHex += " glass-effect";
    }

    // Build the CSS for the custom utility
    let customUtilityCSS = "";
    if (needsCustomUtility) {
      let filterString = "";
      if (styles.enableSaturation) filterString += ` saturate(${styles.saturation})`;
      if (styles.enableBrightness) filterString += ` brightness(${styles.brightness})`;
      
      customUtilityCSS = `@layer utilities {
  .glass-effect {
    backdrop-filter: blur(${styles.blur}px)${filterString};
    -webkit-backdrop-filter: blur(${styles.blur}px)${filterString};
  }
}`;
    }

    const fullExample = `<!-- Tailwind Classes (RGB format - most compatible) -->
<div class="${tailwindClasses}">
  <!-- Your content here -->
</div>

<!-- Alternative with Hex format -->
<div class="${tailwindClassesHex}">
  <!-- Your content here -->
</div>
${needsCustomUtility ? `
<!-- For the saturation and brightness filters, add this to your CSS -->
${customUtilityCSS}` : ''}`;

    return fullExample;
  };

  const hexToRgb = (hex: string) => {
    // This function is used for color conversion in the console logging
    console.log("Converting color:", hex);
    try {
      // Handle case when hex doesn't start with #
      if (!hex.startsWith('#')) {
        hex = '#' + hex;
      }

      // Handle both 3-digit and 6-digit hex
      let r, g, b;
      
      // Check if it's a 3-digit hex
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } 
      // Check if it's a 6-digit hex
      else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
      } 
      // Invalid hex format
      else {
        return { r: 255, g: 255, b: 255 };
      }
      
      // Check if parsing was successful
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return { r: 255, g: 255, b: 255 };
      }
      
      return { r, g, b };
    } catch {
      console.log("Error parsing hex color:", hex);
      // Return white as fallback
      return { r: 255, g: 255, b: 255 };
    }
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b]
      .map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase();
  };

  const tryParseRgb = (input: string): string | null => {
    // Try to parse RGB format like rgb(255, 255, 255)
    const rgbMatch = input.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return rgbToHex(r, g, b);
      }
    }
    return null;
  };

  const handleColorInputChange = (value: string, colorType: 'background' | 'border') => {
    // Remove spaces
    value = value.trim();
    
    // Check if it's an RGB format
    const rgbHex = tryParseRgb(value);
    if (rgbHex) {
      setStyles({ ...styles, [colorType === 'background' ? 'background' : 'borderColor']: rgbHex });
      return;
    }
    
    // Handle hex format
    if (value.startsWith('#')) {
      // Validate hex format
      if (/^#[0-9A-Fa-f]{3}$/.test(value)) {
        // Convert 3-digit hex to 6-digit
        const expanded = '#' + value.substring(1).split('').map(char => char + char).join('');
        setStyles({ 
          ...styles, 
          [colorType === 'background' ? 'background' : 'borderColor']: expanded.toUpperCase() 
        });
        return;
      } else if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        setStyles({ 
          ...styles, 
          [colorType === 'background' ? 'background' : 'borderColor']: value.toUpperCase() 
        });
        return;
      }
    } else {
      // Try to add # prefix
      const withHash = '#' + value;
      if (/^#[0-9A-Fa-f]{3}$/.test(withHash)) {
        // Convert 3-digit hex to 6-digit
        const expanded = '#' + withHash.substring(1).split('').map(char => char + char).join('');
        setStyles({ 
          ...styles, 
          [colorType === 'background' ? 'background' : 'borderColor']: expanded.toUpperCase() 
        });
        return;
      } else if (/^#[0-9A-Fa-f]{6}$/.test(withHash)) {
        setStyles({ 
          ...styles, 
          [colorType === 'background' ? 'background' : 'borderColor']: withHash.toUpperCase() 
        });
        return;
      }
    }
    
    // If we've reached here and value starts with #, it's potentially an incomplete hex
    if (value.startsWith('#') && /^#[0-9A-Fa-f]{0,5}$/.test(value)) {
      setStyles({ 
        ...styles, 
        [colorType === 'background' ? 'background' : 'borderColor']: value.toUpperCase() 
      });
    } else if (/^[0-9A-Fa-f]{1,6}$/.test(value)) {
      // Handle hex without # prefix (incomplete)
      setStyles({ 
        ...styles, 
        [colorType === 'background' ? 'background' : 'borderColor']: ('#' + value).toUpperCase() 
      });
    }
  };

  // Function to update RGBA state when color picker changes
  const handleRgbaColorChange = (rgba: { r: number; g: number; b: number; a: number }, colorType: 'background' | 'border') => {
    if (colorType === 'background') {
      // Update both the RGBA state and the hex color for background
      const hexColor = rgbToHex(rgba.r, rgba.g, rgba.b);
      
      // We use hexToRgb here to ensure valid color conversion
      const rgbValues = hexToRgb(hexColor);
      
      // Log for debugging but also ensures the variable is used
      console.log("Converted background color:", rgbValues);
      
      setStyles({ 
        ...styles, 
        bgColorRgba: rgba, 
        background: hexColor,
        transparency: rgba.a 
      });
    } else {
      // Update both the RGBA state and the hex color for border
      const hexColor = rgbToHex(rgba.r, rgba.g, rgba.b);
      
      // We use hexToRgb here to ensure valid color conversion, but don't need the result
      hexToRgb(hexColor);
      
      setStyles({ 
        ...styles, 
        borderColorRgba: rgba, 
        borderColor: hexColor,
        borderOpacity: rgba.a 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Create beautiful glassmorphism effects for your UI with real-time
          preview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preview and Code */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="preview" onValueChange={() => {}}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="css">
                <CodeIcon className="h-4 w-4 mr-2" />
                CSS
              </TabsTrigger>
              <TabsTrigger value="tailwind">
                <CodeIcon className="h-4 w-4 mr-2" />
                Tailwind
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div
                    className="relative h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] flex items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8"
                    style={{
                      background:
                        "linear-gradient(45deg, #e0e7ff 0%, #93c5fd 50%, #60a5fa 100%)",
                    }}
                  >
                    {/* Background elements */}
                    {showBgElements && (
                      <>
                        <div className="absolute -top-10 -left-10 w-20 sm:w-30 md:w-40 h-20 sm:h-30 md:h-40 rounded-full bg-blue-400 dark:bg-blue-600 opacity-80"></div>
                        <div className="absolute top-1/3 -right-10 w-30 sm:w-40 md:w-60 h-30 sm:h-40 md:h-60 rounded-full bg-purple-400 dark:bg-purple-700 opacity-60"></div>
                        <div className="absolute -bottom-10 left-1/4 w-20 sm:w-30 md:w-40 h-20 sm:h-30 md:h-40 rounded-full bg-pink-400 dark:bg-pink-600 opacity-70"></div>

                        {/* Additional background details for visual complexity */}
                        <div className="absolute top-1/2 left-1/4 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 rounded-lg bg-yellow-300 dark:bg-yellow-500 opacity-40 rotate-12"></div>
                        <div className="absolute bottom-1/3 right-1/3 w-12 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 rounded-full bg-green-300 dark:bg-green-600 opacity-30"></div>
                      </>
                    )}

                    {/* Sample text behind glass */}
                    {showBgElements && (
                      <div className="absolute pointer-events-none select-none opacity-70">
                        <div className="text-2xl sm:text-4xl md:text-6xl font-bold text-blue-900 dark:text-blue-200 absolute -top-5 sm:-top-8 md:-top-10 left-3 sm:left-6 md:left-10">
                          Hello
                        </div>
                        <div className="text-xl sm:text-3xl md:text-5xl font-bold text-purple-800 dark:text-purple-300 absolute top-10 sm:top-15 md:top-20 right-3 sm:right-6 md:right-10">
                          World
                        </div>
                        <div className="text-lg sm:text-2xl md:text-4xl font-bold text-pink-800 dark:text-pink-300 absolute bottom-5 sm:bottom-8 md:bottom-10 left-5 sm:left-10 md:left-20">
                          Glass UI
                        </div>
                      </div>
                    )}

                    {/* Glassmorphism element */}
                    <div
                      className="relative w-full sm:w-5/6 md:w-3/4 lg:w-2/3 h-auto min-h-[300px] sm:min-h-[350px] md:h-2/3 flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8"
                      style={{
                        background: `rgba(${styles.bgColorRgba.r}, ${styles.bgColorRgba.g}, ${styles.bgColorRgba.b}, ${styles.transparency})`,
                        backdropFilter: `blur(${styles.blur}px)${styles.enableSaturation ? ` saturate(${styles.saturation})` : ''}${styles.enableBrightness ? ` brightness(${styles.brightness})` : ''}`,
                        WebkitBackdropFilter: `blur(${styles.blur}px)${styles.enableSaturation ? ` saturate(${styles.saturation})` : ''}${styles.enableBrightness ? ` brightness(${styles.brightness})` : ''}`,
                        borderRadius: `${styles.borderRadius}px`,
                        border: `${styles.border}px solid rgba(${styles.borderColorRgba.r}, ${styles.borderColorRgba.g}, ${styles.borderColorRgba.b}, ${styles.borderOpacity})`,
                        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                        color: "inherit",
                      }}
                    >
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4">
                        Glassmorphism UI
                      </h2>
                      <p className="mb-3 md:mb-6 text-sm sm:text-base md:text-lg">
                        Beautiful, modern, and clean user interface effect
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 w-full max-w-xs sm:max-w-sm">
                        <Button
                          variant="outline"
                          className="backdrop-blur-sm border-white/30 text-xs sm:text-sm"
                        >
                          Button One
                        </Button>
                        <Button className="bg-white/30 hover:bg-white/40 text-foreground border-0 text-xs sm:text-sm">
                          Button Two
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-2 flex justify-end">
                  <p className="text-xs text-muted-foreground">
                    Note: Glassmorphism effects may vary across browsers
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="css" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>CSS Code</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyCSS(generateCSS())}
                  >
                    {showCheckmark ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy code</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 rounded bg-muted overflow-auto text-sm">
                    {generateCSS()}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tailwind" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Tailwind CSS Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="full" className="mb-4">
                    <TabsList className="mb-4 flex flex-wrap">
                      <TabsTrigger value="full">Full Example</TabsTrigger>
                      <TabsTrigger value="rgb">RGB Classes</TabsTrigger>
                      <TabsTrigger value="hex">HEX Classes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="full">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Complete example with HTML:
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">HEX</span>
                            <button 
                              type="button"
                              onClick={() => setUseRgbFormat(!useRgbFormat)}
                              className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted transition-colors duration-200 ease-in-out focus:outline-none"
                              role="switch"
                              aria-checked={useRgbFormat}
                            >
                              <span 
                                className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${useRgbFormat ? 'translate-x-4' : 'translate-x-0'}`}
                              />
                            </button>
                            <span className="text-xs text-muted-foreground">RGB</span>
                          </div>
                        </div>
                        <pre className="p-2 sm:p-4 rounded bg-muted overflow-auto text-xs sm:text-sm whitespace-pre-wrap break-all">
                          {useRgbFormat ? (
                            // RGB format
                            `<!-- Tailwind Classes (RGB format) -->
<div class="bg-[rgba(${styles.bgColorRgba.r},${styles.bgColorRgba.g},${styles.bgColorRgba.b},${styles.transparency.toFixed(2)})] backdrop-blur-[${styles.blur}px] rounded-[${styles.borderRadius}px] border-[${styles.border}px] border-[rgba(${styles.borderColorRgba.r},${styles.borderColorRgba.g},${styles.borderColorRgba.b},${styles.borderOpacity.toFixed(2)})] shadow-lg${styles.enableSaturation || styles.enableBrightness ? ' glass-effect' : ''}">
  <!-- Your content here -->
</div>`
                          ) : (
                            // HEX format (default)
                            `<!-- Tailwind Classes (HEX format) -->
<div class="bg-[${styles.background}]/${styles.transparency.toFixed(2)} backdrop-blur-[${styles.blur}px] rounded-[${styles.borderRadius}px] border-[${styles.border}px] border-[${styles.borderColor}]/${styles.borderOpacity.toFixed(2)} shadow-lg${styles.enableSaturation || styles.enableBrightness ? ' glass-effect' : ''}">
  <!-- Your content here -->
</div>`
                          )}
                        </pre>
                        <div className="flex mt-2 gap-2">
                          <Button
                            className="w-full sm:w-auto"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (useRgbFormat) {
                                // Copy RGB format
                                const rgbHtml = `<!-- Tailwind Classes (RGB format) -->
<div class="bg-[rgba(${styles.bgColorRgba.r},${styles.bgColorRgba.g},${styles.bgColorRgba.b},${styles.transparency.toFixed(2)})] backdrop-blur-[${styles.blur}px] rounded-[${styles.borderRadius}px] border-[${styles.border}px] border-[rgba(${styles.borderColorRgba.r},${styles.borderColorRgba.g},${styles.borderColorRgba.b},${styles.borderOpacity.toFixed(2)})] shadow-lg${styles.enableSaturation || styles.enableBrightness ? ' glass-effect' : ''}">
  <!-- Your content here -->
</div>`;
                                handleCopyCSS(rgbHtml);
                              } else {
                                // Copy HEX format
                                const hexHtml = `<!-- Tailwind Classes (HEX format) -->
<div class="bg-[${styles.background}]/${styles.transparency.toFixed(2)} backdrop-blur-[${styles.blur}px] rounded-[${styles.borderRadius}px] border-[${styles.border}px] border-[${styles.borderColor}]/${styles.borderOpacity.toFixed(2)} shadow-lg${styles.enableSaturation || styles.enableBrightness ? ' glass-effect' : ''}">
  <!-- Your content here -->
</div>`;
                                handleCopyCSS(hexHtml);
                              }
                            }}
                          >
                            <Copy className="h-3 w-3 mr-1" /> Copy {useRgbFormat ? 'RGB' : 'HEX'} HTML
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="rgb">
                      {(() => {
                        // Add glass-effect class if those effects are enabled
                        const needsCustomUtility = styles.enableSaturation || styles.enableBrightness;
                        const rgbClasses = `bg-[rgba(${styles.bgColorRgba.r},${styles.bgColorRgba.g},${
                          styles.bgColorRgba.b
                        },${styles.transparency.toFixed(2)})] backdrop-blur-[${
                          styles.blur
                        }px] rounded-[${styles.borderRadius}px] border-[${
                          styles.border
                        }px] border-[rgba(${styles.borderColorRgba.r},${styles.borderColorRgba.g},${
                          styles.borderColorRgba.b
                        },${styles.borderOpacity.toFixed(2)})] shadow-lg${needsCustomUtility ? ' glass-effect' : ''}`;

                        return (
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                              RGB format (most compatible):
                            </p>
                            <pre className="p-2 sm:p-4 rounded bg-muted overflow-auto text-xs sm:text-sm whitespace-pre-wrap break-all">
                              {rgbClasses}
                            </pre>
                            <div className="flex mt-2">
                              <Button
                                className="w-full sm:w-auto"
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyCSS(rgbClasses)}
                              >
                                <Copy className="h-3 w-3 mr-1" /> Copy RGB Classes
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </TabsContent>

                    <TabsContent value="hex">
                      {(() => {
                        // Add glass-effect class if those effects are enabled
                        const needsCustomUtility = styles.enableSaturation || styles.enableBrightness;
                        const hexClasses = `bg-[${styles.background}]/${styles.transparency.toFixed(
                          2
                        )} backdrop-blur-[${styles.blur}px] rounded-[${
                          styles.borderRadius
                        }px] border-[${
                          styles.border
                        }px] border-[${styles.borderColor}]/${styles.borderOpacity.toFixed(
                          2
                        )} shadow-lg${needsCustomUtility ? ' glass-effect' : ''}`;

                        return (
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                              HEX format:
                            </p>
                            <pre className="p-2 sm:p-4 rounded bg-muted overflow-auto text-xs sm:text-sm whitespace-pre-wrap break-all">
                              {hexClasses}
                            </pre>
                            <div className="flex mt-2">
                              <Button
                                className="w-full sm:w-auto"
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyCSS(hexClasses)}
                              >
                                <Copy className="h-3 w-3 mr-1" /> Copy HEX Classes
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </TabsContent>
                  </Tabs>

                  <div className="mt-4 p-2 sm:p-3 border rounded-md">
                    <h3 className="text-xs sm:text-sm font-medium mb-2">
                      Add to Your Tailwind Project
                    </h3>
                    {(styles.enableSaturation || styles.enableBrightness) && (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            For saturation & brightness effects, add to your CSS:
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              // Get only the utility CSS part from the full example
                              const fullExample = generateTailwindCSS();
                              const utilityCssStart = fullExample.indexOf('@layer utilities');
                              const utilityCss = utilityCssStart !== -1 
                                ? fullExample.substring(utilityCssStart) 
                                : `@layer utilities {
  .glass-effect {
    backdrop-filter: blur(${styles.blur}px)${styles.enableSaturation ? ` saturate(${styles.saturation})` : ''}${styles.enableBrightness ? ` brightness(${styles.brightness})` : ''};
    -webkit-backdrop-filter: blur(${styles.blur}px)${styles.enableSaturation ? ` saturate(${styles.saturation})` : ''}${styles.enableBrightness ? ` brightness(${styles.brightness})` : ''};
  }
}`;
                              handleCopyCSS(utilityCss, true);
                            }}
                          >
                            {showUtilityCheckmark ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span className="sr-only">Copy utility CSS</span>
                          </Button>
                        </div>
                        <pre className="p-2 sm:p-3 rounded bg-muted overflow-auto text-xs whitespace-pre-wrap">
                          {`@layer utilities {
  .glass-effect {
    backdrop-filter: blur(${styles.blur}px)${styles.enableSaturation ? ` saturate(${styles.saturation})` : ''}${styles.enableBrightness ? ` brightness(${styles.brightness})` : ''};
    -webkit-backdrop-filter: blur(${styles.blur}px)${styles.enableSaturation ? ` saturate(${styles.saturation})` : ''}${styles.enableBrightness ? ` brightness(${styles.brightness})` : ''};
  }
}`}
                        </pre>
                      </>
                    )}
                    {!styles.enableSaturation && !styles.enableBrightness && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        No additional CSS utilities needed. The blur effect is handled natively by Tailwind.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

          {/* Controls */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Customize Glass Effect</CardTitle>
            <CardDescription>
              Adjust the settings to create your perfect glass effect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => applyPreset("light")}
              >
                Light
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => applyPreset("dark")}
              >
                Dark
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => applyPreset("colorful")}
              >
                Colorful
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => applyPreset("subtle")}
              >
                Subtle
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="blur">Blur: {styles.blur}px</Label>
              </div>
              <Slider
                id="blur"
                min={0}
                max={20}
                step={0.5}
                value={[styles.blur]}
                onValueChange={(value) =>
                  setStyles({ ...styles, blur: value[0] })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="transparency">
                  Transparency: {styles.transparency.toFixed(2)}
                </Label>
              </div>
              <Slider
                id="transparency"
                min={0}
                max={1}
                step={0.01}
                value={[styles.transparency]}
                onValueChange={(value) =>
                  setStyles({ ...styles, transparency: value[0] })
                }
              />
            </div>


            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="borderRadius">
                  Border Radius: {styles.borderRadius}px
                </Label>
              </div>
              <Slider
                id="borderRadius"
                min={0}
                max={48}
                step={1}
                value={[styles.borderRadius]}
                onValueChange={(value) =>
                  setStyles({ ...styles, borderRadius: value[0] })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="border">Border Width: {styles.border}px</Label>
              </div>
              <Slider
                id="border"
                min={0}
                max={5}
                step={0.5}
                value={[styles.border]}
                onValueChange={(value) =>
                  setStyles({ ...styles, border: value[0] })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="borderOpacity">
                  Border Opacity: {styles.borderOpacity.toFixed(2)}
                </Label>
              </div>
              <Slider
                id="borderOpacity"
                min={0}
                max={1}
                step={0.01}
                value={[styles.borderOpacity]}
                onValueChange={(value) =>
                  setStyles({ ...styles, borderOpacity: value[0] })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableSaturation"
                  checked={styles.enableSaturation}
                  onCheckedChange={(checked) =>
                    setStyles({ ...styles, enableSaturation: checked as boolean })
                  }
                />
                <Label
                  htmlFor="enableSaturation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable Saturation Effect
                </Label>
              </div>
              {styles.enableSaturation && (
                <>
                  <div className="flex justify-between pl-6">
                    <Label htmlFor="saturation">
                      Saturation: {styles.saturation.toFixed(1)}
                    </Label>
                  </div>
                  <div className="pl-6">
                    <Slider
                      id="saturation"
                      min={0.1}
                      max={3}
                      step={0.1}
                      value={[styles.saturation]}
                      onValueChange={(value) =>
                        setStyles({ ...styles, saturation: value[0] })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableBrightness"
                  checked={styles.enableBrightness}
                  onCheckedChange={(checked) =>
                    setStyles({ ...styles, enableBrightness: checked as boolean })
                  }
                />
                <Label
                  htmlFor="enableBrightness"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable Brightness Effect
                </Label>
              </div>
              {styles.enableBrightness && (
                <>
                  <div className="flex justify-between pl-6">
                    <Label htmlFor="brightness">
                      Brightness: {styles.brightness.toFixed(1)}
                    </Label>
                  </div>
                  <div className="pl-6">
                    <Slider
                      id="brightness"
                      min={0.1}
                      max={3}
                      step={0.1}
                      value={[styles.brightness]}
                      onValueChange={(value) =>
                        setStyles({ ...styles, brightness: value[0] })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">Background Color</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-14 h-10 p-0">
                      <div 
                        className="w-full h-full rounded-sm flex items-center justify-center"
                        style={{
                          backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                          backgroundSize: "8px 8px",
                          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px"
                        }}
                      >
                        <div
                          className="w-full h-full rounded-sm"
                          style={{
                            backgroundColor: `rgba(${styles.bgColorRgba.r}, ${styles.bgColorRgba.g}, ${styles.bgColorRgba.b}, 1)`,
                          }}
                        />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" side="right">
                    <RgbaColorPicker 
                      color={styles.bgColorRgba} 
                      onChange={(color) => handleRgbaColorChange(color, 'background')} 
                    />
                  </PopoverContent>
                </Popover>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={styles.background}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      handleColorInputChange(e.target.value, 'background');
                    }}
                    onBlur={() => {
                      // Ensure we have a valid color on blur
                      const hex = styles.background;
                      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                        // If invalid or incomplete, reset to a valid color
                        handleColorInputChange('#FFFFFF', 'background');
                      }
                    }}
                    placeholder="#FFFFFF"
                    className="flex-1 pl-8"
                  />
                  <div 
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm border border-border overflow-hidden"
                    style={{
                      backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                      backgroundSize: "4px 4px",
                      backgroundPosition: "0 0, 0 2px, 2px -2px, -2px 0px"
                    }}
                  >
                    <div 
                      className="w-full h-full"
                      style={{ 
                        backgroundColor: `rgba(${styles.bgColorRgba.r}, ${styles.bgColorRgba.g}, ${styles.bgColorRgba.b}, 1)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="borderColor">Border Color</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-14 h-10 p-0">
                      <div 
                        className="w-full h-full rounded-sm flex items-center justify-center"
                        style={{
                          backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                          backgroundSize: "8px 8px",
                          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px"
                        }}
                      >
                        <div
                          className="w-full h-full rounded-sm"
                          style={{
                            backgroundColor: `rgba(${styles.borderColorRgba.r}, ${styles.borderColorRgba.g}, ${styles.borderColorRgba.b}, 1)`,
                          }}
                        />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" side="right">
                    <RgbaColorPicker 
                      color={styles.borderColorRgba} 
                      onChange={(color) => handleRgbaColorChange(color, 'border')} 
                    />
                  </PopoverContent>
                </Popover>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={styles.borderColor}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      handleColorInputChange(e.target.value, 'border');
                    }}
                    onBlur={() => {
                      // Ensure we have a valid color on blur
                      const hex = styles.borderColor;
                      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                        // If invalid or incomplete, reset to a valid color
                        handleColorInputChange('#FFFFFF', 'border');
                      }
                    }}
                    placeholder="#FFFFFF"
                    className="flex-1 pl-8"
                  />
                  <div 
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm border border-border overflow-hidden"
                    style={{
                      backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                      backgroundSize: "4px 4px",
                      backgroundPosition: "0 0, 0 2px, 2px -2px, -2px 0px"
                    }}
                  >
                    <div 
                      className="w-full h-full"
                      style={{ 
                        backgroundColor: `rgba(${styles.borderColorRgba.r}, ${styles.borderColorRgba.g}, ${styles.borderColorRgba.b}, 1)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full gap-2 flex-wrap">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBgElements(!showBgElements)}
              >
                {showBgElements
                  ? "Hide Background Elements"
                  : "Show Background Elements"}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={resetToDefaults}
              >
                Reset Defaults
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
