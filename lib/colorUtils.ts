/**
 * Color Utility Functions Library
 * Comprehensive set of functions for color space conversions
 */

import { RGB, HSL, HSV, CMYK } from '@/store/colorConvertor';
import colorNames from './colorNames';

/**
 * Validate a hex color
 */
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex);
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): RGB {
  // Remove the '#' if it's there
  hex = hex.replace(/^#/, "");

  let r: number, g: number, b: number, a = 1;
  
  // Handle shorthand hex, e.g. #fff -> #ffffff
  if (hex.length === 3 || hex.length === 4) {
    const hasAlpha = hex.length === 4;
    
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
    
    if (hasAlpha) {
      a = parseInt(hex[3] + hex[3], 16) / 255;
    }
  } 
  // Handle the standard #RRGGBB or #RRGGBBAA format
  else if (hex.length === 6 || hex.length === 8) {
    const hasAlpha = hex.length === 8;
    
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    
    if (hasAlpha) {
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }
  }
  else {
    // Return default for invalid hex
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
    a: Number(a.toFixed(2))
  };
}

/**
 * Convert RGB to Hex
 */
export function rgbToHex({ r, g, b, a = 1 }: RGB): string {
  // Clamp values to ensure they're between 0 and 255
  r = Math.min(255, Math.max(0, Math.round(r)));
  g = Math.min(255, Math.max(0, Math.round(g)));
  b = Math.min(255, Math.max(0, Math.round(b)));
  a = Math.min(1, Math.max(0, a));

  const hex = [
    r.toString(16).padStart(2, '0'),
    g.toString(16).padStart(2, '0'),
    b.toString(16).padStart(2, '0')
  ].join('');

  // Include alpha if it's not 1
  if (a < 1) {
    const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
    return `#${hex}${alphaHex}`;
  }

  return `#${hex}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl({ r, g, b, a = 1 }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
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
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb({ h, s, l, a = 1 }: HSL): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a
  };
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv({ r, g, b, a = 1 }: RGB): HSV {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
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
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a
  };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb({ h, s, v, a = 1 }: HSV): RGB {
  h /= 360;
  s /= 100;
  v /= 100;

  let r = 0, g = 0, b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v; g = t; b = p;
      break;
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a
  };
}

/**
 * Convert HSV to HSL
 */
export function hsvToHsl(hsv: HSV): HSL {
  const rgb = hsvToRgb(hsv);
  return rgbToHsl(rgb);
}

/**
 * Convert HSL to HSV
 */
export function hslToHsv(hsl: HSL): HSV {
  const rgb = hslToRgb(hsl);
  return rgbToHsv(rgb);
}

/**
 * Convert RGB to CMYK
 */
export function rgbToCmyk({ r, g, b }: RGB): CMYK {
  r /= 255;
  g /= 255;
  b /= 255;

  const k = 1 - Math.max(r, g, b);
  
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
}

/**
 * Convert CMYK to RGB
 */
export function cmykToRgb({ c, m, y, k }: CMYK): RGB {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;

  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
    a: 1
  };
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): HSL {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb);
}

/**
 * Convert HSL to hex
 */
export function hslToHex(hsl: HSL): string {
  const rgb = hslToRgb(hsl);
  return rgbToHex(rgb);
}

/**
 * Convert hex to HSV
 */
export function hexToHsv(hex: string): HSV {
  const rgb = hexToRgb(hex);
  return rgbToHsv(rgb);
}

/**
 * Convert HSV to hex
 */
export function hsvToHex(hsv: HSV): string {
  const rgb = hsvToRgb(hsv);
  return rgbToHex(rgb);
}

/**
 * Convert hex to CMYK
 */
export function hexToCmyk(hex: string): CMYK {
  const rgb = hexToRgb(hex);
  return rgbToCmyk(rgb);
}

/**
 * Convert CMYK to hex
 */
export function cmykToHex(cmyk: CMYK): string {
  const rgb = cmykToRgb(cmyk);
  return rgbToHex(rgb);
}

/**
 * Generate a complementary color
 */
export function getComplementaryColor(hex: string): string {
  const { h, s, l, a } = hexToHsl(hex);
  const newH = (h + 180) % 360;
  return hslToHex({ h: newH, s, l, a });
}

/**
 * Generate analogous colors (colors that are next to each other on the color wheel)
 */
export function getAnalogousColors(hex: string, count = 3, angle = 30): string[] {
  const { h, s, l, a } = hexToHsl(hex);
  const colors: string[] = [hex];
  
  const half = Math.floor(count / 2);
  
  for (let i = 1; i <= half; i++) {
    // Add colors clockwise
    colors.push(hslToHex({
      h: (h + i * angle) % 360,
      s, l, a
    }));
    
    // Add colors counterclockwise
    colors.unshift(hslToHex({
      h: (h - i * angle + 360) % 360,
      s, l, a
    }));
  }
  
  // If count is even, we're missing one color
  if (count % 2 === 0) {
    colors.push(hslToHex({
      h: (h + (half + 1) * angle) % 360,
      s, l, a
    }));
  }
  
  return colors.slice(0, count);
}

/**
 * Generate a triad color scheme (three colors equally spaced on the color wheel)
 */
export function getTriadColors(hex: string): string[] {
  const { h, s, l, a } = hexToHsl(hex);
  return [
    hex,
    hslToHex({ h: (h + 120) % 360, s, l, a }),
    hslToHex({ h: (h + 240) % 360, s, l, a })
  ];
}

/**
 * Generate a tetrad color scheme (four colors arranged in two complementary pairs)
 */
export function getTetradColors(hex: string): string[] {
  const { h, s, l, a } = hexToHsl(hex);
  return [
    hex,
    hslToHex({ h: (h + 90) % 360, s, l, a }),
    hslToHex({ h: (h + 180) % 360, s, l, a }),
    hslToHex({ h: (h + 270) % 360, s, l, a })
  ];
}

/**
 * Generate shades of a color (mixtures with black)
 */
export function getShades(hex: string, count = 5): string[] {
  const { h, s, a } = hexToHsl(hex);
  const shades: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const l = 100 - (i * (100 / (count - 1)));
    shades.push(hslToHex({ h, s, l, a }));
  }
  
  return shades;
}

/**
 * Generate tints of a color (mixtures with white)
 */
export function getTints(hex: string, count = 5): string[] {
  const { h, s, a } = hexToHsl(hex);
  const tints: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const l = 50 + (i * (50 / (count - 1)));
    tints.push(hslToHex({ h, s, l, a }));
  }
  
  return tints;
}

/**
 * Calculate contrast ratio between two colors (WCAG)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    
    const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(val => {
      return val <= 0.03928 
        ? val / 12.92 
        : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return Number(ratio.toFixed(2));
}

/**
 * Check if a color is WCAG AA compliant for normal text (4.5:1)
 */
export function isWCAGAACompliant(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

/**
 * Check if a color is WCAG AAA compliant for normal text (7:1)
 */
export function isWCAGAAACompliant(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

/**
 * Format RGB as CSS string
 */
export function formatRgb({ r, g, b, a = 1 }: RGB): string {
  return a < 1 
    ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` 
    : `rgb(${r}, ${g}, ${b})`;
}

/**
 * Format HSL as CSS string
 */
export function formatHsl({ h, s, l, a = 1 }: HSL): string {
  return a < 1 
    ? `hsla(${h}, ${s}%, ${l}%, ${a.toFixed(2)})` 
    : `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Format HSV as CSS string (Note: HSV is not directly supported in CSS)
 */
export function formatHsv({ h, s, v, a = 1 }: HSV): string {
  return `hsv(${h}, ${s}%, ${v}%${a < 1 ? `, ${a.toFixed(2)}` : ''})`;
}

/**
 * Format CMYK as string
 */
export function formatCmyk({ c, m, y, k }: CMYK): string {
  return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
}

/**
 * Parse a CSS color string to get its hex value
 */
export function parseColorString(colorStr: string): string | null {
  // Handle hex
  if (colorStr.startsWith('#')) {
    return isValidHex(colorStr) ? colorStr.toLowerCase() : null;
  }
  
  // Handle rgb/rgba
  if (colorStr.startsWith('rgb')) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
    if (match) {
      const [, r, g, b, a] = match;
      return rgbToHex({
        r: parseInt(r),
        g: parseInt(g),
        b: parseInt(b),
        a: a ? parseFloat(a) : 1
      });
    }
  }
  
  // Handle hsl/hsla
  if (colorStr.startsWith('hsl')) {
    const match = colorStr.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([0-9.]+))?\)/);
    if (match) {
      const [, h, s, l, a] = match;
      return hslToHex({
        h: parseInt(h),
        s: parseInt(s),
        l: parseInt(l),
        a: a ? parseFloat(a) : 1
      });
    }
  }
  
  // Handle named colors
  if (colorNames[colorStr.toLowerCase()]) {
    return colorNames[colorStr.toLowerCase()];
  }
  
  return null;
}

/**
 * Get the closest named color to a given hex
 */
export function getClosestNamedColor(hex: string): { name: string, hex: string, distance: number } {
  const rgb1 = hexToRgb(hex);
  let closestColor = { name: "", hex: "", distance: Infinity };
  
  Object.entries(colorNames).forEach(([name, namedHex]) => {
    const rgb2 = hexToRgb(namedHex);
    
    // Calculate color distance using weighted Euclidean distance
    const distance = Math.sqrt(
      3 * Math.pow(rgb2.r - rgb1.r, 2) + 
      4 * Math.pow(rgb2.g - rgb1.g, 2) + 
      2 * Math.pow(rgb2.b - rgb1.b, 2)
    );
    
    if (distance < closestColor.distance) {
      closestColor = { name, hex: namedHex, distance };
    }
  });
  
  return closestColor;
}

/**
 * Convert color to a CSS variable-friendly string
 */
export function getColorAsVariable(hex: string): string {
  // Returns without the # to make it CSS variable-friendly
  return hex.replace('#', '');
}

/**
 * Get color brightness (0-255)
 */
export function getColorBrightness(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * Check if a color is light (true) or dark (false)
 */
export function isLightColor(hex: string): boolean {
  return getColorBrightness(hex) > 128;
}

/**
 * Get a readable text color (black or white) based on background
 */
export function getReadableTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#ffffff';
}

export default {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  hsvToHsl,
  hslToHsv,
  rgbToCmyk,
  cmykToRgb,
  hexToHsl,
  hslToHex,
  hexToHsv,
  hsvToHex,
  hexToCmyk,
  cmykToHex,
  getComplementaryColor,
  getAnalogousColors,
  getTriadColors,
  getTetradColors,
  getShades,
  getTints,
  getContrastRatio,
  isWCAGAACompliant,
  isWCAGAAACompliant,
  formatRgb,
  formatHsl,
  formatHsv,
  formatCmyk,
  parseColorString,
  getClosestNamedColor,
  getColorAsVariable,
  getColorBrightness,
  isLightColor,
  getReadableTextColor
}; 