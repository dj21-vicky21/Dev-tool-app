import React from "react";
import { ColorStop, GradientType } from "./types";

export function buildGradientStyle(
  colorStops: ColorStop[],
  gradientType: GradientType,
  rotation: number
): React.CSSProperties {
  if (gradientType === "linear") {
    return {
      backgroundImage: `linear-gradient(${rotation}deg, ${colorStops
        .map((stop) => `${stop.color} ${stop.position}%`)
        .join(", ")})`,
    };
  } else {
    return {
      backgroundImage: `radial-gradient(circle, ${colorStops
        .map((stop) => `${stop.color} ${stop.position}%`)
        .join(", ")})`,
    };
  }
}

export function generateCssCode(
  colorStops: ColorStop[],
  gradientType: GradientType,
  rotation: number
): string {
  if (gradientType === "linear") {
    return `background-image: linear-gradient(${rotation}deg, ${colorStops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ")});`;
  } else {
    return `background-image: radial-gradient(circle, ${colorStops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ")});`;
  }
}

export function generateTailwindCode(
  colorStops: ColorStop[],
  gradientType: GradientType,
  rotation: number
): string {
  if (gradientType === "linear") {
    const direction = getDirectionFromAngle(rotation);
    
    // Tailwind only supports from, via, to (3 color stops)
    // So we need to simplify if there are more stops
    const simplifiedStops = simplifyColorStops(colorStops);
    
    // Build the tailwind classes
    const classes = [`bg-gradient-to-${direction}`];
    
    // Add color classes with proper formatting for hex and rgba
    simplifiedStops.forEach((stop, index) => {
      const prefix = index === 0 ? "from" : index === 1 ? "via" : "to";
      
      // Format the color for Tailwind's arbitrary value syntax
      const formattedColor = formatTailwindColor(stop.color);
      classes.push(`${prefix}-${formattedColor}`);
    });
    
    return classes.join(" ");
  } else {
    // For radial gradients, Tailwind doesn't have built-in support
    // We'll generate a CSS class with @apply that could be used in a Tailwind project
    return `
/* Radial gradient requires custom CSS with Tailwind */
.bg-radial-gradient {
  @apply relative;
  background-image: radial-gradient(circle, ${colorStops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ")});
}`;
  }
}

// Helper function to simplify color stops to 3 (for Tailwind's from/via/to)
function simplifyColorStops(stops: ColorStop[]): ColorStop[] {
  if (stops.length <= 3) return stops;
  
  // If more than 3 stops, keep first, middle, and last
  return [
    stops[0],
    stops[Math.floor(stops.length / 2)],
    stops[stops.length - 1]
  ];
}

// Format color for Tailwind's arbitrary value syntax
function formatTailwindColor(color: string): string {
  // Check if it's a hex color
  if (color.startsWith('#')) {
    return `[${color}]`;
  }
  
  // Check if it's rgba
  if (color.startsWith('rgba')) {
    // Need to remove spaces for Tailwind
    const cleanColor = color.replace(/\s+/g, '');
    return `[${cleanColor}]`;
  }
  
  // For named colors or other formats
  return `[${color}]`;
}

export function generateColorsCode(colorStops: ColorStop[]): string {
  return colorStops.map((stop) => stop.color).join(", ");
}

export function generateValuesCode(colorStops: ColorStop[]): string {
  return colorStops
    .map((stop) => `${stop.color}: ${stop.position}%`)
    .join("\n");
}

function getDirectionFromAngle(angle: number): string {
  // Normalize angle to 0-360
  const normalized = ((angle % 360) + 360) % 360;
  
  // In CSS, angle 0 is to top, 90 is to right, etc.
  // In Tailwind, we need to map to the opposite direction of the gradient flow
  
  // Map angle to Tailwind direction (opposite of gradient flow)
  if (normalized >= 337.5 || normalized < 22.5) return "t"; // 0deg = to top
  if (normalized >= 22.5 && normalized < 67.5) return "tr"; // 45deg = to top-right
  if (normalized >= 67.5 && normalized < 112.5) return "r"; // 90deg = to right
  if (normalized >= 112.5 && normalized < 157.5) return "br"; // 135deg = to bottom-right
  if (normalized >= 157.5 && normalized < 202.5) return "b"; // 180deg = to bottom
  if (normalized >= 202.5 && normalized < 247.5) return "bl"; // 225deg = to bottom-left
  if (normalized >= 247.5 && normalized < 292.5) return "l"; // 270deg = to left
  if (normalized >= 292.5 && normalized < 337.5) return "tl"; // 315deg = to top-left
  
  return "t"; // fallback to top
} 