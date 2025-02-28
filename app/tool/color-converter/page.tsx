"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function hexToRgb(hex: string, alpha: number = 1) {
  // Remove the '#' if it's there
  hex = hex.replace(/^#/, "");

  // Handle shorthand hex, e.g. #fff -> #ffffff
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // Check for the #RRGGBBAA format
  if (hex.length === 8) {
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      hex
    );

    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: Number((parseInt(result[4], 16) / 255).toFixed(1)), // Convert hex alpha to a value between 0 and 1 with 1 decimal
      };
    }
  }

  // Handle the standard #RRGGBB format
  if (hex.length === 6) {
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: alpha, // Use the provided alpha if no alpha in the hex code
      };
    }
  }

  return null; // Invalid hex code
}

function rgbToHex(r: number, g: number, b: number, a: number = 1) {
  // Clamp values to ensure they're between 0 and 255
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  const hex =
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");

  if (a < 1) {
    // Include alpha if less than 1
    return `${hex}${Math.round(a * 255)
      .toString(16)
      .padStart(2, "0")}`;
  }

  return hex;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number, a: number = 1) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s,
    l = 0;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360), // Normalize hue between 0 and 360
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: a,
  };
}

// Convert HSL to RGB
// function hslToRgb(h: number, s: number, l: number, a: number = 1): { r: number; g: number; b: number; a: number } {
//   h = h / 360;
//   s = s / 100;
//   l = l / 100;

//   let r, g, b;

//   if (s === 0) {
//     r = g = b = l; // Achromatic (grey)
//   } else {
//     const hue2rgb = (p: number, q: number, t: number) => {
//       if (t < 0) t += 1;
//       if (t > 1) t -= 1;
//       if (t < 1 / 6) return p + (q - p) * 6 * t;
//       if (t < 1 / 2) return q;
//       if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
//       return p;
//     };

//     const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//     const p = 2 * l - q;

//     r = hue2rgb(p, q, h + 1 / 3);
//     g = hue2rgb(p, q, h);
//     b = hue2rgb(p, q, h - 1 / 3);
//   }

//   return {
//     r: Math.round(r * 255),
//     g: Math.round(g * 255),
//     b: Math.round(b * 255),
//     a: a,
//   };
// }

export default function ColorConverter() {
  const [hex, setHex] = useState("#000000");
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0, a: 1 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0, a: 1 });
  const { toast } = useToast();

  const handleHexChange = (value: string) => {
    setHex(value);
    const rgbValue = hexToRgb(value);
    if (rgbValue) {
      setRgb(rgbValue);
      setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b, rgbValue.a));
    }
  };

  const handleRgbChange = (key: "r" | "g" | "b" | "a", value: number) => {
    const newRgb = { ...rgb, [key]: Number(value) };

    if (key === "a") {
      newRgb.a = Number(Math.min(1, Math.max(0, value))); // Ensure alpha is between 0 and 1
    }
    setRgb(newRgb);

    if (isNaN(Number(value))) {
      return;
    }
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b, newRgb.a));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Color value copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Color Converter</h1>
        <p className="text-muted-foreground">
          Convert colors between different formats (HEX, RGB, HSL)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Enter color values in any format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">HEX</label>
              <div className="flex gap-2">
                <Input
                  value={hex}
                  min={0}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#000000"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(hex)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">RGBA</label>
              <div className="grid grid-cols-4 gap-2">
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) =>
                    handleRgbChange("r", parseInt(e.target.value))
                  }
                  placeholder="R"
                />
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) =>
                    handleRgbChange("g", parseInt(e.target.value))
                  }
                  placeholder="G"
                />
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) =>
                    handleRgbChange("b", parseInt(e.target.value))
                  }
                  placeholder="B"
                />
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={rgb.a}
                  onChange={(e) =>
                    handleRgbChange("a", parseFloat(e.target.value))
                  }
                  placeholder="A"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  copyToClipboard(
                    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`
                  )
                }
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy RGBA
              </Button>
            </div>

            <Separator  />

            <div>
              <label className="text-sm font-medium">HSL</label>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-sm font-medium">H</div>
                  <div className="text-2xl">{hsl.h}°</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">S</div>
                  <div className="text-2xl">{hsl.s}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">L</div>
                  <div className="text-2xl">{hsl.l}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">A</div>
                  <div className="text-2xl">{rgb.a}</div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() =>
                  copyToClipboard(
                    `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${rgb.a})`
                  )
                }
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy HSLA
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Color preview and HSL values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 h-full">
            <div
              className={`h-32 md:h-[calc(100%-20%)]  rounded-lg border`}
              style={{
                backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`,
              }}
            ></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
