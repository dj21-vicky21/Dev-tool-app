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
      { id: generateId(), x: 20, y: 20 },
      { id: generateId(), x: 80, y: 20 },
      { id: generateId(), x: 80, y: 80 },
      { id: generateId(), x: 20, y: 80 },
    ],
    backgroundColor: '#f97316', // orange-500
  };
};

// Create a triangle shape
export const createTriangle = (): ShapeProperties => {
  return {
    type: 'polygon',
    points: [
      { id: generateId(), x: 50, y: 10 },   // top
      { id: generateId(), x: 90, y: 90 }, // bottom right
      { id: generateId(), x: 10, y: 90 },  // bottom left
    ],
    backgroundColor: '#f97316', // orange-500
  };
};

// Create a pentagon shape
export const createPentagon = (): ShapeProperties => {
  const points = [];
  const sides = 5;
  const radius = 40; // Reduced to stay within bounds
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
      { id: generateId(), x: 20, y: 20 },
      { id: generateId(), x: 80, y: 20 },
      { id: generateId(), x: 80, y: 80 },
      { id: generateId(), x: 20, y: 80 },
    ],
    backgroundColor: '#ef4444', // Red color
  };
}

// Create a star shape
export const createStar = (): ShapeProperties => {
  const points = [];
  const outerRadius = 45; // Reduced from 50 to stay within bounds
  const innerRadius = 20; // Reduced from 25
  const spikes = 5;
  const centerX = 50;
  const centerY = 50;
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = ((i * Math.PI) / spikes) - (Math.PI / 2); // Start from top
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

// Create a diamond shape
export const createDiamond = (): ShapeProperties => {
  return {
    type: 'polygon',
    points: [
      { id: generateId(), x: 50, y: 10 },  // top
      { id: generateId(), x: 90, y: 50 }, // right
      { id: generateId(), x: 50, y: 90 }, // bottom
      { id: generateId(), x: 10, y: 50 },  // left
    ],
    backgroundColor: '#f97316', // orange-500
  };
};

// Create a plus shape
export const createPlus = (): ShapeProperties => {
  return {
    type: 'polygon',
    points: [
      { id: generateId(), x: 35, y: 10 },     // top left
      { id: generateId(), x: 65, y: 10 },     // top right
      { id: generateId(), x: 65, y: 35 }, // upper right inner
      { id: generateId(), x: 90, y: 35 },   // right top
      { id: generateId(), x: 90, y: 65 },   // right bottom
      { id: generateId(), x: 65, y: 65 }, // lower right inner
      { id: generateId(), x: 65, y: 90 },   // bottom right
      { id: generateId(), x: 35, y: 90 },   // bottom left
      { id: generateId(), x: 35, y: 65 }, // lower left inner
      { id: generateId(), x: 10, y: 65 },     // left bottom
      { id: generateId(), x: 10, y: 35 },     // left top
      { id: generateId(), x: 35, y: 35 }, // upper left inner
    ],
    backgroundColor: '#f97316', // orange-500
  };
};

// Create a right arrow shape
export const createRightArrow = (): ShapeProperties => {
  return {
    type: 'polygon',
    points: [
      { id: generateId(), x: 10, y: 35 },    // left top
      { id: generateId(), x: 65, y: 35 },    // right top before arrow
      { id: generateId(), x: 65, y: 20 },    // arrow top inner
      { id: generateId(), x: 90, y: 50 },    // arrow tip
      { id: generateId(), x: 65, y: 80 },    // arrow bottom inner
      { id: generateId(), x: 65, y: 65 },    // right bottom before arrow
      { id: generateId(), x: 10, y: 65 },    // left bottom
    ],
    backgroundColor: '#f97316', // orange-500
  };
};

// Create a left arrow shape
export const createLeftArrow = (): ShapeProperties => {
  return {
    type: 'polygon',
    points: [
      { id: generateId(), x: 90, y: 35 },    // right top
      { id: generateId(), x: 35, y: 35 },    // left top before arrow
      { id: generateId(), x: 35, y: 20 },    // arrow top inner
      { id: generateId(), x: 10, y: 50 },    // arrow tip
      { id: generateId(), x: 35, y: 80 },    // arrow bottom inner
      { id: generateId(), x: 35, y: 65 },    // left bottom before arrow
      { id: generateId(), x: 90, y: 65 },    // right bottom
    ],
    backgroundColor: '#f97316', // orange-500
  };
};

// Create a cylinder shape
export const createCylinder = (): ShapeProperties => {
  return {
    type: 'polygon',
    points: [
      { id: generateId(), x: 30, y: 20 },  // top left
      { id: generateId(), x: 70, y: 20 },  // top right
      { id: generateId(), x: 80, y: 30 },  // right top curve
      { id: generateId(), x: 80, y: 70 },  // right bottom curve
      { id: generateId(), x: 70, y: 80 },  // bottom right
      { id: generateId(), x: 30, y: 80 },  // bottom left
      { id: generateId(), x: 20, y: 70 },  // left bottom curve
      { id: generateId(), x: 20, y: 30 },  // left top curve
    ],
    backgroundColor: '#f97316', // orange-500
  };
}; 