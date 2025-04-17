export interface ColorStop {
  color: string;
  position: number;
}

export type GradientType = "linear" | "radial";

export interface GradientPreviewProps {
  colorStops: ColorStop[];
  gradientType: GradientType;
  rotation: number;
}

export interface GradientControlsProps {
  colorStops: ColorStop[];
  setColorStops: (stops: ColorStop[]) => void;
  gradientType: GradientType;
  setGradientType: (type: GradientType) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
}

export interface CodeOutputProps {
  colorStops: ColorStop[];
  gradientType: GradientType;
  rotation: number;
  activeTab: string;
} 