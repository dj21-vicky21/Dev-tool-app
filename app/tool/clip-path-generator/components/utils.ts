import { Point, ShapeProperties, GridLine } from './types';

// Generate a unique ID for points
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Generate CSS clip-path property from shape properties
export const generateClipPath = (properties: ShapeProperties): string => {
  const { type, points } = properties;
  
  switch (type) {
    case 'polygon':
      return `polygon(${points.map(p => `${formatPercent(p.x)} ${formatPercent(p.y)}`).join(', ')})`;
    
    case 'circle':
      const center = findCenter(points);
      const radius = properties.radius || 50;
      return `circle(${radius}% at ${formatPercent(center.x)} ${formatPercent(center.y)})`;
    
    case 'ellipse':
      const ellipseCenter = findCenter(points);
      const radiusX = properties.radiusX || 50;
      const radiusY = properties.radiusY || 50;
      return `ellipse(${radiusX}% ${radiusY}% at ${formatPercent(ellipseCenter.x)} ${formatPercent(ellipseCenter.y)})`;
    
    case 'inset':
      const { top = 0, right = 0, bottom = 0, left = 0, borderRadius = 0 } = properties;
      return `inset(${top}% ${right}% ${bottom}% ${left}%${borderRadius > 0 ? ` round ${borderRadius}px` : ''})`;
    
    default:
      return '';
  }
};

// Format a number as percentage for CSS
export const formatPercent = (value: number): string => {
  return `${Math.round(value * 100) / 100}%`;
};

// Calculate the center point of a shape
export const findCenter = (points: Point[]): Point => {
  if (points.length === 0) return { id: generateId(), x: 50, y: 50 };
  
  const sum = points.reduce((acc, point) => ({
    x: acc.x + point.x,
    y: acc.y + point.y,
    id: ''
  }), { x: 0, y: 0, id: '' });
  
  return {
    id: generateId(),
    x: sum.x / points.length,
    y: sum.y / points.length
  };
};

// Create a square shape
export const createSquare = (): ShapeProperties => {
  return {
    type: 'polygon',
    points: [
      { id: generateId(), x: 25, y: 25 },
      { id: generateId(), x: 75, y: 25 },
      { id: generateId(), x: 75, y: 75 },
      { id: generateId(), x: 25, y: 75 },
    ],
    backgroundColor: '#f97316', // orange-500
  };
};

// Create a triangle shape
export const createTriangle = (): ShapeProperties => {
  return {
    type: 'polygon',
    points: [
      { id: generateId(), x: 50, y: 0 },   // top
      { id: generateId(), x: 100, y: 100 }, // bottom right
      { id: generateId(), x: 0, y: 100 },  // bottom left
    ],
    backgroundColor: '#f97316', // orange-500
  };
};

// Create a pentagon shape
export const createPentagon = (): ShapeProperties => {
  const points = [];
  const sides = 5;
  const radius = 50;
  const centerX = 50;
  const centerY = 50;
  
  for (let i = 0; i < sides; i++) {
    const angle = ((i * 2 * Math.PI) / sides) - (Math.PI / 2); // Start from top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ id: generateId(), x, y });
  }
  
  return {
    type: 'polygon',
    points,
    backgroundColor: '#f97316', // orange-500
  };
};

// Create a circle shape
export const createCircle = (): ShapeProperties => {
  const points = [];
  const sides = 12; // More sides make it more circle-like
  const radius = 50;
  const centerX = 50;
  const centerY = 50;
  
  for (let i = 0; i < sides; i++) {
    const angle = ((i * 2 * Math.PI) / sides);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ id: generateId(), x, y });
  }
  
  return {
    type: 'polygon',
    points,
    backgroundColor: '#f97316', // orange-500
  };
};

// Calculate distance between two points
export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Check if a point is close to a grid line
export const isCloseToGridLine = (
  point: Point, 
  gridLines: GridLine[], 
  threshold: number = 2
): GridLine | null => {
  for (const line of gridLines) {
    if (line.type === 'horizontal' && Math.abs(point.y - line.position) < threshold) {
      return line;
    }
    if (line.type === 'vertical' && Math.abs(point.x - line.position) < threshold) {
      return line;
    }
    if (line.type === 'circular') {
      const center: Point = { id: generateId(), x: 50, y: 50 }; // Assume center is at 50%
      const dist = distance(point, center);
      if (Math.abs(dist - line.position) < threshold) {
        return line;
      }
    }
  }
  return null;
};

// Generate grid lines for snapping
export const generateGridLines = (): GridLine[] => {
  const lines: GridLine[] = [];
  
  // Add horizontal and vertical lines at 0%, 25%, 50%, 75%, 100%
  [0, 25, 50, 75, 100].forEach(pos => {
    lines.push({ id: generateId(), type: 'horizontal', position: pos });
    lines.push({ id: generateId(), type: 'vertical', position: pos });
  });
  
  // Add circular lines for radius snapping
  [25, 50, 75].forEach(radius => {
    lines.push({ id: generateId(), type: 'circular', position: radius });
  });
  
  return lines;
};

// Create a default polygon shape
export function createDefaultShape(): ShapeProperties {
  return {
    type: 'polygon',
    points: [
      { id: generateId(), x: 25, y: 25 },
      { id: generateId(), x: 75, y: 25 },
      { id: generateId(), x: 75, y: 75 },
      { id: generateId(), x: 25, y: 75 },
    ],
    backgroundColor: '#ef4444', // Red color
  };
} 