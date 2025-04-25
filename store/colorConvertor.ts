import { create } from 'zustand';

// Define more comprehensive color types
export type RGB = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type HSL = {
  h: number;
  s: number;
  l: number;
  a: number;
};

export type HSV = {
  h: number;
  s: number;
  v: number;
  a: number;
};

export type CMYK = {
  c: number;
  m: number;
  y: number;
  k: number;
};

export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsv' | 'hsva' | 'cmyk' | 'named';

export type ColorHistory = {
  hex: string;
  rgb: RGB;
  name?: string;
  timestamp: number;
};

type ColorConvertorState = {
  // Basic color state
  color: string;
  setColor: (newColor: string) => void;
  
  // Color data in different formats
  rgb: RGB;
  setRgb: (rgb: RGB) => void;
  
  hsl: HSL;
  setHsl: (hsl: HSL) => void;
  
  hsv: HSV;
  setHsv: (hsv: HSV) => void;
  
  cmyk: CMYK;
  setCmyk: (cmyk: CMYK) => void;
  
  // UI state
  activeFormat: ColorFormat;
  setActiveFormat: (format: ColorFormat) => void;
  
  // Color history
  colorHistory: ColorHistory[];
  addToHistory: (color: ColorHistory) => void;
  clearHistory: () => void;
  
  // Color palettes
  palettes: { name: string; colors: string[] }[];
  addPalette: (name: string, colors: string[]) => void;
  removePalette: (name: string) => void;
  
  // Recent colors
  recentColors: string[];
  addRecentColor: (color: string) => void;
};

const DEFAULT_RGB: RGB = { r: 255, g: 0, b: 0, a: 1 };
const DEFAULT_HSL: HSL = { h: 0, s: 100, l: 50, a: 1 };
const DEFAULT_HSV: HSV = { h: 0, s: 100, v: 100, a: 1 };
const DEFAULT_CMYK: CMYK = { c: 0, m: 100, y: 100, k: 0 };

const MAX_HISTORY = 30;
const MAX_RECENT = 20;

const useColorConvertorStore = create<ColorConvertorState>((set) => ({
  // Basic color state
  color: "#f76464",
  setColor: (newColor) => set(() => ({ color: newColor })),
  
  // Color data in different formats
  rgb: DEFAULT_RGB,
  setRgb: (rgb) => set(() => ({ rgb })),
  
  hsl: DEFAULT_HSL,
  setHsl: (hsl) => set(() => ({ hsl })),
  
  hsv: DEFAULT_HSV,
  setHsv: (hsv) => set(() => ({ hsv })),
  
  cmyk: DEFAULT_CMYK,
  setCmyk: (cmyk) => set(() => ({ cmyk })),
  
  // UI state
  activeFormat: 'hex',
  setActiveFormat: (activeFormat) => set(() => ({ activeFormat })),
  
  // Color history
  colorHistory: [],
  addToHistory: (colorEntry) => set((state) => {
    // Don't add duplicate colors
    if (state.colorHistory.some(entry => entry.hex === colorEntry.hex)) {
      return { colorHistory: state.colorHistory };
    }
    
    const newHistory = [
      colorEntry,
      ...state.colorHistory
    ].slice(0, MAX_HISTORY);
    
    return { colorHistory: newHistory };
  }),
  clearHistory: () => set(() => ({ colorHistory: [] })),
  
  // Color palettes
  palettes: [
    { 
      name: "Material Design", 
      colors: [
        "#f44336", "#e91e63", "#9c27b0", "#673ab7", 
        "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", 
        "#009688", "#4caf50", "#8bc34a", "#cddc39", 
        "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
      ] 
    },
    { 
      name: "Flat UI", 
      colors: [
        "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", 
        "#34495e", "#16a085", "#27ae60", "#2980b9", 
        "#8e44ad", "#2c3e50", "#f1c40f", "#e67e22", 
        "#e74c3c", "#ecf0f1", "#95a5a6", "#f39c12"
      ] 
    }
  ],
  addPalette: (name, colors) => set((state) => ({
    palettes: [...state.palettes, { name, colors }]
  })),
  removePalette: (name) => set((state) => ({
    palettes: state.palettes.filter(palette => palette.name !== name)
  })),
  
  // Recent colors
  recentColors: [],
  addRecentColor: (color) => set((state) => {
    // Don't add duplicate colors
    if (state.recentColors.includes(color)) {
      return { 
        recentColors: [
          color,
          ...state.recentColors.filter(c => c !== color)
        ].slice(0, MAX_RECENT) 
      };
    }
    
    return { 
      recentColors: [color, ...state.recentColors].slice(0, MAX_RECENT) 
    };
  }),
}));

export default useColorConvertorStore;