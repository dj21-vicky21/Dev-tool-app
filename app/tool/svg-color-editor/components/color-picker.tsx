"use client";

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(color || '#000000');
  const [isOpen, setIsOpen] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Update local state when prop changes
  useEffect(() => {
    if (color && color !== hexValue) {
      setHexValue(color);
    }
  }, [color]);

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
      </div>
      {!isValid && (
        <p className="text-xs text-red-500">
          Please enter a valid hex color (e.g., #f00, #ff0000, #ff0000ff)
        </p>
      )}
    </div>
  );
}
