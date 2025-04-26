"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ColorStop } from "./types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Predefined gradient presets
export const gradientPresets = [
  {
    name: "Sunset",
    stops: [
      { color: "#FF512F", position: 0 },
      { color: "#F09819", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Purple Haze",
    stops: [
      { color: "#7303c0", position: 0 },
      { color: "#ec38bc", position: 100 }
    ],
    type: "linear" as const,
    rotation: 135
  },
  {
    name: "Ocean Blue",
    stops: [
      { color: "#2E3192", position: 0 },
      { color: "#1BFFFF", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Emerald",
    stops: [
      { color: "#16A085", position: 0 },
      { color: "#F4D03F", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Coral",
    stops: [
      { color: "#ff7e5f", position: 0 },
      { color: "#feb47b", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Midnight",
    stops: [
      { color: "#232526", position: 0 },
      { color: "#414345", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Subtle Rainbow",
    stops: [
      { color: "#9D50BB", position: 0 },
      { color: "#6E48AA", position: 25 },
      { color: "#2F80ED", position: 50 },
      { color: "#56CCF2", position: 75 },
      { color: "#2D9EE0", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Cotton Candy",
    stops: [
      { color: "#D8B5FF", position: 0 },
      { color: "#1EAE98", position: 100 }
    ],
    type: "radial" as const,
    rotation: 0
  },
  {
    name: "Aurora",
    stops: [
      { color: "#85FFBD", position: 0 },
      { color: "#FFFB7D", position: 100 }
    ],
    type: "linear" as const,
    rotation: 45
  },
  {
    name: "Mojito",
    stops: [
      { color: "#1D976C", position: 0 },
      { color: "#93F9B9", position: 100 }
    ],
    type: "linear" as const,
    rotation: 135
  },
  {
    name: "Cosmic Fusion",
    stops: [
      { color: "#ff00cc", position: 0 },
      { color: "#333399", position: 100 }
    ],
    type: "radial" as const,
    rotation: 0
  },
  {
    name: "Deep Space",
    stops: [
      { color: "#000000", position: 0 },
      { color: "#434343", position: 100 }
    ],
    type: "linear" as const,
    rotation: 225
  },
  {
    name: "Crimson Tide",
    stops: [
      { color: "#642B73", position: 0 },
      { color: "#C6426E", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Wiretap",
    stops: [
      { color: "#8A2387", position: 0 },
      { color: "#E94057", position: 50 },
      { color: "#F27121", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Summer",
    stops: [
      { color: "#22c1c3", position: 0 },
      { color: "#fdbb2d", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Mint",
    stops: [
      { color: "#00b09b", position: 0 },
      { color: "#96c93d", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Blue Lagoon",
    stops: [
      { color: "#43cea2", position: 0 },
      { color: "#185a9d", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Frost",
    stops: [
      { color: "#000428", position: 0 },
      { color: "#004e92", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Mauve",
    stops: [
      { color: "#42275a", position: 0 },
      { color: "#734b6d", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Royal",
    stops: [
      { color: "#141E30", position: 0 },
      { color: "#243B55", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Aqua Marine",
    stops: [
      { color: "#1A2980", position: 0 },
      { color: "#26D0CE", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Rose Water",
    stops: [
      { color: "#E55D87", position: 0 },
      { color: "#5FC3E4", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Plum Plate",
    stops: [
      { color: "#667eea", position: 0 },
      { color: "#764ba2", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Morning",
    stops: [
      { color: "#ff5f6d", position: 0 },
      { color: "#ffc371", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Vice City",
    stops: [
      { color: "#3494E6", position: 0 },
      { color: "#EC6EAD", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Witching Hour",
    stops: [
      { color: "#c31432", position: 0 },
      { color: "#240b36", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Azure Pop",
    stops: [
      { color: "#ef32d9", position: 0 },
      { color: "#89fffd", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Frozen",
    stops: [
      { color: "#403B4A", position: 0 },
      { color: "#E7E9BB", position: 100 }
    ],
    type: "radial" as const,
    rotation: 0
  },
  {
    name: "Mango",
    stops: [
      { color: "#ffe259", position: 0 },
      { color: "#ffa751", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Lunada",
    stops: [
      { color: "#5433FF", position: 0 },
      { color: "#20BDFF", position: 50 },
      { color: "#A5FECB", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Relay",
    stops: [
      { color: "#3A1C71", position: 0 },
      { color: "#D76D77", position: 50 },
      { color: "#FFAF7B", position: 100 }
    ],
    type: "radial" as const,
    rotation: 0
  },
  {
    name: "Sublimate",
    stops: [
      { color: "#FC5C7D", position: 0 },
      { color: "#6A82FB", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Sublime Vivid",
    stops: [
      { color: "#FC466B", position: 0 },
      { color: "#3F5EFB", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Bighead",
    stops: [
      { color: "#c94b4b", position: 0 },
      { color: "#4b134f", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Taran Tado",
    stops: [
      { color: "#23074d", position: 0 },
      { color: "#cc5333", position: 100 }
    ],
    type: "linear" as const,
    rotation: 315
  },
  {
    name: "Quepal",
    stops: [
      { color: "#11998e", position: 0 },
      { color: "#38ef7d", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Lawrencium",
    stops: [
      { color: "#0f0c29", position: 0 },
      { color: "#302b63", position: 50 },
      { color: "#24243e", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Ohhappiness",
    stops: [
      { color: "#00b09b", position: 0 },
      { color: "#96c93d", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Hyper Blue",
    stops: [
      { color: "#0575E6", position: 0 },
      { color: "#021B79", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Relaxing Red",
    stops: [
      { color: "#fffbd5", position: 0 },
      { color: "#b20a2c", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Cherry Blossom",
    stops: [
      { color: "#FBD3E9", position: 0 },
      { color: "#BB377D", position: 100 }
    ],
    type: "radial" as const,
    rotation: 0
  },
  {
    name: "Farhan",
    stops: [
      { color: "#9400D3", position: 0 },
      { color: "#4B0082", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Purple Love",
    stops: [
      { color: "#cc2b5e", position: 0 },
      { color: "#753a88", position: 100 }
    ],
    type: "linear" as const,
    rotation: 225
  },
  {
    name: "Flickr",
    stops: [
      { color: "#ff0084", position: 0 },
      { color: "#33001b", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Selenium",
    stops: [
      { color: "#3C3B3F", position: 0 },
      { color: "#605C3C", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Burning Orange",
    stops: [
      { color: "#FF416C", position: 0 },
      { color: "#FF4B2B", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Ultra Voilet",
    stops: [
      { color: "#654ea3", position: 0 },
      { color: "#eaafc8", position: 100 }
    ],
    type: "radial" as const,
    rotation: 0
  },
  {
    name: "Blue Raspberry",
    stops: [
      { color: "#00B4DB", position: 0 },
      { color: "#0083B0", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Moonlit Asteroid",
    stops: [
      { color: "#0F2027", position: 0 },
      { color: "#203A43", position: 50 },
      { color: "#2C5364", position: 100 }
    ],
    type: "linear" as const,
    rotation: 180
  },
  {
    name: "Evening Sunshine",
    stops: [
      { color: "#b92b27", position: 0 },
      { color: "#1565C0", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "JShine",
    stops: [
      { color: "#12c2e9", position: 0 },
      { color: "#c471ed", position: 50 },
      { color: "#f64f59", position: 100 }
    ],
    type: "radial" as const,
    rotation: 0
  },
  {
    name: "Citrus Peel",
    stops: [
      { color: "#FDC830", position: 0 },
      { color: "#F37335", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  },
  {
    name: "Celestial",
    stops: [
      { color: "#C33764", position: 0 },
      { color: "#1D2671", position: 100 }
    ],
    type: "linear" as const,
    rotation: 270
  },
  {
    name: "Cool Blues",
    stops: [
      { color: "#2193b0", position: 0 },
      { color: "#6dd5ed", position: 100 }
    ],
    type: "linear" as const,
    rotation: 90
  }
];

interface PredefinedGradientsProps {
  onSelectGradient: (
    stops: ColorStop[], 
    type: "linear" | "radial", 
    rotation: number
  ) => void;
}

export default function PredefinedGradients({ onSelectGradient }: PredefinedGradientsProps) {
  const [presets, setPresets] = useState(gradientPresets);
  
  // Color palettes for more harmonious gradients
  const colorPalettes = [
    // Blues
    ["#1A2980", "#26D0CE", "#21D4FD", "#B721FF"],
    // Purples
    ["#6A11CB", "#2575FC", "#8E2DE2", "#4A00E0"],
    // Reds
    ["#FF416C", "#FF4B2B", "#f5576c", "#f093fb"],
    // Greens
    ["#00b09b", "#96c93d", "#02AABD", "#00CDAC"],
    // Yellows/Oranges
    ["#F7971E", "#FFD200", "#f12711", "#f5af19"],
    // Dark
    ["#0F2027", "#203A43", "#2C5364", "#4b6cb7"],
    // Pink/Purple
    ["#EC6EAD", "#3494E6", "#D585FF", "#00FFEE"],
    // Sunset colors
    ["#FA8BFF", "#2BD2FF", "#2BFF88", "#FF9A8B"],
  ];
  
  
  const regeneratePresets = () => {
    // Generate completely new random gradients with better aesthetics
    const newPresets = Array.from({ length: presets.length }, (_, index) => {
      // Select a palette for each gradient
      const paletteIndex = Math.floor(Math.random() * colorPalettes.length);
      const palette = colorPalettes[paletteIndex];
      
      const numStops = 2 + Math.floor(Math.random() * 2); // 2-3 stops for cleaner gradients
      const stops: ColorStop[] = [];
      
      // Use colors from the same palette
      const usedIndices = new Set<number>();
      
      for (let i = 0; i < numStops; i++) {
        // Avoid using the same color twice in small gradients
        let colorIndex;
        do {
          colorIndex = Math.floor(Math.random() * palette.length);
        } while (usedIndices.has(colorIndex) && usedIndices.size < palette.length);
        
        usedIndices.add(colorIndex);
        const color = palette[colorIndex];
        
        // More even distribution of stops
        const position = i === 0 ? 0 : i === numStops - 1 ? 100 : 
                         Math.floor(100 / (numStops - 1) * i);
        
        stops.push({
          color,
          position
        });
      }
      
      // Sort by position
      stops.sort((a, b) => a.position - b.position);
      
      // Bias toward linear gradients (70%)
      const type = Math.random() > 0.3 ? "linear" as const : "radial" as const;
      
      // Use clean angles for linear gradients
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      const rotation = type === "linear" ? 
                      angles[Math.floor(Math.random() * angles.length)] : 0;
      
      // More descriptive gradient names
      const gradientTypes = ["Smooth", "Blend", "Flow", "Soft", "Elegant", "Silky", "Gentle", "Dreamy"];
      const gradientType = gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
      
      const colorNames = ["Blue", "Purple", "Red", "Green", "Orange", "Dark", "Pink", "Sunset"];
      const colorName = colorNames[paletteIndex];
      
      return {
        name: `${gradientType} ${colorName} ${index + 1}`,
        stops,
        type,
        rotation
      };
    });
    
    setPresets(newPresets);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold">Predefined Gradients</Label>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={regeneratePresets}
            className="gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate All
          </Button>
        </div>
      </div>
      
        <div className="flex gap-3 flex-wrap p-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              className="size-48 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              style={{
                background: preset.type === "linear" 
                  ? `linear-gradient(${preset.rotation}deg, ${preset.stops.map(stop => 
                      `${stop.color} ${stop.position}%`).join(', ')})`
                  : `radial-gradient(circle, ${preset.stops.map(stop => 
                      `${stop.color} ${stop.position}%`).join(', ')})`
              }}
              onClick={() => onSelectGradient(preset.stops, preset.type, preset.rotation)}
              title={preset.name}
            >
              <div className="w-full h-full flex items-end justify-start p-1">
                <span className="text-xs font-semibold bg-black/30 text-white px-1.5 py-0.5 rounded">
                  {preset.name}
                </span>
              </div>
            </button>
          ))}
        </div>
    </div>
  );
} 