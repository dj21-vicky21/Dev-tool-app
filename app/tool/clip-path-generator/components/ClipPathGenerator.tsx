"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clipboard, RefreshCcw, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { ShapeProperties, Point, GridLine } from './types';
import {
  createDefaultShape,
  generateClipPath,
  generateGridLines,
  generateId,
} from './utils';
import { Card } from '@/components/ui/card';
import './styles.css';
import PresetShapes from './PresetShapes';

// Define guide type for consistency
type GuidesState = {
  horizontal: number[];
  vertical: number[];
  circles: { cx: number; cy: number; r: number }[];
  angles: { x: number; y: number; angle: number }[];
};

// Constants for application settings
const SNAP_STRENGTH = 2; // Central control for all snapping thresholds

export default function ClipPathGenerator() {
  // States for shape management
  const [shape, setShape] = useState<ShapeProperties>(createDefaultShape());
  const [clipPathCSS, setClipPathCSS] = useState<string>('');
  const [activePoint, setActivePoint] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const gridLines = generateGridLines(); // Changed to constant since it's not modified
  const [visibleGridLines, setVisibleGridLines] = useState<GridLine[]>([]);
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);
  // Track whether mouse moved during drag to distinguish between clicks and drags
  const [hasMoved, setHasMoved] = useState<boolean>(false);
  // Timestamp to prevent rapid consecutive point creation
  const lastClickTimeRef = useRef<number>(0);
  // Add a state to track the currently dragged point ID for styling other points
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  
  // References
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Add new state for toggling visibility
  const [showClippedArea, setShowClippedArea] = useState<boolean>(true);
  
  // Add states for moving the entire shape
  const [isMovingShape, setIsMovingShape] = useState<boolean>(false);
  const [moveStartPosition, setMoveStartPosition] = useState<{x: number, y: number} | null>(null);
  
  // Add new state variables for advanced snapping
  const [showAdvancedGuides, setShowAdvancedGuides] = useState<boolean>(true);
  const [activeGuides, setActiveGuides] = useState<GuidesState>({
    horizontal: [],
    vertical: [],
    circles: [],
    angles: []
  });
  
  // Add a new state for tracking snapped guide indicators
  const [snappedGuides, setSnappedGuides] = useState<GuidesState>({
    horizontal: [],
    vertical: [],
    circles: [],
    angles: []
  });

  // Add state to track original point positions
  const [originalPointPositions, setOriginalPointPositions] = useState<Map<string, {x: number, y: number}>>(new Map());
  
  // Add state to track the point we're snapping to
  const [snappedPointId, setSnappedPointId] = useState<string | null>(null);
  
  // Update CSS output whenever shape changes
  useEffect(() => {
    const cssValue = generateClipPath(shape);
    setClipPathCSS(cssValue);
  }, [shape]);

  // Set up event listeners for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Add window-level mouse event listeners when dragging or moving shape
  useEffect(() => {
    if (isDragging || isMovingShape) {
      let localHasMoved = false;
      
      const handleMouseMoveGlobal = (e: MouseEvent) => {
        // Prevent default browser behavior that might interfere with dragging
        e.preventDefault();
        
        const mousePos = calculatePosition(e);
        
        // Handle shape movement
        if (isMovingShape && moveStartPosition) {
          const deltaX = mousePos.x - moveStartPosition.x;
          const deltaY = mousePos.y - moveStartPosition.y;
          
          // Calculate the potential new positions of all points
          const newPositions = shape.points.map(point => ({
            ...point,
            x: point.x + deltaX,
            y: point.y + deltaY
          }));
          
          // Check if any of the new positions would go out of bounds
          const wouldExceedBoundary = newPositions.some(point => 
            point.x < 0 || point.x > 100 || 
            point.y < 0 || point.y > 100
          );
          
          if (wouldExceedBoundary) {
            // If would exceed, calculate the maximum allowed movement
            let maxDeltaX = deltaX;
            let maxDeltaY = deltaY;
            
            // For each point, calculate how far it can move before hitting a boundary
            shape.points.forEach(point => {
              // X-axis constraints
              if (deltaX > 0) { // Moving right
                const distanceToRightEdge = 100 - point.x;
                maxDeltaX = Math.min(maxDeltaX, distanceToRightEdge);
              } else if (deltaX < 0) { // Moving left
                const distanceToLeftEdge = point.x;
                maxDeltaX = Math.max(maxDeltaX, -distanceToLeftEdge);
              }
              
              // Y-axis constraints
              if (deltaY > 0) { // Moving down
                const distanceToBottomEdge = 100 - point.y;
                maxDeltaY = Math.min(maxDeltaY, distanceToBottomEdge);
              } else if (deltaY < 0) { // Moving up
                const distanceToTopEdge = point.y;
                maxDeltaY = Math.max(maxDeltaY, -distanceToTopEdge);
              }
            });
            
            // Apply the maximum allowed movement
            const updatedPoints = shape.points.map(point => ({
              ...point,
              x: point.x + maxDeltaX,
              y: point.y + maxDeltaY
            }));
            
            // Update the start position for the next movement
            setMoveStartPosition(mousePos);
            
            // Update the shape with the new points
            setShape({ ...shape, points: updatedPoints });
          } else {
            // If no boundary issues, proceed with normal movement
            const updatedPoints = shape.points.map(point => ({
              ...point,
              x: point.x + deltaX,
              y: point.y + deltaY
            }));
            
            // Update the start position for the next movement
            setMoveStartPosition(mousePos);
            
            // Update the shape with the new points
            setShape({ ...shape, points: updatedPoints });
          }
          
          return; // Skip point movement
        }
        
        // Handle point movement
        if (isDragging && activePoint) {
          // Check if the mouse has moved significantly to consider it a drag
          if (!localHasMoved) {
            if (Math.abs(mousePos.x - activePoint.x) > 1 || Math.abs(mousePos.y - activePoint.y) > 1) {
              localHasMoved = true;
              setHasMoved(true);
            }
          }
          
          let newX = Math.max(0, Math.min(100, mousePos.x));
          let newY = Math.max(0, Math.min(100, mousePos.y));
          
          // Snap to grid if enabled and not holding shift key
          if (snapToGrid && !shiftPressed) {
            const newVisibleLines: GridLine[] = [];
            
            // Create arrays to store all snapped guides
            const snappedHorizontalGuides: number[] = [];
            const snappedVerticalGuides: number[] = [];
            const snappedCircleGuides: Array<typeof activeGuides.circles[0]> = [];
            const snappedAngleGuides: typeof activeGuides.angles[0][] = [];
            
            // First check for snapping to existing polygon points
            // This takes highest priority over all other snapping
            const pointSnap = snapToExistingPoints(newX, newY, activePoint.id);
            if (pointSnap.snappedToPoint) {
              newX = pointSnap.snappedX;
              newY = pointSnap.snappedY;
              
              // Add horizontal and vertical guides for the snapped point
              snappedHorizontalGuides.push(newY);
              snappedVerticalGuides.push(newX);
              
              // Add guide lines for the snapped point
              newVisibleLines.push({
                id: generateId(),
                type: 'horizontal',
                position: newY,
                opacity: 1.0
              });
              
              newVisibleLines.push({
                id: generateId(),
                type: 'vertical',
                position: newX,
                opacity: 1.0
              });
              
              // Update snapped guides and visible grid lines
              setSnappedGuides({
                horizontal: snappedHorizontalGuides,
                vertical: snappedVerticalGuides,
                circles: snappedCircleGuides,
                angles: snappedAngleGuides
              });
              
              setVisibleGridLines(newVisibleLines);
              
              // Update the active point position
              const updatedPoint = {
                ...activePoint,
                x: newX,
                y: newY
              };
              
              // Update shape with the new point position
              setShape(prevShape => {
                const newPoints = [...prevShape.points];
                const idx = newPoints.findIndex(p => p.id === activePoint.id);
                if (idx >= 0) {
                  newPoints[idx] = updatedPoint;
                }
                return {
                  ...prevShape,
                  points: newPoints
                };
              });
              
              return;
            }
            
            // Check if we are close to the original position of the point
            const originalPos = originalPointPositions.get(activePoint.id);
            if (originalPos) {
              const distToOriginal = Math.hypot(newX - originalPos.x, newY - originalPos.y);
              
              // If we're close to the original position (within SNAP_STRENGTH units), snap to it exactly
              if (distToOriginal < SNAP_STRENGTH) {
                newX = originalPos.x;
                newY = originalPos.y;
                
                // Add helper guides to show where the original position was
                // Add horizontal guide for original position
                if (!snappedHorizontalGuides.includes(originalPos.y)) {
                  snappedHorizontalGuides.push(originalPos.y);
                  newVisibleLines.push({
                    id: generateId(),
                    type: 'horizontal',
                    position: originalPos.y,
                    opacity: 1.0
                  });
                }
                
                // Add vertical guide for original position
                if (!snappedVerticalGuides.includes(originalPos.x)) {
                  snappedVerticalGuides.push(originalPos.x);
                  newVisibleLines.push({
                    id: generateId(),
                    type: 'vertical',
                    position: originalPos.x,
                    opacity: 1.0
                  });
                }
                
                // Update snapped guides and visible grid lines
                setSnappedGuides({
                  horizontal: snappedHorizontalGuides,
                  vertical: snappedVerticalGuides,
                  circles: snappedCircleGuides,
                  angles: snappedAngleGuides
                });
                
                setVisibleGridLines(newVisibleLines);
                
                // Update the active point position
                const updatedPoint = {
                  ...activePoint,
                  x: newX,
                  y: newY
                };
                
                // Update shape with the new point position
                setShape(prevShape => {
                  const newPoints = [...prevShape.points];
                  const idx = newPoints.findIndex(p => p.id === activePoint.id);
                  if (idx >= 0) {
                    newPoints[idx] = updatedPoint;
                  }
                  return {
                    ...prevShape,
                    points: newPoints
                  };
                });
                
                return;
              }
            }
            
            // First check for intersection points of guides - they have highest priority
            let snappedToIntersection = false;
            
            // Collect all intersection points first before deciding which one to snap to
            const nearbyIntersections: Array<{
              x: number;
              y: number;
              guides: {
                horizontal?: number;
                vertical?: number;
                circles?: typeof activeGuides.circles[0];
                angles?: typeof activeGuides.angles[0][];
              };
            }> = [];
            
            // 1. Check horizontal and vertical line intersections
            for (const hLine of activeGuides.horizontal) {
              for (const vLine of activeGuides.vertical) {
                // Calculate distance from mouse to intersection point
                const dist = Math.hypot(newX - vLine, newY - hLine);
                
                if (dist < SNAP_STRENGTH * 1.5) { // Use slightly larger detection radius to collect candidates
                  nearbyIntersections.push({
                    x: vLine,
                    y: hLine,
                    guides: {
                      horizontal: hLine,
                      vertical: vLine
                    }
                  });
                }
              }
            }
            
            // 2. Add angle guide intersections to the collection
            if (activeGuides.angles && activeGuides.angles.length > 0) {
              for (let i = 0; i < activeGuides.angles.length; i++) {
                const angle1 = activeGuides.angles[i];
                
                for (let j = i + 1; j < activeGuides.angles.length; j++) {
                  const angle2 = activeGuides.angles[j];
                  
                  // Avoid parallel lines (same angle or 180° difference)
                  if (Math.abs(angle1.angle - angle2.angle) % 180 === 0) continue;
                  
                  // Calculate intersection point using line equation
                  // For line 1: y - y1 = tan(angle1) * (x - x1)
                  // For line 2: y - y2 = tan(angle2) * (x - x2)
                  const rad1 = (angle1.angle * Math.PI) / 180;
                  const rad2 = (angle2.angle * Math.PI) / 180;
                  
                  // Calculate slopes. Handle vertical lines (90° and 270°)
                  const tan1 = Math.tan(rad1);
                  const tan2 = Math.tan(rad2);
                  
                  // Calculate intersection
                  let intersectX, intersectY;
                  
                  // Handle special cases where one or both lines are vertical
                  if (angle1.angle % 180 === 90) {
                    // Line 1 is vertical
                    intersectX = angle1.x;
                    intersectY = angle2.y + tan2 * (intersectX - angle2.x);
                  } else if (angle2.angle % 180 === 90) {
                    // Line 2 is vertical
                    intersectX = angle2.x;
                    intersectY = angle1.y + tan1 * (intersectX - angle1.x);
                  } else {
                    // Normal case: neither line is vertical
                    intersectX = 
                      (angle2.y - angle1.y + tan1 * angle1.x - tan2 * angle2.x) / 
                      (tan1 - tan2);
                    intersectY = angle1.y + tan1 * (intersectX - angle1.x);
                  }
                  
                  // Normal intersection check
                  const dist = Math.hypot(newX - intersectX, newY - intersectY);
                  if (dist < SNAP_STRENGTH && // Use global constant for consistency
                      intersectX >= 0 && intersectX <= 100 && 
                      intersectY >= 0 && intersectY <= 100) {
                    // Snap to the intersection
                    newX = intersectX;
                    newY = intersectY;
                    snappedAngleGuides.push(angle1);
                    snappedAngleGuides.push(angle2);
                    snappedToIntersection = true;
                    break;
                  }
                }
                if (snappedToIntersection) break;
              }
            }
            
            // 3. If still not snapped, check intersections between vertical lines and angle guides
            if (!snappedToIntersection && activeGuides.angles && activeGuides.angles.length > 0) {
              for (const vLine of activeGuides.vertical) {
                for (const angleGuide of activeGuides.angles) {
                  // Calculate where the angle line intersects with the vertical line
                  const angleRad = (angleGuide.angle * Math.PI) / 180;
                  
                  // For a line with angle θ passing through origin (x0,y0),
                  // At intersection with vertical line x = vLine,
                  // y = y0 + (vLine - x0) * tan(θ)
                  
                  // Handle horizontal angles (0, 180 degrees) specially
                  const isHorizontalAngle = angleGuide.angle === 0 || angleGuide.angle === 180;
                  let intersectY;
                  
                  if (isHorizontalAngle) {
                    intersectY = angleGuide.y;
                  } else {
                    const tanAngle = Math.tan(angleRad);
                    intersectY = angleGuide.y + (vLine - angleGuide.x) * tanAngle;
                  }
                  
                  // Check if this intersection point is close to mouse
                  const dist = Math.hypot(newX - vLine, newY - intersectY);
                  
                  if (dist < SNAP_STRENGTH && intersectY >= 0 && intersectY <= 100) {
                    // Snap to the intersection
                    newX = vLine;
                    newY = intersectY;
                    
                    // Add to snapped guides
                    snappedVerticalGuides.push(vLine);
                    snappedAngleGuides.push(angleGuide);
                    
                    // Add vertical line to visual feedback with stronger appearance
                    newVisibleLines.push({
                      id: generateId(),
                      type: 'vertical',
                      position: vLine,
                      opacity: 1.0
                    });
                    
                    snappedToIntersection = true;
                    break;
                  }
                }
                if (snappedToIntersection) break;
              }
            }
            
            // 4. Check intersections between angle guides
            if (!snappedToIntersection && activeGuides.angles && activeGuides.angles.length > 0) {
              for (let i = 0; i < activeGuides.angles.length; i++) {
                for (let j = i + 1; j < activeGuides.angles.length; j++) {
                  const angle1 = activeGuides.angles[i];
                  const angle2 = activeGuides.angles[j];
                  
                  // Skip parallel lines (same angle)
                  if (angle1.angle === angle2.angle || 
                      angle1.angle === (angle2.angle + 180) % 360 || 
                      angle2.angle === (angle1.angle + 180) % 360) {
                    continue;
                  }
                  
                  // Convert angles to radians
                  const angle1Rad = (angle1.angle * Math.PI) / 180;
                  const angle2Rad = (angle2.angle * Math.PI) / 180;
                  
                  // Calculate slopes (m = tan(theta))
                  const m1 = Math.tan(angle1Rad);
                  const m2 = Math.tan(angle2Rad);
                  
                  // Remove special handling for diagonal intersections
                  if (Math.abs(m1 - m2) < 0.001) {
                    // Lines are nearly parallel, no reliable intersection
                    continue;
                  }
                  
                  // Calculate the general intersection point
                  const intersectX = (angle2.y - angle1.y + m1 * angle1.x - m2 * angle2.x) / (m1 - m2);
                  const intersectY = angle1.y + m1 * (intersectX - angle1.x);
                  
                  // Normal intersection check
                  const dist = Math.hypot(newX - intersectX, newY - intersectY);
                  if (dist < SNAP_STRENGTH && 
                      intersectX >= 0 && intersectX <= 100 && 
                      intersectY >= 0 && intersectY <= 100) {
                    // Snap to the intersection
                    newX = intersectX;
                    newY = intersectY;
                    snappedAngleGuides.push(angle1);
                    snappedAngleGuides.push(angle2);
                    snappedToIntersection = true;
                    break;
                  }
                }
                if (snappedToIntersection) break;
              }
            }
            
            // If not snapped to any intersection, check individual guides
            if (!snappedToIntersection) {
              // Check for circle and line intersections first
              if (showAdvancedGuides && activeGuides.circles.length > 0) {
                
                // Check circle intersections with horizontal lines - FIX SNAPPING TO NEAREST POINT
                const allNearbyIntersections: Array<{
                  x: number;
                  y: number;
                  distance: number;
                  type: string;
                  guides: {
                    horizontal?: number;
                    vertical?: number;
                    circle?: typeof activeGuides.circles[0];
                    circles?: typeof activeGuides.circles[0][]; // Fix type to be array of circles
                  };
                }> = [];

                // Collect ALL possible intersection points first (horizontal, vertical, and circles)
                // Check all circle-horizontal intersections
                for (const circle of activeGuides.circles) {
                  for (const hLine of activeGuides.horizontal) {
                    // Only check if horizontal line is near the circle
                    if (Math.abs(hLine - circle.cy) <= circle.r) {
                      const yDiff = Math.abs(hLine - circle.cy);
                      const xDist = Math.sqrt(circle.r * circle.r - yDiff * yDiff);
                      
                      // Calculate both intersection points
                      const leftX = circle.cx - xDist;
                      const rightX = circle.cx + xDist;
                      
                      // Calculate distances to both points
                      const leftDist = Math.hypot(newX - leftX, newY - hLine);
                      const rightDist = Math.hypot(newX - rightX, newY - hLine);
                      
                      // Add both intersection points to the collection
                      if (leftDist < SNAP_STRENGTH * 2) {
                        allNearbyIntersections.push({
                          x: leftX,
                          y: hLine,
                          distance: leftDist,
                          type: 'circle-horizontal',
                          guides: {
                            horizontal: hLine,
                            circle: circle
                          }
                        });
                      }
                      
                      if (rightDist < SNAP_STRENGTH * 2) {
                        allNearbyIntersections.push({
                          x: rightX,
                          y: hLine,
                          distance: rightDist,
                          type: 'circle-horizontal',
                          guides: {
                            horizontal: hLine,
                            circle: circle
                          }
                        });
                      }
                    }
                  }
                  
                  // Check all circle-vertical intersections
                  for (const vLine of activeGuides.vertical) {
                    // Only check if vertical line is near the circle
                    if (Math.abs(vLine - circle.cx) <= circle.r) {
                      const xDiff = Math.abs(vLine - circle.cx);
                      const yDist = Math.sqrt(circle.r * circle.r - xDiff * xDiff);
                      
                      // Calculate both intersection points
                      const topY = circle.cy - yDist;
                      const bottomY = circle.cy + yDist;
                      
                      // Calculate distances to both points
                      const topDist = Math.hypot(newX - vLine, newY - topY);
                      const bottomDist = Math.hypot(newX - vLine, newY - bottomY);
                      
                      // Add both intersection points to the collection
                      if (topDist < SNAP_STRENGTH * 2) {
                        allNearbyIntersections.push({
                          x: vLine,
                          y: topY,
                          distance: topDist,
                          type: 'circle-vertical',
                          guides: {
                            vertical: vLine,
                            circle: circle
                          }
                        });
                      }
                      
                      if (bottomDist < SNAP_STRENGTH * 2) {
                        allNearbyIntersections.push({
                          x: vLine,
                          y: bottomY,
                          distance: bottomDist,
                          type: 'circle-vertical',
                          guides: {
                            vertical: vLine,
                            circle: circle
                          }
                        });
                      }
                    }
                  }
                }

                // Add circle-to-circle intersections to the collection
                if (activeGuides.circles.length > 1) {
                  for (let i = 0; i < activeGuides.circles.length; i++) {
                    for (let j = i + 1; j < activeGuides.circles.length; j++) {
                      const circle1 = activeGuides.circles[i];
                      const circle2 = activeGuides.circles[j];
                      
                      // Calculate distance between circle centers
                      const centerDist = Math.hypot(circle1.cx - circle2.cx, circle1.cy - circle2.cy);
                      
                      // Check if circles intersect: |r1-r2| < d < r1+r2
                      if (Math.abs(circle1.r - circle2.r) < centerDist && centerDist < (circle1.r + circle2.r)) {
                        // Calculate intersection points
                        const x0 = circle1.cx;
                        const y0 = circle1.cy;
                        const r0 = circle1.r;
                        const x1 = circle2.cx;
                        const y1 = circle2.cy;
                        const r1 = circle2.r;
                        
                        const d = centerDist;
                        const a = (r0*r0 - r1*r1 + d*d) / (2*d);
                        const p2x = x0 + a * (x1 - x0) / d;
                        const p2y = y0 + a * (y1 - y0) / d;
                        const h = Math.sqrt(r0*r0 - a*a);
                        const xFactor = (y1 - y0) / d;
                        const yFactor = (x0 - x1) / d;
                        
                        const intersection1X = p2x + h * xFactor;
                        const intersection1Y = p2y + h * yFactor;
                        const intersection2X = p2x - h * xFactor;
                        const intersection2Y = p2y - h * yFactor;
                        
                        // Calculate distances
                        const dist1 = Math.hypot(newX - intersection1X, newY - intersection1Y);
                        const dist2 = Math.hypot(newX - intersection2X, newY - intersection2Y);
                        
                        // Add both intersections to collection
                        if (dist1 < SNAP_STRENGTH * 2) {
                          allNearbyIntersections.push({
                            x: intersection1X,
                            y: intersection1Y,
                            distance: dist1,
                            type: 'circle-circle',
                            guides: {
                              circles: [circle1, circle2]
                            }
                          });
                        }
                        
                        if (dist2 < SNAP_STRENGTH * 2) {
                          allNearbyIntersections.push({
                            x: intersection2X,
                            y: intersection2Y,
                            distance: dist2,
                            type: 'circle-circle',
                            guides: {
                              circles: [circle1, circle2]
                            }
                          });
                        }
                      }
                    }
                  }
                }

                // Now find the closest intersection point from all collected possibilities
                if (allNearbyIntersections.length > 0) {
                  // Sort by distance (ascending)
                  allNearbyIntersections.sort((a, b) => a.distance - b.distance);
                  
                  // Take the closest one
                  const closestIntersection = allNearbyIntersections[0];
                  
                  // Only snap if it's within the actual snap strength threshold
                  if (closestIntersection.distance <= SNAP_STRENGTH) {
                    // Snap to this intersection
                    newX = closestIntersection.x;
                    newY = closestIntersection.y;
                    
                    // Update snapped guides
                    if (closestIntersection.guides.horizontal !== undefined) {
                      snappedHorizontalGuides.push(closestIntersection.guides.horizontal);
                      
                      // Add to visible guides
                      newVisibleLines.push({
                        id: generateId(),
                        type: 'horizontal',
                        position: closestIntersection.guides.horizontal,
                        opacity: 1.0
                      });
                    }
                    
                    if (closestIntersection.guides.vertical !== undefined) {
                      snappedVerticalGuides.push(closestIntersection.guides.vertical);
                      
                      // Add to visible guides
                      newVisibleLines.push({
                        id: generateId(),
                        type: 'vertical',
                        position: closestIntersection.guides.vertical,
                        opacity: 1.0
                      });
                    }
                    
                    if (closestIntersection.guides.circle) {
                      snappedCircleGuides.push(closestIntersection.guides.circle);
                    }
                    
                    if (closestIntersection.guides.circles) {
                      closestIntersection.guides.circles.forEach(circle => {
                        if (circle) snappedCircleGuides.push(circle);
                      });
                    }
                    
                    // Set flag to indicate we've snapped to an intersection
      // We have snapped to an intersection
                    snappedToIntersection = true;
                  }
                }
              }
              
              // If still not snapped to any intersection, check individual guides
              if (!snappedToIntersection) {
                // Check for horizontal snap lines first
                let snappedToHorizontal = false;
                for (const line of activeGuides.horizontal) {
                  if (Math.abs(newY - line) < SNAP_STRENGTH) { // Reduced from existing value to make snapping less aggressive
                    newY = line;
                    snappedHorizontalGuides.push(line);
                    
                    // Add to visible grid lines for visual feedback with stronger appearance
                    newVisibleLines.push({
                      id: generateId(),
                      type: 'horizontal',
                      position: line,
                      opacity: 1.0
                    });
                    
                    snappedToHorizontal = true;
                    break; // Only snap to one horizontal line at a time
                  }
                }
                
                // Check for vertical snap lines
                let snappedToVertical = false;
                for (const line of activeGuides.vertical) {
                  if (Math.abs(newX - line) < SNAP_STRENGTH) { // Reduced from existing value to make snapping less aggressive
                    newX = line;
                    snappedVerticalGuides.push(line);
                    
                    // Add to visible grid lines for visual feedback with stronger appearance
                    newVisibleLines.push({
                      id: generateId(),
                      type: 'vertical',
                      position: line,
                      opacity: 1.0
                    });
                    
                    snappedToVertical = true;
                    break; // Only snap to one vertical line at a time
                  }
                }

                // Check for circular guides if we haven't snapped to both horizontal and vertical
                if (!(snappedToHorizontal && snappedToVertical) && 
                    showAdvancedGuides && activeGuides.circles.length > 0) {
                  
                  // Find the closest circle to snap to
                  let closestCircle = null;
                  let minCircleDist = Infinity;
                  
                  for (const circle of activeGuides.circles) {
                    // Calculate distance from point to circle center
                    const distanceToCenter = Math.hypot(
                      newX - circle.cx,
                      newY - circle.cy
                    );
                    
                    // If the distance is close to the radius, consider it for snapping
                    // Increase the threshold to make snapping less aggressive
                    const radiusDiff = Math.abs(distanceToCenter - circle.r);
                    if (radiusDiff < SNAP_STRENGTH && radiusDiff < minCircleDist) { // Decreased from 6 to 2
                      minCircleDist = radiusDiff;
                      closestCircle = circle;
                    }
                  }
                  
                  // Snap to the closest circle if found
                  if (closestCircle) {
                    // Calculate angle to determine point on circle
                    const angle = Math.atan2(newY - closestCircle.cy, newX - closestCircle.cx);
                    
                    // Position point exactly on the circle
                    newX = closestCircle.cx + Math.cos(angle) * closestCircle.r;
                    newY = closestCircle.cy + Math.sin(angle) * closestCircle.r;
                    
                    // ALWAYS clear all other guides when snapping to a circle
                    // This ensures only the circle is highlighted
                    snappedHorizontalGuides.length = 0;
                    snappedVerticalGuides.length = 0;
                    snappedAngleGuides.length = 0;
                    
                    // Clear any existing visible grid lines
                    newVisibleLines.length = 0;
                    
                    // Properly create a new array instead of reassigning the const
                    snappedCircleGuides.length = 0;
                    snappedCircleGuides.push(closestCircle);
                    
                    // Skip all other guide checks when snapping to a circle
                    // This is critical to prevent unwanted guides from showing
                    
                    // Update snapped guides immediately
                    setSnappedGuides({
                      horizontal: [],
                      vertical: [],
                      circles: snappedCircleGuides,
                      angles: []
                    });
                    
                    // Show only circle-related snap lines
                    setVisibleGridLines(newVisibleLines);
                    
                    // Update the active point position
                    const updatedPoint = {
                      ...activePoint,
                      x: newX,
                      y: newY
                    };
                    
                    // Update shape with the new point position
                    setShape(prevShape => {
                      const newPoints = [...prevShape.points];
                      const idx = newPoints.findIndex(p => p.id === activePoint.id);
                      if (idx >= 0) {
                        newPoints[idx] = updatedPoint;
                      }
                      return {
                        ...prevShape,
                        points: newPoints
                      };
                    });
                    
                    return; // CRITICAL: Exit early to prevent any more snapping checks
                  }
                }
              }
            }
            
            // If still no snapping, try angle guides - with improved angle snapping
            else if (activeGuides.angles && activeGuides.angles.length > 0) {
              // Find the closest angle guide
              let closestAngle = null;
              let minAngleDist = Infinity;
              
              for (const angleGuide of activeGuides.angles) {
                // Calculate if point is close to the angle line
                const dx = newX - angleGuide.x;
                const dy = newY - angleGuide.y;
                
                // Convert angle to radians
                const angleRad = (angleGuide.angle * Math.PI) / 180;
                
                // Calculate distance from point to line
                // For a line with angle θ passing through (x0,y0),
                // the distance of point (x,y) to this line is:
                // |-(x-x0)sin(θ) + (y-y0)cos(θ)|
                const distanceToLine = Math.abs(
                  -dx * Math.sin(angleRad) + dy * Math.cos(angleRad)
                );
                
                // Consider for snapping if close enough
                // Increase threshold to make snapping less aggressive
                if (distanceToLine < SNAP_STRENGTH && distanceToLine < minAngleDist) { // Decreased from 3.5 to 2
                  // Calculate where the projected point would land
                  const projectionLength = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
                  const projX = angleGuide.x + projectionLength * Math.cos(angleRad);
                  const projY = angleGuide.y + projectionLength * Math.sin(angleRad);
                  
                  // Only snap if the projected point is within canvas bounds or not too far beyond
                  // Expanded boundary check to better catch lines that extend through the canvas
                  if (projX >= -20 && projX <= 120 && projY >= -20 && projY <= 120) {
                    minAngleDist = distanceToLine;
                    closestAngle = angleGuide;
                  }
                }
              }
              
              // Snap to the closest angle guide if found
              if (closestAngle) {
                const dx = newX - closestAngle.x;
                const dy = newY - closestAngle.y;
                const angleRad = (closestAngle.angle * Math.PI) / 180;
                
                // Project the point onto the line
                const projectionLength = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
                
                // Calculate new position on the line
                newX = closestAngle.x + projectionLength * Math.cos(angleRad);
                newY = closestAngle.y + projectionLength * Math.sin(angleRad);
                
                // Clear other guide types for exclusive angle snapping
                snappedHorizontalGuides.length = 0;
                snappedVerticalGuides.length = 0;
                snappedCircleGuides.length = 0;
                
                // Clear any existing visible grid lines
                newVisibleLines.length = 0;
                
                // Add this angle to snapped guides
                snappedAngleGuides.length = 0;
                snappedAngleGuides.push(closestAngle);
                
                // Update snapped guides immediately for angle snap
                setSnappedGuides({
                  horizontal: [],
                  vertical: [],
                  circles: [],
                  angles: snappedAngleGuides
                });
                
                // Show only angle-related snap lines
                setVisibleGridLines(newVisibleLines);
                
                // Update the active point position
                const updatedPoint = {
                  ...activePoint,
                  x: newX,
                  y: newY
                };
                
                // Update shape with the new point position
                setShape(prevShape => {
                  const newPoints = [...prevShape.points];
                  const idx = newPoints.findIndex(p => p.id === activePoint.id);
                  if (idx >= 0) {
                    newPoints[idx] = updatedPoint;
                  }
                  return {
                    ...prevShape,
                    points: newPoints
                  };
                });
                
                return; // Exit early to prevent any more snapping checks
              }
            }
            
            // Update all snapped guides at once to ensure UI consistency
            setSnappedGuides({
              horizontal: snappedHorizontalGuides,
              vertical: snappedVerticalGuides,
              circles: snappedCircleGuides,
              angles: snappedAngleGuides
            });
            
            // Show snap lines temporarily
            setVisibleGridLines(newVisibleLines);
          } else {
            setVisibleGridLines([]);
            // Clear all snapped guides when shift is pressed
            setSnappedGuides({ horizontal: [], vertical: [], circles: [], angles: [] });
          }
          
          // Use requestAnimationFrame for smoother updates
          requestAnimationFrame(() => {
            // Update the active point position
            const updatedPoint = {
              ...activePoint,
              x: Math.max(0, Math.min(100, newX)),
              y: Math.max(0, Math.min(100, newY))
            };
            
            // Check if position actually changed
            if (updatedPoint.x !== activePoint.x || updatedPoint.y !== activePoint.y) {
              setShape(prevShape => {
                const newPoints = [...prevShape.points];
                const idx = newPoints.findIndex(p => p.id === activePoint.id);
                if (idx >= 0) {
                  newPoints[idx] = updatedPoint;
                }
                return {
                  ...prevShape,
                  points: newPoints
                };
              });
            }
          });
        }
      };
      
      const handleMouseUpGlobal = () => {
        // If we were dragging a point, store its final position
        if (isDragging && activePoint) {
          // Find the current position of the point
          const pointIndex = shape.points.findIndex(p => p.id === activePoint.id);
          if (pointIndex !== -1) {
            const currentPos = shape.points[pointIndex];
            
            // Update the original position map if the point landed on a significant location
            // like an intersection or guide
            if (snappedGuides.horizontal.length > 0 || 
                snappedGuides.vertical.length > 0 ||
                snappedGuides.circles.length > 0 ||
                snappedGuides.angles.length > 0) {
              setOriginalPointPositions(prev => {
                const newMap = new Map(prev);
                newMap.set(currentPos.id, {x: currentPos.x, y: currentPos.y});
                return newMap;
              });
            }
          }
        }
        
        // Clear the snapped point ID
        setSnappedPointId(null);
        setDraggedPointId(null);
        
        // Reset all interaction states
        setIsDragging(false);
        setActivePoint(null);
        setHasMoved(false);
        setIsMovingShape(false);
        setMoveStartPosition(null);
        
        // Clear guides
        setActiveGuides({ horizontal: [], vertical: [], circles: [], angles: [] });
        setSnappedGuides({ horizontal: [], vertical: [], circles: [], angles: [] });
        
        // Reset cursor
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'default';
        }
        
        // Hide snap lines after dragging ends
        setTimeout(() => {
          setVisibleGridLines([]);
        }, 300);
      };
      
      // Add global event listeners
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
      
      // Clean up
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveGlobal);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
    }
  }, [isDragging, activePoint, shape, snapToGrid, shiftPressed, gridLines, isMovingShape, moveStartPosition, showAdvancedGuides]);

  // Calculate position from mouse event
  const calculatePosition = (e: React.MouseEvent | MouseEvent): { x: number, y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    return { x, y };
  };

  // Start dragging a point
  const handlePointMouseDown = (e: React.MouseEvent, point: Point) => {
    e.preventDefault();
    e.stopPropagation();
    
    setActivePoint(point);
    setIsDragging(true);
    setHasMoved(false);
    setDraggedPointId(point.id);
    
    // Store the original position of the point
    setOriginalPointPositions(prev => {
      const newMap = new Map(prev);
      newMap.set(point.id, {x: point.x, y: point.y});
      return newMap;
    });
    
    // Generate advanced guides for this point
    generateAdvancedGuides(shape.points.indexOf(point));
    
    // Set event capture to ensure we get all events even if the mouse moves quickly
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grabbing';
    }
  };

  // Start moving the entire shape
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only allow moving if clicking on the clipped area and not on or near points
    if (shape.type !== 'polygon') return;

    const mousePos = calculatePosition(e);
    
    // Don't start moving if we're clicking on or near a point
    if (isNearExistingPoint(mousePos.x, mousePos.y, 10)) {
      return;
    }
    
    // Only allow moving when clicking inside the polygon
    if (isPointInPolygon(mousePos.x, mousePos.y, shape.points)) {
      e.preventDefault();
      e.stopPropagation();
      setIsMovingShape(true);
      setMoveStartPosition(mousePos);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'move';
      }
    }
  };

  // Check if click is on or near any existing point
  const isNearExistingPoint = (x: number, y: number, threshold = 5): boolean => {
    return shape.points.some(point => {
      const distance = Math.sqrt(
        Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
      );
      return distance < threshold;
    });
  };

  // Add a new point
  const handleAddPoint = (e: React.MouseEvent) => {
    if (shape.type !== 'polygon') return;
    
    // Don't add a point if we're currently dragging or just finished dragging
    if (isDragging || hasMoved) return;
    
    // Prevent duplicate clicks within 300ms
    const now = Date.now();
    if (now - lastClickTimeRef.current < 300) {
      return;
    }
    lastClickTimeRef.current = now;
    
    const { x, y } = calculatePosition(e);
    
    // Don't add points too close to existing ones
    if (isNearExistingPoint(x, y)) {
      return;
    }
    
    const newPoint: Point = { id: generateId(), x, y };
    setShape({
      ...shape,
      points: [...shape.points, newPoint]
    });
  };

  // Copy CSS to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`clip-path: ${clipPathCSS};`);
    toast({
      title: "Copied to clipboard",
      description: "CSS clip-path copied to clipboard",
    });
  };

  // Reset to default shape
  const resetShape = () => {
    setShape(createDefaultShape());
  };

  // Set background color
  const handleBackgroundColorChange = (color: string) => {
    setShape({ ...shape, backgroundColor: color });
  };

  // Delete a point
  const deletePoint = (pointId: string) => {
    if (shape.type !== 'polygon' || shape.points.length <= 3) return; // Don't allow fewer than 3 points
    
    setShape({
      ...shape,
      points: shape.points.filter(p => p.id !== pointId)
    });
  };

  // Get canvas click handler based on current state
  const getCanvasClickHandler = () => {
    if (shape.type !== 'polygon') return undefined;
    
    // Add click handler only when not dragging
    return (e: React.MouseEvent) => {
      if (isDragging || hasMoved) return;
      
      // Get the position of the click
      const { x, y } = calculatePosition(e);
      
      // Don't add points inside the clipped area
      if (isPointInPolygon(x, y, shape.points)) {
        return;
      }
      
      handleAddPoint(e);
    };
  };

  // Check if a point is inside the polygon
  const isPointInPolygon = (x: number, y: number, points: Point[]): boolean => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x;
      const yi = points[i].y;
      const xj = points[j].x;
      const yj = points[j].y;
      
      const intersect = ((yi > y) !== (yj > y)) && 
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Update generateAdvancedGuides to create more geometry-based guides
  const generateAdvancedGuides = (activePointIndex: number) => {
    if (activePointIndex === -1) {
      setActiveGuides({
        horizontal: [],
        vertical: [],
        circles: [],
        angles: []
      });
      return;
    }

    const canvasCenter = { x: 50, y: 50 };
    
    const guides = {
      horizontal: [] as number[],
      vertical: [] as number[],
      circles: [] as { cx: number; cy: number; r: number }[],
      angles: [] as { x: number; y: number; angle: number }[]
    };
    
    // Do NOT add guide lines for the active point itself
    // This ensures the point can be dragged freely without its own guides interfering
    
    // Add only key structural guides that help with alignment
    
    // Add canvas center guides
    guides.horizontal.push(canvasCenter.y);
    guides.vertical.push(canvasCenter.x);
    
    // Add key boundaries (top, bottom, left, right edges)
    guides.horizontal.push(0);
    guides.horizontal.push(100);
    guides.vertical.push(0);
    guides.vertical.push(100);
    
    // Remove this section to avoid showing the active pointer in the guidelines
    // No circles centered at canvas center based on active point distance
    guides.circles.push({ cx: canvasCenter.x, cy: canvasCenter.y, r: 25 });
    guides.circles.push({ cx: canvasCenter.x, cy: canvasCenter.y, r: 50 });
    
    // Remove corner circles that are based on the active point position
    // Add corners with fixed radius instead
    guides.circles.push({ cx: 0, cy: 0, r: 25 });
    guides.circles.push({ cx: 100, cy: 0, r: 25 });
    guides.circles.push({ cx: 0, cy: 100, r: 25 });
    guides.circles.push({ cx: 100, cy: 100, r: 25 });

    // Remove all angle guides - we don't need them anymore
    // const keyPoints = [
    //   { x: 0, y: 0 },
    //   { x: 100, y: 0 },
    //   { x: 0, y: 100 },
    //   { x: 100, y: 100 },
    //   { x: 50, y: 50 },
    // ];
    
    // Only add additional guides from other points in the shape
    shape.points.forEach((point, idx) => {
      if (idx !== activePointIndex) {
        // Add horizontal and vertical guides for other points
        guides.horizontal.push(point.y);
        guides.vertical.push(point.x);
        
        // Remove circle guides that reference the active point
        // Instead, create fixed radius circles centered at other points
        guides.circles.push({ cx: point.x, cy: point.y, r: 20 });
      }
    });
    
    setActiveGuides(guides);
  };

  // Update the deduplicateIntersectionPoints function to be more permissive with showing intersections
  const deduplicateIntersectionPoints = (points: Array<{
    x: number;
    y: number;
    isSnapped: boolean;
    type: string;
    hasSnappedGuide: boolean;
    circle?: { cx: number; cy: number; r: number }; // Add circle reference
    line?: number; // Add line reference
  }>) => {
    const uniquePoints = new Map();
    
    // Determine which guide type is currently the primary focus
    const hasCircleSnap = snappedGuides.circles.length > 0;
    const hasHorizontalSnap = snappedGuides.horizontal.length > 0;
    const hasVerticalSnap = snappedGuides.vertical.length > 0;
    const hasAngleSnap = snappedGuides.angles.length > 0;
    
    // Filter points based on the current snap context
    const filteredPoints = points.filter(point => {
      // If no guides are snapped, don't show any points
      if (!hasCircleSnap && !hasHorizontalSnap && !hasVerticalSnap && !hasAngleSnap) {
        return false;
      }
      
      // Always show circle-line intersections when either the circle or line is snapped
      if (point.type === 'circle-line') {
        // For horizontal line intersections
        if (hasHorizontalSnap && point.y !== undefined) {
          const matchesSnappedLine = snappedGuides.horizontal.some(h => Math.abs(h - point.y) < 0.5);
          if (matchesSnappedLine) return true;
        }
        
        // For vertical line intersections
        if (hasVerticalSnap && point.x !== undefined) {
          const matchesSnappedLine = snappedGuides.vertical.some(v => Math.abs(v - point.x) < 0.5);
          if (matchesSnappedLine) return true;
        }
        
        // Check if this point is from a snapped circle
        if (hasCircleSnap && point.circle) {
          const isRelatedToSnappedCircle = snappedGuides.circles.some(c => 
            Math.abs(c.cx - point.circle!.cx) < 1 && 
            Math.abs(c.cy - point.circle!.cy) < 1 && 
            Math.abs(c.r - point.circle!.r) < 1
          );
          return isRelatedToSnappedCircle;
        }
      }
      
      // Show circle-circle intersections when either circle is snapped
      if (point.type === 'circle-circle') {
        // Only show if this point is related to a snapped circle
        if (point.circle && hasCircleSnap) {
          const isRelatedToSnappedCircle = snappedGuides.circles.some(c => 
            Math.abs(c.cx - point.circle!.cx) < 1 && 
            Math.abs(c.cy - point.circle!.cy) < 1 && 
            Math.abs(c.r - point.circle!.r) < 1
          );
          return isRelatedToSnappedCircle;
        }
        return false;
      }
      
      // Show line-line intersections when at least one line is snapped
      if (point.type === 'line-line' && (hasHorizontalSnap || hasVerticalSnap)) {
        if (hasHorizontalSnap && point.y !== undefined) {
          const matchesSnappedLine = snappedGuides.horizontal.some(h => Math.abs(h - point.y) < 0.5);
          if (matchesSnappedLine) return true;
        }
        if (hasVerticalSnap && point.x !== undefined) {
          const matchesSnappedLine = snappedGuides.vertical.some(v => Math.abs(v - point.x) < 0.5);
          if (matchesSnappedLine) return true;
        }
        return false;
      }
      
      // Always prioritize showing fully snapped points
      return point.isSnapped || point.hasSnappedGuide;
    });
    
    // Process each point and use a key based on rounded coordinates
    filteredPoints.forEach(point => {
      // Round to nearest 0.5 to group very close points
      const roundedX = Math.round(point.x * 2) / 2;
      const roundedY = Math.round(point.y * 2) / 2;
      const key = `${roundedX},${roundedY}`;
      
      // If this position doesn't exist yet, or if this point is snapped and the existing one isn't
      if (!uniquePoints.has(key) || (point.isSnapped && !uniquePoints.get(key).isSnapped)) {
        uniquePoints.set(key, point);
      }
    });
    
    return Array.from(uniquePoints.values());
  };

  // Add an effect to track original positions of all points
  useEffect(() => {
    // Initialize the map with current positions of all points
    const newPositions = new Map<string, {x: number, y: number}>();
    
    // Add all current points to the map
    shape.points.forEach(point => {
      // Only add points that aren't already in the map to avoid overwriting saved positions
      if (!originalPointPositions.has(point.id)) {
        newPositions.set(point.id, {x: point.x, y: point.y});
      }
    });
    
    // Update the map if we have new points to add
    if (newPositions.size > 0) {
      setOriginalPointPositions(prev => {
        const combined = new Map(prev);
        // Add new points
        newPositions.forEach((pos, id) => {
          combined.set(id, pos);
        });
        return combined;
      });
    }
    
    // Clean up points that no longer exist in the shape
    setOriginalPointPositions(prev => {
      const updated = new Map(prev);
      // Remove points that don't exist anymore
      for (const id of updated.keys()) {
        if (!shape.points.some(point => point.id === id)) {
          updated.delete(id);
        }
      }
      return updated;
    });
  }, [shape.points]);

  // Update the snapToExistingPoints function to update the snappedPointId state
  const snapToExistingPoints = (newX: number, newY: number, excludePointId: string): { 
    snappedX: number, 
    snappedY: number, 
    snappedToPoint: boolean,
    snappedPointId: string | null 
  } => {
    // Use const for the result object
    const result = { 
      snappedX: newX, 
      snappedY: newY, 
      snappedToPoint: false,
      snappedPointId: null as string | null
    };
    
    // Reduced snap radius for existing points to make it more precise
    const pointSnapRadius = SNAP_STRENGTH; // Decreased from 8 to 3
    
    // Find the closest existing point
    let closestPoint = null;
    let minDistance = Infinity;
    
    for (const point of shape.points) {
      // Skip the point being dragged
      if (point.id === excludePointId) continue;
      
      const distance = Math.hypot(newX - point.x, newY - point.y);
      if (distance < pointSnapRadius && distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }
    
    // If we found a point to snap to
    if (closestPoint) {
      // Update the result object properties instead of reassigning
      result.snappedX = closestPoint.x;
      result.snappedY = closestPoint.y;
      result.snappedToPoint = true;
      result.snappedPointId = closestPoint.id;
      
      // Update the snapped point ID state
      setSnappedPointId(closestPoint.id);
    } else {
      // Clear the snapped point ID state if we're not snapping to a point
      setSnappedPointId(null);
    }
    
    return result;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          {/* Canvas */}
          <div className="relative w-full h-[500px] border rounded-md mb-4 canvas-container">
            <div 
              ref={canvasRef}
              className="absolute inset-0 bg-grid-pattern"
              onClick={getCanvasClickHandler()}
              onMouseDown={handleCanvasMouseDown}
              style={{cursor: isDragging ? 'grabbing' : (isPointInPolygon(50, 50, shape.points) ? 'move' : 'default')}}>

              {/* Render the snap grid lines */}
              {gridLines.map(line => (
                <div
                  key={line.id}
                  className={`snap-line snap-line-${line.type} opacity-10 ${visibleGridLines.some(vl => vl.id === line.id) ? 'opacity-50' : ''}`}
                  style={{
                    [line.type === 'horizontal' ? 'top' : 'left']: `${line.position}%`,
                  }}
                />
              ))}
              
              {/* Render advanced guide lines */}
              {showAdvancedGuides && isDragging && (
                <div className="guides-container">
                  {/* Horizontal guides */}
                  {activeGuides.horizontal.map((position, index) => (
                    <div
                      key={`h-guide-${index}`}
                      className={`guide-line guide-horizontal ${snappedGuides.horizontal.includes(position) ? 'guide-snapped' : ''}`}
                      style={{ top: `${position}%` }}
                    >
                      {/* Add endpoint markers */}
                      <div className="guide-point" style={{ left: '0%', top: '50%' }} />
                      <div className="guide-point" style={{ left: '100%', top: '50%' }} />
                      
                      {/* Intersection points with vertical guides - highlighted when both are snapped */}
                      {activeGuides.vertical.map((vPosition, vIndex) => {
                        // Check if both horizontal and vertical lines are snapped
                        const isIntersectionSnapped = 
                          snappedGuides.horizontal.includes(position) && 
                          snappedGuides.vertical.includes(vPosition);
                        
                        return (
                          <div 
                            key={`intersect-h${index}-v${vIndex}`}
                            className={`guide-intersection ${isIntersectionSnapped ? 'guide-intersection-snapped' : ''}`}
                            style={{ left: `${vPosition}%`, top: '50%' }}
                          />
                        );
                      })}
                    </div>
                  ))}
                  
                  {/* Vertical guides */}
                  {activeGuides.vertical.map((position, index) => (
                    <div
                      key={`v-guide-${index}`}
                      className={`guide-line guide-vertical ${snappedGuides.vertical.includes(position) ? 'guide-snapped' : ''}`}
                      style={{ left: `${position}%` }}
                    >
                      {/* Add endpoint markers */}
                      <div className="guide-point" style={{ top: '0%', left: '50%' }} />
                      <div className="guide-point" style={{ top: '100%', left: '50%' }} />
                    </div>
                  ))}
                  
                  {/* Circular guides */}
                  {activeGuides.circles.map((circle, index) => {
                    // Check if this circle is snapped
                    const isSnapped = snappedGuides.circles.some(c => 
                      Math.abs(c.cx - circle.cx) < 1 && 
                      Math.abs(c.cy - circle.cy) < 1 && 
                      Math.abs(c.r - circle.r) < 1
                    );
                    
                    return (
                      <div
                        key={`c-guide-${index}`}
                        className={`guide-circular ${isSnapped ? 'guide-snapped' : ''}`}
                        style={{
                          top: `${circle.cy - circle.r}%`,
                          left: `${circle.cx - circle.r}%`,
                          width: `${circle.r * 2}%`,
                          height: `${circle.r * 2}%`
                        }}
                      >
                        {/* Add small center point marker for each circle */}
                        <div 
                          className="guide-circle-center" 
                          style={{ 
                            top: '50%', 
                            left: '50%'
                          }} 
                        />
                      </div>
                    );
                  })}
                  
                  {/* Angle guides */}
                  {activeGuides.angles.map((angleGuide, index) => {
                    const isSnapped = snappedGuides.angles.some(a => 
                      Math.abs(a.angle - angleGuide.angle) < 1 &&
                      Math.abs(a.x - angleGuide.x) < 1 &&
                      Math.abs(a.y - angleGuide.y) < 1
                    );
                    
                    return (
                      <div 
                        key={`a-guide-${index}`}
                        className={`guide-line guide-angle ${isSnapped ? 'guide-snapped' : ''}`}
                        style={{ 
                          top: `${angleGuide.y}%`, 
                          left: `${angleGuide.x}%`,
                          '--angle-deg': `${angleGuide.angle}deg`
                        } as React.CSSProperties}
                      />
                    );
                  })}
                  
                  {/* Render circle-line intersections separately from the circles */}
                  {isDragging && (() => {
                    // Collect all intersection points into a single array
                    const allIntersectionPoints: Array<{
                      x: number;
                      y: number;
                      isSnapped: boolean;
                      type: string;
                      hasSnappedGuide: boolean;
                      circle?: { cx: number; cy: number; r: number }; // Add circle reference
                      line?: number; // Add line reference
                    }> = [];

                    // Collect horizontal-vertical intersections
                    activeGuides.horizontal.forEach(hLine => {
                      const isHorizontalSnapped = snappedGuides.horizontal.includes(hLine);
                      
                      activeGuides.vertical.forEach(vLine => {
                        const isVerticalSnapped = snappedGuides.vertical.includes(vLine);
                        const isIntersectionSnapped = isHorizontalSnapped && isVerticalSnapped;
                        
                        // Only consider this a snapped guide if both the horizontal and vertical lines are snapped
                        // This fixes the issue where lines are highlighted when only the circle is snapped
                        const hasSnappedGuide = (isHorizontalSnapped && isVerticalSnapped) || 
                          (isHorizontalSnapped && snappedGuides.vertical.length === 0) || 
                          (isVerticalSnapped && snappedGuides.horizontal.length === 0);
                        
                        allIntersectionPoints.push({
                          x: vLine,
                          y: hLine, 
                          isSnapped: isIntersectionSnapped,
                          type: 'line-line',
                          hasSnappedGuide,
                          line: isHorizontalSnapped ? hLine : vLine
                        });
                      });
                    });

                    // Collect circle-line intersections
                    activeGuides.circles.forEach(circle => {
                      // Remove the unused isCircleSnapped variable that was causing a linter error
                      
                      // Instead we'll check if this specific circle is snapped when needed
                      const isThisCircleSnapped = snappedGuides.circles.some(c => 
                        Math.abs(c.cx - circle.cx) < 1 && 
                        Math.abs(c.cy - circle.cy) < 1 && 
                        Math.abs(c.r - circle.r) < 1
                      );
                      
                      // Collect circle-horizontal intersections
                      activeGuides.horizontal.forEach(hLine => {
                        const isHorizontalSnapped = snappedGuides.horizontal.includes(hLine);
                        
                        // Important: Mark as snapped if either the line OR this specific circle is snapped
                        const isIntersectionSnapped = isHorizontalSnapped || isThisCircleSnapped;
                        const hasSnappedGuide = isHorizontalSnapped || isThisCircleSnapped;
                        
                        if (Math.abs(hLine - circle.cy) <= circle.r) {
                          const yDiff = Math.abs(hLine - circle.cy);
                          const xDist = Math.sqrt(circle.r * circle.r - yDiff * yDiff);
                          
                          allIntersectionPoints.push({
                            x: circle.cx + xDist,
                            y: hLine,
                            isSnapped: isIntersectionSnapped,
                            type: 'circle-line',
                            hasSnappedGuide,
                            circle: circle,
                            line: hLine
                          });
                          
                          allIntersectionPoints.push({
                            x: circle.cx - xDist,
                            y: hLine,
                            isSnapped: isIntersectionSnapped,
                            type: 'circle-line',
                            hasSnappedGuide,
                            circle: circle,
                            line: hLine
                          });
                        }
                      });
                      
                      // Circle-vertical intersections with improved visibility
                      activeGuides.vertical.forEach(vLine => {
                        const isVerticalSnapped = snappedGuides.vertical.includes(vLine);
                        
                        // Important: Mark as snapped if either the line OR this specific circle is snapped
                        const isIntersectionSnapped = isVerticalSnapped || isThisCircleSnapped;
                        const hasSnappedGuide = isVerticalSnapped || isThisCircleSnapped;
                        
                        if (Math.abs(vLine - circle.cx) <= circle.r) {
                          const xDiff = Math.abs(vLine - circle.cx);
                          const yDist = Math.sqrt(circle.r * circle.r - xDiff * xDiff);
                          
                          allIntersectionPoints.push({
                            x: vLine,
                            y: circle.cy + yDist,
                            isSnapped: isIntersectionSnapped,
                            type: 'circle-line',
                            hasSnappedGuide,
                            circle: circle,
                            line: vLine
                          });
                          
                          allIntersectionPoints.push({
                            x: vLine,
                            y: circle.cy - yDist,
                            isSnapped: isIntersectionSnapped,
                            type: 'circle-line',
                            hasSnappedGuide,
                            circle: circle,
                            line: vLine
                          });
                        }
                      });
                    });

                    // Collect circle-circle intersections
                    if (activeGuides.circles.length > 1) {
                      for (let i = 0; i < activeGuides.circles.length; i++) {
                        const circle1 = activeGuides.circles[i];
                        const isCircle1Snapped = snappedGuides.circles.some(c => 
                          Math.abs(c.cx - circle1.cx) < 1 && 
                          Math.abs(c.cy - circle1.cy) < 1 && 
                          Math.abs(c.r - circle1.r) < 1
                        );
                        
                        for (let j = i + 1; j < activeGuides.circles.length; j++) {
                          const circle2 = activeGuides.circles[j];
                          const isCircle2Snapped = snappedGuides.circles.some(c => 
                            Math.abs(c.cx - circle2.cx) < 1 && 
                            Math.abs(c.cy - circle2.cy) < 1 && 
                            Math.abs(c.r - circle2.r) < 1
                          );
                          
                          const isIntersectionSnapped = isCircle1Snapped || isCircle2Snapped;
                          const hasSnappedGuide = isCircle1Snapped || isCircle2Snapped;
                          
                          // Calculate distance between circle centers
                          const centerDist = Math.hypot(circle1.cx - circle2.cx, circle1.cy - circle2.cy);
                          
                          // Check if circles intersect: |r1-r2| < d < r1+r2
                          if (Math.abs(circle1.r - circle2.r) < centerDist && centerDist < (circle1.r + circle2.r)) {
                            // Calculate intersection points
                            const x0 = circle1.cx;
                            const y0 = circle1.cy;
                            const r0 = circle1.r;
                            const x1 = circle2.cx;
                            const y1 = circle2.cy;
                            const r1 = circle2.r;
                            
                            const d = centerDist;
                            const a = (r0*r0 - r1*r1 + d*d) / (2*d);
                            const p2x = x0 + a * (x1 - x0) / d;
                            const p2y = y0 + a * (y1 - y0) / d;
                            const h = Math.sqrt(r0*r0 - a*a);
                            const xFactor = (y1 - y0) / d;
                            const yFactor = (x0 - x1) / d;
                            
                            const intersection1X = p2x + h * xFactor;
                            const intersection1Y = p2y + h * yFactor;
                            const intersection2X = p2x - h * xFactor;
                            const intersection2Y = p2y - h * yFactor;
                            
                            // Simply add both intersection points without distance checks
                            allIntersectionPoints.push({
                              x: intersection1X,
                              y: intersection1Y,
                              isSnapped: isIntersectionSnapped,
                              type: 'circle-circle',
                              hasSnappedGuide,
                              circle: isCircle1Snapped ? circle1 : circle2
                            });
                            
                            allIntersectionPoints.push({
                              x: intersection2X,
                              y: intersection2Y,
                              isSnapped: isIntersectionSnapped,
                              type: 'circle-circle',
                              hasSnappedGuide,
                              circle: isCircle1Snapped ? circle1 : circle2
                            });
                          }
                        }
                      }
                    }

                    // Deduplicate intersection points
                    const uniqueIntersectionPoints = deduplicateIntersectionPoints(allIntersectionPoints);

                    // Render the unique intersection points
                    return uniqueIntersectionPoints.map((point, index) => (
                      <div 
                        key={`intersection-${index}`}
                        className={`guide-intersection ${point.isSnapped ? 'guide-intersection-snapped' : ''}`} 
                        style={{ 
                          top: `${point.y}%`, 
                          left: `${point.x}%`
                        }} 
                      />
                    ));
                  })()}
                </div>
              )}

              {/* Render clipped area */}
              {showClippedArea && (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-red-500"
                  style={{
                    clipPath: clipPathCSS,
                    opacity: isDragging ? 0.5 : 1, // Reduce opacity when dragging
                    transition: 'opacity 0.2s ease',
                  }}
                />
              )}

              {/* Display draggable points (for polygon) */}
              {shape.type === 'polygon' && shape.points.map(point => (
                <div
                  key={point.id}
                  className={`draggable-point ${snappedPointId === point.id ? 'point-snap-highlight' : ''}`}
                  style={{
                    left: `${point.x}%`, 
                    top: `${point.y}%`,
                    zIndex: snappedPointId === point.id ? 35 : 20,
                    opacity: draggedPointId && draggedPointId !== point.id ? 0.4 : 1, // Reduce opacity of other points
                    transform: `translate(-50%, -50%) ${activePoint?.id === point.id ? 'scale(1.2)' : (snappedPointId === point.id ? 'scale(1.3)' : 'scale(1)')}`,
                    backgroundColor: activePoint?.id === point.id ? 'rgba(249, 115, 22, 0.9)' : 'rgba(239, 71, 170, 0.9)',
                    transition: 'opacity 0.2s ease, transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out, background-color 0.2s ease'
                  }}
                  onMouseDown={(e) => handlePointMouseDown(e, point)}
                >
                  {/* Delete button for points */}
                  <button 
                    className="absolute -top-6 -right-6 w-5 h-5 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-red-500 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deletePoint(point.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {/* Display original position indicators if currently dragging */}
              {isDragging && activePoint && Array.from(originalPointPositions.entries()).map(([pointId, position]) => {
                // Only show for points other than the active point
                if (pointId !== activePoint.id) return null;
                
                return (
                  <React.Fragment key={`original-pos-${pointId}`}>
                    {/* Highlight the snap area around original position */}
                    <div 
                      className="original-position-area"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        width: `10px`,
                        height: `10px`
                      }}
                    />
                    
                    {/* Show original position indicator */}
                    <div 
                      className="original-position-indicator"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`
                      }}
                    />
                  </React.Fragment>
                );
              })}

              {/* Display point-to-point snapping indicator */}
              {isDragging && snappedPointId && shape.points.map(point => {
                if (point.id !== snappedPointId) return null;
                
                return (
                  <div 
                    key={`snap-indicator-${point.id}`}
                    className="polygon-point-snap-indicator"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`
                    }}
                  />
                );
              })}
            </div>
          </div>
          
          {/* CSS Output */}
          <div className="p-4 bg-muted rounded-md">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">CSS Output</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Clipboard className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={resetShape}>
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
            <pre className="p-3 bg-background rounded border text-sm overflow-x-auto">
              {`/* CSS Clip Path */
clip-path: ${clipPathCSS};

/* Element with clip-path applied */
.clipped-element {
  background-color: ${shape.backgroundColor};
  clip-path: ${clipPathCSS};
}`}
            </pre>
          </div>
        </div>
        
        {/* Controls Panel */}
        <div className="w-full md:w-1/3">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Shape Controls</h3>
            
            <div className="space-y-4">
              {/* Shape Type Selector */}
              <div>
                <Label className="block mb-2">Shape Presets</Label>
                <PresetShapes onSelectShape={setShape} />
              </div>
              
              {/* Background Color */}
              <div>
                <Label htmlFor="background-color" className="block mb-2">Clipped Area Color</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 border rounded"
                    style={{ backgroundColor: shape.backgroundColor }}
                  />
                  <Input 
                    id="background-color"
                    type="text" 
                    value={shape.backgroundColor}
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="color"
                    value={shape.backgroundColor}
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                    className="w-10 h-10 p-1"
                  />
                </div>
              </div>
              
              {/* Controls for grid snap and visibility */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="snapToggle"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="snapToggle">Enable Grid Snap</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="visibilityToggle"
                    checked={showClippedArea}
                    onChange={(e) => setShowClippedArea(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="visibilityToggle">Show Clipped Area</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="advancedGuides"
                    checked={showAdvancedGuides}
                    onChange={(e) => setShowAdvancedGuides(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="advancedGuides">Show Advanced Guides</Label>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="mt-4 text-sm text-muted-foreground">
                <h4 className="font-medium text-foreground mb-1">Instructions:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Drag the points to modify the shape</li>
                  <li>Click outside the shape to add a new point</li>
                  <li>Click and drag inside the shape to move the entire shape</li>
                  <li>Hold Shift while dragging to temporarily disable grid snapping</li>
                  <li>Hover over a point to reveal the delete button</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
