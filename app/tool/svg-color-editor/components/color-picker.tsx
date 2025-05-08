"use client";

import { useState, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pipette } from "lucide-react";

// Define EyeDropper API types
interface EyeDropperAPI {
  open: () => Promise<{sRGBHex: string}>;
}

declare global {
  interface Window {
    EyeDropper?: {
      new (): EyeDropperAPI;
    };
  }
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(color || '#000000');
  const [isOpen, setIsOpen] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false);
  const [isPickingColor, setIsPickingColor] = useState(false);

  // Check for EyeDropper API support
  useEffect(() => {
    setIsEyeDropperSupported(typeof window !== 'undefined' && 'EyeDropper' in window);
  }, []);

  // Update local state when prop changes
  useEffect(() => {
    if (color && color !== hexValue) {
      setHexValue(color);
    }
  }, [color, hexValue]);

  // Format hex and validate
  const formatHex = (hex: string): string => {
    // Ensure leading hash
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }

    // Remove non-hex characters (after the #)
    hex = '#' + hex.substring(1).replace(/[^0-9A-Fa-f]/g, '');

    // Handle different formats
    const digits = hex.length - 1; // Exclude the # from the count
    
    if (digits === 3) {
      // Expand 3-digit format (#RGB to #RRGGBB)
      const r = hex.charAt(1);
      const g = hex.charAt(2);
      const b = hex.charAt(3);
      return `#${r}${r}${g}${g}${b}${b}`;
    } else if (digits === 4) {
      // Expand 4-digit format (#RGBA to #RRGGBBAA)
      const r = hex.charAt(1);
      const g = hex.charAt(2);
      const b = hex.charAt(3);
      const a = hex.charAt(4);
      return `#${r}${r}${g}${g}${b}${b}${a}${a}`;
    } else if (digits < 6) {
      // Pad to 6 digits if too short
      while (hex.length < 7) {
        hex += '0';
      }
      return hex;
    } else if (digits > 6 && digits < 8) {
      // Pad to 8 digits if between 6 and 8
      while (hex.length < 9) {
        hex += '0';
      }
      return hex;
    } else if (digits > 8) {
      // Truncate if too long
      return hex.substring(0, 9);
    }
    
    return hex;
  };

  // Handle color picker change
  const handleColorChange = (newColor: string) => {
    setHexValue(newColor);
    onChange(newColor);
  };

  // Handle hex input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexValue(value);

    // Only call onChange if value is a valid hex color
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value)) {
      setIsValid(true);
      onChange(value);
    } else {
      setIsValid(false);
    }
  };

  // Handle blur event to normalize input
  const handleBlur = () => {
    try {
      const formatted = formatHex(hexValue);
      setHexValue(formatted);
      setIsValid(true);
      onChange(formatted);
    } catch (error) {
      console.log("--> ~ handleBlur ~ error:", error)
      setIsValid(false);
    }
  };

  // Handle eyedropper color picking
  const handleEyeDropper = useCallback(async () => {
    if (!window.EyeDropper) return;

    try {
      setIsPickingColor(true);
      
      // Close the color picker popover if it's open
      if (isOpen) setIsOpen(false);
      
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      
      // Update with the picked color
      const pickedColor = result.sRGBHex;
      setHexValue(pickedColor);
      setIsValid(true);
      onChange(pickedColor);
    } catch (error) {
      // User likely canceled the picker
      console.log("Eye dropper was canceled or failed:", error);
    } finally {
      setIsPickingColor(false);
    }
  }, [isOpen, onChange]);

  return (
    <div className="flex flex-col space-y-2">
      <Label>Color</Label>
      <div className="flex gap-2 items-center">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-8 w-10 p-0 border"
              style={{
                backgroundColor: isValid ? hexValue : '#ffffff',
                borderColor: !isValid ? 'red' : undefined
              }}
              aria-label="Pick a color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" side="right" align="center">
            <HexColorPicker color={hexValue} onChange={handleColorChange} />
          </PopoverContent>
        </Popover>

        <Input
          type="text"
          maxLength={9}
          value={hexValue}
          onChange={handleHexChange}
          onBlur={handleBlur}
          onFocus={(e) => e.target.select()}
          placeholder="#000000"
          className={!isValid ? 'border-red-500' : ''}
        />
        
        {isEyeDropperSupported && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 relative"
            onClick={handleEyeDropper}
            disabled={isPickingColor}
            title="Pick color from screen"
          >
            <Pipette size={16} />
            {isPickingColor && (
              <span className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
              </span>
            )}
          </Button>
        )}
      </div>
      {!isValid && (
        <p className="text-xs text-red-500">
          Please enter a valid hex color (e.g., #f00, #ff0000, #ff0000ff)
        </p>
      )}
    </div>
  );
}
