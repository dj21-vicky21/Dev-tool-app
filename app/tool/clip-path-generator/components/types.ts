// Point represents a draggable point on the canvas
export interface Point {
  id: string;
  x: number;
  y: number;
}

// Shape type for clip-path
export type ClipPathShapeType = 'polygon' | 'circle' | 'ellipse' | 'inset';

// Shape properties interface
export interface ShapeProperties {
  type: ClipPathShapeType;
  points: Point[];
  backgroundColor: string;
  
  // Circle/ellipse specific properties
  radius?: number;
  radiusX?: number;
  radiusY?: number;
  
  // Inset specific properties
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  borderRadius?: number;
}

// Grid snap points for visual guides
export interface GridLine {
  id: string;
  type: 'horizontal' | 'vertical' | 'circular';
  position: number; // x for vertical, y for horizontal, radius for circular
  opacity?: number;
} 