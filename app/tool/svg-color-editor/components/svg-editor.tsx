"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ColorPicker } from './color-picker';
import { Download, RefreshCcw } from 'lucide-react';

interface ColorableElement {
  element: SVGElement;
  id: string;  // Add ID field to store a unique identifier
  fill: string | null;
  stroke: string | null;
}

interface SVGEditorProps {
  svgContent: string;
}

// Helper to extract unique colors from SVG elements
function extractUniqueColors(elements: ColorableElement[]): string[] {
  const colorsSet = new Set<string>();

  for (const el of elements) {
    if (el.fill && el.fill !== 'none' && el.fill !== 'transparent') {
      colorsSet.add(el.fill);
    }
    if (el.stroke && el.stroke !== 'none' && el.stroke !== 'transparent') {
      colorsSet.add(el.stroke);
    }
  }

  return Array.from(colorsSet);
}

// Add debounce utility function at the top of the file with other imports
// function debounce<Args extends unknown[]>(
//   func: (...args: Args) => void,
//   wait: number
// ): (...args: Args) => void {
//   let timeout: NodeJS.Timeout | null = null;
  
//   return (...args: Args) => {
//     if (timeout) {
//       clearTimeout(timeout);
//     }
    
//     timeout = setTimeout(() => {
//       func(...args);
//       timeout = null;
//     }, wait);
//   };
// }

// Add interface for color change history
interface ColorChange {
  elements: {
    id: string;
    property: 'fill' | 'stroke';
    previousColor: string | null;
    newColor: string | null;
  }[];
  timestamp: number;
}

export function SVGEditor({ svgContent }: SVGEditorProps) {
  const [svgElements, setSvgElements] = useState<ColorableElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<ColorableElement | null>(null);
  const [activeProperty, setActiveProperty] = useState<'fill' | 'stroke'>('fill');
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedPaletteColor, setSelectedPaletteColor] = useState<string | null>(null);
  
  // Add state for zoom and pan
  const [zoom, setZoom] = useState(1);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  // Add state to detect OS
  const [isMac, setIsMac] = useState(false);

  // Detect Mac vs Windows/Linux
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
  }, []);
  
  // Shortcut key display based on OS
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  // Add state to store original SVG dimensions
  const [originalSvgData, setOriginalSvgData] = useState<{
    viewBox: string | null;
    width: string | null;
    height: string | null;
  }>({ viewBox: null, width: null, height: null });

  // Get unique colors from the SVG for the dynamic palette
  const svgColors = useMemo(() => extractUniqueColors(svgElements), [svgElements]);

  // Add sensitivity factor for panning
  const PAN_SENSITIVITY = 0.5;

  // Calculate the actual pan sensitivity based on viewBox scale
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const calculatePanSensitivity = useCallback(() => {
    if (!svgRef.current) return PAN_SENSITIVITY;
    
    // Get the viewBox and SVG dimensions
    const svgWidth = svgRef.current.clientWidth || svgRef.current.getBoundingClientRect().width;
    const viewBoxWidth = viewBox.width;
    
    // Calculate the scale factor (viewBox units per pixel)
    const scaleFactor = viewBoxWidth / svgWidth;
    
    // Adjust sensitivity based on the scale factor
    // This ensures consistent panning regardless of SVG size
    return PAN_SENSITIVITY * scaleFactor;
  }, [viewBox, svgRef]);

  // Get the current color based on the active property or palette selection
  const getCurrentColor = useCallback(() => {
    if (selectedPaletteColor) return selectedPaletteColor;
    if (!selectedElement) return null;
    return activeProperty === 'fill' ? selectedElement.fill : selectedElement.stroke;
  }, [selectedPaletteColor, selectedElement, activeProperty]);

  // Add this function to get the current element's active color
  const getActiveElementColor = useCallback(() => {
    if (!selectedElement) return null;
    return activeProperty === 'fill' ? selectedElement.fill : selectedElement.stroke;
  }, [selectedElement, activeProperty]);

  // Add state to track if we're panning
  const [isPanning, setIsPanning] = useState(false);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [moveDistance, setMoveDistance] = useState({ x: 0, y: 0 });

  // Add debounced toast function that supports React elements
  // const debouncedToast = useCallback((title: string, description: string | React.ReactNode) => {
  //   debounce((title: string, description: string | React.ReactNode) => {
  //     toast({
  //       title,
  //       description,
  //     });
  //   }, 500)(title, description);
  // }, []);

  // Add state for undo/redo functionality
  const [colorHistory, setColorHistory] = useState<ColorChange[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isColorPickerDragging, setIsColorPickerDragging] = useState(false);
  const [pendingColorChange, setPendingColorChange] = useState<ColorChange | null>(null);

  // Track the last color selected before starting a drag
  const lastStableColorRef = useRef<string | null>(null);

  // Add state to keep track of original SVG colors
  const [originalElements, setOriginalElements] = useState<Map<string, {fill: string | null, stroke: string | null}>>(new Map());

  // Add state to track if the SVG has been modified
  const [isSvgModified, setIsSvgModified] = useState(false);

  // Check if any colors are different from original
  const checkForModifications = useCallback(() => {
    if (originalElements.size === 0 || svgElements.length === 0) return false;
    
    for (const el of svgElements) {
      const originalColors = originalElements.get(el.id);
      if (!originalColors) continue;
      
      if (el.fill !== originalColors.fill || el.stroke !== originalColors.stroke) {
        return true;
      }
    }
    
    return false;
  }, [originalElements, svgElements]);

  // Update modified state whenever SVG elements change
  useEffect(() => {
    setIsSvgModified(checkForModifications());
  }, [svgElements, checkForModifications]);

  // Also update modified state after undo/redo operations
  useEffect(() => {
    if (colorHistory.length > 0) {
      setIsSvgModified(checkForModifications());
    }
  }, [currentHistoryIndex, colorHistory, checkForModifications]);

  // Reset the modified state when loading a new SVG
  useEffect(() => {
    if (svgContent) {
      setIsSvgModified(false);
    }
  }, [svgContent]);

  // Modified parse SVG content to store original colors
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!svgContent || !svgContainerRef.current) return;

    try {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');

      // Check for parsing errors
      const parserError = svgDoc.querySelector('parsererror');
      if (parserError) {
        console.error('SVG parsing error:', parserError.textContent);
        toast({
          title: "SVG Parsing Error",
          description: "The SVG file could not be parsed correctly.",
          variant: "destructive"
        });
        return;
      }

      const svg = svgDoc.documentElement;

      // Store original dimensions, including computed values if attributes are percentages
      const computedStyle = window.getComputedStyle(svg);
      setOriginalSvgData({
        viewBox: svg.getAttribute('viewBox'),
        width: svg.getAttribute('width') || computedStyle.width,
        height: svg.getAttribute('height') || computedStyle.height
      });

      // Clear previous content
      svgContainerRef.current.innerHTML = '';
      svgContainerRef.current.appendChild(svg);

      // Check if the svg is an SVGSVGElement before assigning
      if (svg instanceof SVGSVGElement) {
        svgRef.current = svg;
      } else {
        console.error('The parsed SVG is not an SVGSVGElement');
        toast({
          title: "SVG Error",
          description: "The uploaded file is not a valid SVG.",
          variant: "destructive"
        });
        return;
      }

      // Get all colorable elements (elements with fill or stroke)
      const colorableElements: ColorableElement[] = [];
      const originalElementsMap = new Map<string, {fill: string | null, stroke: string | null}>();
      const elements = svg.querySelectorAll('*');

      let elementCounter = 0;

      for (const el of elements) {
        if (!(el instanceof SVGElement)) continue;

        // Use getAttribute to avoid computed style issues in SSR
        const fill = el.getAttribute('fill');
        const stroke = el.getAttribute('stroke');

        if (fill || stroke) {
          // Generate a unique ID for each element if it doesn't already have one
          const elementId = el.id || `svg-element-${elementCounter++}`;

          // If element doesn't have an ID, assign one for easier reference
          if (!el.id) {
            el.id = elementId;
          }

          // Store original colors
          originalElementsMap.set(elementId, {
            fill: fill === 'none' ? null : fill,
            stroke: stroke === 'none' ? null : stroke,
          });

          colorableElements.push({
            element: el,
            id: elementId,
            fill: fill === 'none' ? null : fill,
            stroke: stroke === 'none' ? null : stroke,
          });
        }
      }

      setSvgElements(colorableElements);
      setOriginalElements(originalElementsMap);
      // Reset the history when loading a new SVG
      setColorHistory([]);
      setCurrentHistoryIndex(-1);

      if (colorableElements.length === 0) {
        toast({
          title: "No colorable elements",
          description: "This SVG doesn't contain elements with color attributes that can be edited.",
        });
      }
    } catch (error) {
      console.error('Error processing SVG:', error);
      toast({
        title: "Error",
        description: "Failed to process the SVG file.",
        variant: "destructive"
      });
    }
  }, [svgContent]);

  // Add this function to highlight elements with a specific color
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const highlightElementsByColor = useCallback((color: string | null) => {
    // Clear all previous highlights
    const allHighlighted = svgRef.current?.querySelectorAll('.selected-element');
    allHighlighted?.forEach(el => {
      el.classList.remove('selected-element');
    });

    if (color) {
      // Find and highlight all elements with this color
      svgElements.forEach(el => {
        if (el.fill === color || el.stroke === color) {
          el.element.classList.add('selected-element');
        }
      });
    }
  }, [svgRef, svgElements]);

  // Handle zoom - define with useCallback for dependency resolution
  const handleZoom = useCallback((factor: number) => {
    const newZoom = Math.min(Math.max(zoom * factor, 0.1), 10); // Limit zoom between 0.1x and 10x
    setZoom(newZoom);
    
    if (svgRef.current) {
      // Keep the current center point
      const currentCenterX = viewBox.x + viewBox.width / 2;
      const currentCenterY = viewBox.y + viewBox.height / 2;
      
      // Calculate new dimensions
      const newWidth = viewBox.width / factor;
      const newHeight = viewBox.height / factor;
      
      // Calculate new position to maintain the same center
      const newX = currentCenterX - newWidth / 2;
      const newY = currentCenterY - newHeight / 2;
      
      svgRef.current.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
      setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
    }
  }, [zoom, viewBox]);

  // Also update the reset function to fit the SVG properly
  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (svgRef.current) {
      const bbox = svgRef.current.getBBox();
      // Add some padding around the SVG
      const padding = 20;
      const viewBoxStr = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
      svgRef.current.setAttribute('viewBox', viewBoxStr);
      setViewBox({
        x: bbox.x - padding,
        y: bbox.y - padding,
        width: bbox.width + padding * 2,
        height: bbox.height + padding * 2
      });
    }
  }, []);

  // Add function to reset SVG to original colors - also update to reset modified state
  const handleResetColors = useCallback(() => {
    if (originalElements.size === 0 || svgElements.length === 0) return;
    
    let changesApplied = false;
    const changedElements: ColorChange['elements'] = [];

    // Create new array to avoid direct mutation
    const updatedElements = svgElements.map(el => {
      const originalColors = originalElements.get(el.id);
      if (!originalColors) return el;
      
      const updatedEl = { ...el };
      
      // Check if current fill is different from original
      if (el.fill !== originalColors.fill) {
        el.element.setAttribute('fill', originalColors.fill || 'none');
        updatedEl.fill = originalColors.fill;
        changesApplied = true;
        changedElements.push({
          id: el.id,
          property: 'fill',
          previousColor: el.fill,
          newColor: originalColors.fill
        });
      }
      
      // Check if current stroke is different from original
      if (el.stroke !== originalColors.stroke) {
        el.element.setAttribute('stroke', originalColors.stroke || 'none');
        updatedEl.stroke = originalColors.stroke;
        changesApplied = true;
        changedElements.push({
          id: el.id,
          property: 'stroke',
          previousColor: el.stroke,
          newColor: originalColors.stroke
        });
      }
      
      return updatedEl;
    });
    
    if (changesApplied) {
      // Update state
      setSvgElements(updatedElements);
      
      // If an element is selected, update its state
    if (selectedElement) {
        const originalColors = originalElements.get(selectedElement.id);
        if (originalColors) {
          setSelectedElement({
            ...selectedElement,
            fill: originalColors.fill,
            stroke: originalColors.stroke
          });
        }
      }
      
      // Add to history
      const resetChange: ColorChange = {
        elements: changedElements,
        timestamp: Date.now()
      };
      
      const newHistory = colorHistory.slice(0, currentHistoryIndex + 1);
      const updatedHistory = [...newHistory, resetChange];
      setColorHistory(updatedHistory);
      setCurrentHistoryIndex(updatedHistory.length - 1);
      
      // Mark SVG as unmodified since we've reset to original colors
      setIsSvgModified(false);
      
      toast({
        title: "Colors Reset",
        description: "All elements have been reset to their original colors",
        variant: "default"
      });
    } else {
      toast({
        title: "No Changes",
        description: "SVG colors are already in their original state",
        variant: "default"
      });
    }
  }, [originalElements, svgElements, selectedElement, colorHistory, currentHistoryIndex]);

  // Add helper function to normalize color
  const normalizeColor = useCallback((color: string | null) => {
    if (!color) return null;
    // Convert to lowercase and ensure only one hash symbol
    return color.toLowerCase().replace(/#+/g, '#');
  }, []);

  // Determine if two colors are visually similar (within a small threshold)
  const areColorsSimilar = useCallback((color1: string | null, color2: string | null) => {
    if (!color1 || !color2) return color1 === color2;
    
    // Normalize both colors
    const normalizedColor1 = normalizeColor(color1);
    const normalizedColor2 = normalizeColor(color2);
    
    // If normalized values are the same, they're similar
    if (normalizedColor1 === normalizedColor2) return true;
    
    // Convert hex to RGB to check color distance
    const hexToRgb = (hex: string) => {
      // Remove hash and handle shorthand hex
      const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
      const fullHex = cleanHex.length === 3 
        ? cleanHex.split('').map(c => c + c).join('') 
        : cleanHex;
      
      const r = parseInt(fullHex.substr(0, 2), 16);
      const g = parseInt(fullHex.substr(2, 2), 16);
      const b = parseInt(fullHex.substr(4, 2), 16);
      
      return [r, g, b];
    };
    
    try {
      const rgb1 = hexToRgb(normalizedColor1 || '#000000');
      const rgb2 = hexToRgb(normalizedColor2 || '#000000');
      
      // Calculate Euclidean distance
      const distance = Math.sqrt(
        Math.pow(rgb1[0] - rgb2[0], 2) +
        Math.pow(rgb1[1] - rgb2[1], 2) +
        Math.pow(rgb1[2] - rgb2[2], 2)
      );
      
      // If distance is below threshold, colors are similar
      // Lower threshold for more strict comparison
      return distance < 2;
    } catch {
      // If any parsing fails, fall back to direct comparison
      return normalizedColor1 === normalizedColor2;
    }
  }, [normalizeColor]);

  // Completely reimplemented handleColorPickerDragEnd with enhanced color history management
  const handleColorPickerDragEnd = useCallback(() => {
    if (!isColorPickerDragging || !pendingColorChange || pendingColorChange.elements.length === 0) {
      // Reset dragging state and exit if no real changes
      setIsColorPickerDragging(false);
      setPendingColorChange(null);
      return;
    }
      
    // Get the final color after dragging ends
    const finalColor = getCurrentColor();
    // Get the color when dragging started
    const initialColor = lastStableColorRef.current;
    
    console.log('Drag ended:', { from: initialColor, to: finalColor });
    
    // Only store history if the final color is actually different from initial
    if (finalColor !== initialColor) {
      // Normalize colors for proper comparison
      const normalizedFinalColor = normalizeColor(finalColor);
      const normalizedInitialColor = normalizeColor(initialColor);
      
      // Double-check that colors are actually different after normalization
      if (normalizedFinalColor !== normalizedInitialColor) {
        console.log('Colors differ after normalization:', { 
          from: normalizedInitialColor, 
          to: normalizedFinalColor,
          changed: pendingColorChange.elements.length 
        });
        
        // Create a clean history entry with only the initial and final colors
        // This avoids storing intermediate steps during dragging
        const cleanHistoryEntry: ColorChange = {
          timestamp: Date.now(),
          elements: pendingColorChange.elements.map(el => ({
            id: el.id,
            property: el.property,
            // Initial color is what we had before drag started
            previousColor: normalizedInitialColor,
            // Final color is the one we ended with after drag completed
            newColor: normalizedFinalColor
          }))
        };
        
        // Truncate any forward history if needed
        const newHistory = colorHistory.slice(0, currentHistoryIndex + 1);
        
        // Compare with last history entry to avoid duplicates
        let shouldAddToHistory = true;
        if (newHistory.length > 0) {
          const lastEntry = newHistory[newHistory.length - 1];
          
          // Check if this is essentially the same change as the previous one
          if (lastEntry.elements.length === cleanHistoryEntry.elements.length) {
            // Only compare element IDs and final colors for duplication check
            const isDuplicate = cleanHistoryEntry.elements.every((el, idx) => {
              const prevEl = lastEntry.elements[idx];
              return (
                el.id === prevEl.id && 
                el.property === prevEl.property && 
                areColorsSimilar(el.newColor, prevEl.newColor)
              );
            });
            
            if (isDuplicate) {
              console.log('Skipping duplicate history entry');
              shouldAddToHistory = false;
            }
          }
        }
        
        // Add to history if not a duplicate
        if (shouldAddToHistory) {
          const updatedHistory = [...newHistory, cleanHistoryEntry];
          setColorHistory(updatedHistory);
          setCurrentHistoryIndex(updatedHistory.length - 1);
          setIsSvgModified(true);
          
          // Show notification about the color change
          // debouncedToast(
          //   "Color updated",
          //   pendingColorChange.elements.length > 1 
          //     ? <div className="flex items-center">
          //         <span>Updated {pendingColorChange.elements.length} elements to </span>
          //         <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: finalColor || 'transparent' }}></div>
          //         <code className="bg-secondary text-secondary-foreground px-1 rounded">{finalColor || 'transparent'}</code>
          //       </div>
          //     : <div className="flex items-center">
          //         <span>Updated {pendingColorChange.elements[0].property} to </span>
          //         <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: finalColor || 'transparent' }}></div>
          //         <code className="bg-secondary text-secondary-foreground px-1 rounded">{finalColor || 'transparent'}</code>
          //       </div>
          // );
        }
      } else {
        console.log('Colors too similar after normalization, skipping history entry');
      }
    } else {
      console.log('No actual color change detected, skipping history entry');
    }
    
    // Always reset dragging state
    setIsColorPickerDragging(false);
    setPendingColorChange(null);
  }, [isColorPickerDragging, pendingColorChange, colorHistory, currentHistoryIndex, getCurrentColor, lastStableColorRef, normalizeColor, areColorsSimilar]);

  // Improved undo with better color comparison
  const handleUndo = useCallback(() => {
    if (currentHistoryIndex >= 0 && colorHistory.length > 0) {
      console.log(`Undoing change ${currentHistoryIndex} of ${colorHistory.length}`);
      const change = colorHistory[currentHistoryIndex];
      
      // Create a copy of the SVG elements to modify
      const updatedElements = [...svgElements];
      
      // Process changes by element to ensure consistent state
      const elementChangeMap = new Map<string, {
        id: string,
        changes: {
          property: 'fill' | 'stroke',
          previousColor: string | null
        }[]
      }>();
      
      // Group changes by element id
      change.elements.forEach(item => {
        if (!elementChangeMap.has(item.id)) {
          elementChangeMap.set(item.id, {
            id: item.id,
            changes: []
          });
        }
        
        const element = elementChangeMap.get(item.id);
        if (element) {
          element.changes.push({
            property: item.property,
            previousColor: item.previousColor
          });
        }
      });
      
      // Track whether we're undoing to original state
      const isUndoToOriginal = currentHistoryIndex === 0;
      
      // Apply grouped changes to each element
      elementChangeMap.forEach((elementChanges, id) => {
        const elementIndex = updatedElements.findIndex(el => el.id === id);
        if (elementIndex !== -1) {
          const element = updatedElements[elementIndex];
          const updatedElement = { ...element };
          
          // Get original colors if we're undoing to initial state
          const originalColors = isUndoToOriginal ? originalElements.get(id) : null;
          
          // Apply each property change to this element
          elementChanges.changes.forEach(changeItem => {
            // For the first undo, prioritize restoring to original colors
            let colorToRestore = changeItem.previousColor;
            
            // If undoing to initial state, use original colors when available
            if (isUndoToOriginal && originalColors) {
              if (changeItem.property === 'fill' && originalColors.fill !== null) {
                colorToRestore = originalColors.fill;
              } else if (changeItem.property === 'stroke' && originalColors.stroke !== null) {
                colorToRestore = originalColors.stroke;
              }
            }
            
            // Update the DOM element
            const colorValue = colorToRestore || 'none';
            element.element.setAttribute(changeItem.property, colorValue);
            
            // Then update our state object
            if (changeItem.property === 'fill') {
              updatedElement.fill = colorToRestore;
            } else {
              updatedElement.stroke = colorToRestore;
            }
          });
          
          // Replace the element in our state array
          updatedElements[elementIndex] = updatedElement;
        }
      });
      
      // Update state with all changes at once for better performance
      setSvgElements(updatedElements);
      
      // Update the selected element if it's part of the change
      if (selectedElement) {
        const changedElement = change.elements.find(item => item.id === selectedElement.id);
        if (changedElement) {
          const updatedElement = { ...selectedElement };
          
          // For the first undo, prioritize restoring to original colors
          if (isUndoToOriginal) {
            const originalColors = originalElements.get(selectedElement.id);
            if (originalColors) {
              if (changedElement.property === 'fill') {
                updatedElement.fill = originalColors.fill;
              } else {
                updatedElement.stroke = originalColors.stroke;
              }
            } else {
              if (changedElement.property === 'fill') {
                updatedElement.fill = changedElement.previousColor;
              } else {
                updatedElement.stroke = changedElement.previousColor;
              }
            }
          } else {
            if (changedElement.property === 'fill') {
              updatedElement.fill = changedElement.previousColor;
            } else {
              updatedElement.stroke = changedElement.previousColor;
            }
          }
          
          setSelectedElement(updatedElement);
        }
      }
      
      // Handle palette color changes
      if (change.elements.length > 1) {
        // Detect if this was a palette color change
        const samePropertyChanges = change.elements.filter(item => 
          item.property === change.elements[0].property
        );
        
        if (samePropertyChanges.length > 1) {
          const previousColor = samePropertyChanges[0].previousColor;
          const newColor = samePropertyChanges[0].newColor;
          
          // If we're currently showing this palette color, switch to the previous one
          if (selectedPaletteColor && areColorsSimilar(selectedPaletteColor, newColor)) {
            setSelectedPaletteColor(previousColor);
          }
        }
      }
      
      // Update the history index
      setCurrentHistoryIndex(currentHistoryIndex - 1);

      // Check if we're back to original state
      if (currentHistoryIndex - 1 < 0) {
        setIsSvgModified(false);
        console.log('Fully undone to original state');
      } else {
        // Otherwise recheck if any elements still differ from original
        const stillModified = checkForModifications();
        setIsSvgModified(stillModified);
        console.log('Undone one step, SVG modified:', stillModified);
      }

      toast({
        title: "Undo",
        description: change.elements.length > 1 
          ? <div className="flex items-center flex-wrap">
              <span>Undid changes to {change.elements.length} elements</span>
              {change.elements[0].previousColor && (
                <div className="flex items-center ml-1">
                  <span>to </span>
                  <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: change.elements[0].previousColor || 'transparent' }}></div>
                  <code className="bg-secondary text-secondary-foreground px-1 rounded text-xs">{change.elements[0].previousColor}</code>
                </div>
              )}
            </div>
          : <div className="flex items-center flex-wrap">
              <span>Undid {change.elements[0].property} change </span>
              {change.elements[0].previousColor && (
                <div className="flex items-center ml-1">
                  <span>to </span>
                  <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: change.elements[0].previousColor || 'transparent' }}></div>
                  <code className="bg-secondary text-secondary-foreground px-1 rounded text-xs">{change.elements[0].previousColor}</code>
                </div>
              )}
            </div>,
        variant: "default"
      });
    } else {
      toast({
        title: "Nothing to undo",
        description: "No more changes to undo",
        variant: "default"
      });
    }
  }, [colorHistory, currentHistoryIndex, svgElements, selectedElement, selectedPaletteColor, checkForModifications, areColorsSimilar, originalElements]);

  // Fix: Reimplement redo with improved state handling
  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < colorHistory.length - 1) {
      console.log(`Redoing to change ${currentHistoryIndex + 1} of ${colorHistory.length}`);
      const change = colorHistory[currentHistoryIndex + 1];
      
      // Create a copy of the SVG elements to modify
      const updatedElements = [...svgElements];
      
      // Group elements by id for consistent processing
      const elementChangeMap = new Map<string, {
        id: string,
        changes: {
          property: 'fill' | 'stroke',
          newColor: string | null
        }[]
      }>();
      
      // Group changes by element id
      change.elements.forEach(item => {
        if (!elementChangeMap.has(item.id)) {
          elementChangeMap.set(item.id, {
            id: item.id,
            changes: []
          });
        }
        
        const element = elementChangeMap.get(item.id);
        if (element) {
          element.changes.push({
            property: item.property,
            newColor: item.newColor
          });
        }
      });
      
      // Apply grouped changes to each element
      elementChangeMap.forEach((elementChanges, id) => {
        const elementIndex = updatedElements.findIndex(el => el.id === id);
        if (elementIndex !== -1) {
          const element = updatedElements[elementIndex];
          const updatedElement = { ...element };
          
          // Apply each property change to this element
          elementChanges.changes.forEach(changeItem => {
            // Update the DOM element first
            const colorValue = changeItem.newColor || 'none';
            element.element.setAttribute(changeItem.property, colorValue);
            
            // Then update our state object
            if (changeItem.property === 'fill') {
              updatedElement.fill = changeItem.newColor;
            } else {
              updatedElement.stroke = changeItem.newColor;
            }
          });
          
          // Replace the element in our array
          updatedElements[elementIndex] = updatedElement;
        }
      });
      
      // Update state with all changes at once
      setSvgElements(updatedElements);
      
      // Update the selected element if it's part of the change
      if (selectedElement) {
        const changedElement = change.elements.find(item => item.id === selectedElement.id);
        if (changedElement) {
          const updatedElement = { ...selectedElement };
          if (changedElement.property === 'fill') {
            updatedElement.fill = changedElement.newColor;
          } else {
            updatedElement.stroke = changedElement.newColor;
          }
          setSelectedElement(updatedElement);
        }
      }
      
      // If this was a palette color change, update the selected palette color
      if (change.elements.length > 1) {
        // Detect if this was a palette color change
        const samePropertyChanges = change.elements.filter(item => 
          item.property === change.elements[0].property
        );
        
        if (samePropertyChanges.length > 1) {
          const newColor = samePropertyChanges[0].newColor;
          const previousColor = samePropertyChanges[0].previousColor;
          
          // If we're currently showing the previous palette color, switch to the new one
          if (selectedPaletteColor && areColorsSimilar(selectedPaletteColor, previousColor)) {
            setSelectedPaletteColor(newColor);
          }
        }
      }
      
      // Update the history index
      setCurrentHistoryIndex(currentHistoryIndex + 1);

      // Update modified state
      const stillModified = checkForModifications();
      setIsSvgModified(stillModified);
      console.log('Redone one step, SVG modified:', stillModified);

      toast({
        title: "Redo",
        description: change.elements.length > 1 
          ? <div className="flex items-center flex-wrap">
              <span>Redid changes to {change.elements.length} elements</span>
              {change.elements[0].newColor && (
                <div className="flex items-center ml-1">
                  <span>to </span>
                  <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: change.elements[0].newColor || 'transparent' }}></div>
                  <code className="bg-secondary text-secondary-foreground px-1 rounded text-xs">{change.elements[0].newColor}</code>
                </div>
              )}
            </div>
          : <div className="flex items-center flex-wrap">
              <span>Redid {change.elements[0].property} change </span>
              {change.elements[0].newColor && (
                <div className="flex items-center ml-1">
                  <span>to </span>
                  <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: change.elements[0].newColor || 'transparent' }}></div>
                  <code className="bg-secondary text-secondary-foreground px-1 rounded text-xs">{change.elements[0].newColor}</code>
                </div>
              )}
            </div>,
        variant: "default"
      });
    } else {
      toast({
        title: "Nothing to redo",
        description: "No more changes to redo",
        variant: "default"
      });
    }
  }, [colorHistory, currentHistoryIndex, svgElements, selectedElement, selectedPaletteColor, checkForModifications, areColorsSimilar]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if not in an input field
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }

      // Zoom shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoom(1.2);
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoom(0.8);
        } else if (e.key === '0') {
          e.preventDefault();
          handleReset();
        } else if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 'r') {
          e.preventDefault();
          if (isSvgModified) {
            handleResetColors();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleZoom, handleReset, handleUndo, handleRedo, handleResetColors, isSvgModified]);

  // Improve the global event listeners to ensure we catch all drag end events
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isColorPickerDragging) {
        handleColorPickerDragEnd();
      }
    };
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If Escape key is pressed while dragging, cancel the color change
      if (e.key === 'Escape' && isColorPickerDragging) {
        setIsColorPickerDragging(false);
        setPendingColorChange(null);
        
        // Restore original colors
        if (lastStableColorRef.current && selectedElement) {
          if (activeProperty === 'fill') {
            selectedElement.element.setAttribute('fill', lastStableColorRef.current);
            setSelectedElement({
              ...selectedElement,
              fill: lastStableColorRef.current
            });
          } else if (activeProperty === 'stroke') {
            selectedElement.element.setAttribute('stroke', lastStableColorRef.current);
            setSelectedElement({
              ...selectedElement,
              stroke: lastStableColorRef.current
            });
          }
        } else if (lastStableColorRef.current && selectedPaletteColor) {
          // Restore all elements with the palette color
          const updatedElements = svgElements.map(el => {
            const updatedEl = { ...el };
            if (el.fill === selectedPaletteColor) {
              el.element.setAttribute('fill', lastStableColorRef.current!);
              updatedEl.fill = lastStableColorRef.current;
            }
            if (el.stroke === selectedPaletteColor) {
              el.element.setAttribute('stroke', lastStableColorRef.current!);
              updatedEl.stroke = lastStableColorRef.current;
            }
            return updatedEl;
          });
          
          setSvgElements(updatedElements);
          setSelectedPaletteColor(lastStableColorRef.current);
        }
      }
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('blur', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('blur', handleGlobalMouseUp);
    };
  }, [isColorPickerDragging, handleColorPickerDragEnd, selectedElement, selectedPaletteColor, activeProperty, svgElements, lastStableColorRef]);

  // Add a separate function to handle palette color changes
  const handlePaletteColorChange = useCallback((paletteColor: string, newColor: string) => {
    if (!paletteColor || paletteColor === newColor) return;
    
    // Start tracking if not already tracking
    if (!isColorPickerDragging) {
      setIsColorPickerDragging(true);
      lastStableColorRef.current = paletteColor;
    }
    
    // Find all elements with this color and track them for history
    const changedElements: {
      id: string;
      property: 'fill' | 'stroke';
      previousColor: string | null;
      newColor: string | null;
    }[] = [];
    
    // Create a new array with updated elements
    const updatedElements = svgElements.map(el => {
      const updatedEl = { ...el };
      let changed = false;
      
      // Check fill property
      if (el.fill === paletteColor) {
        el.element.setAttribute('fill', newColor);
        updatedEl.fill = newColor;
        changed = true;
        
        // Add to the list of changed elements for history
        changedElements.push({
          id: el.id,
          property: 'fill',
          previousColor: paletteColor,
          newColor: newColor
        });
      }
      
      // Check stroke property
      if (el.stroke === paletteColor) {
        el.element.setAttribute('stroke', newColor);
        updatedEl.stroke = newColor;
        changed = true;
        
        // Add to the list of changed elements for history
        changedElements.push({
          id: el.id,
          property: 'stroke',
          previousColor: paletteColor,
          newColor: newColor
        });
      }
      
      return changed ? updatedEl : el;
    });
    
    // Update the elements state
    setSvgElements(updatedElements);
    
    // Update the selected palette color
    setSelectedPaletteColor(newColor);
    
    // Store changes for history
    setPendingColorChange({
      elements: changedElements,
      timestamp: Date.now()
    });
    
  }, [svgElements, isColorPickerDragging]);

  // Modified handleColorChange to use the new palette function when appropriate
  const handleColorChange = (color: string) => {
    // If we have a palette color selected, use the palette handler
    if (selectedPaletteColor) {
      // Only record the initial color when dragging starts
      if (!isColorPickerDragging) {
        console.log('Starting drag from palette color:', selectedPaletteColor);
        setIsColorPickerDragging(true);
        lastStableColorRef.current = selectedPaletteColor;
      }
      handlePaletteColorChange(selectedPaletteColor, color);
      return;
    }
    
    // Otherwise, handle single element change
    if (!isColorPickerDragging && selectedElement) {
      // Record the current element color before any changes
      const currentColor = activeProperty === 'fill' 
        ? selectedElement.fill 
        : selectedElement.stroke;
      
      console.log('Starting drag from element color:', currentColor);
      setIsColorPickerDragging(true);
      lastStableColorRef.current = currentColor;
    }
    
    // Apply visual changes immediately but don't store in history yet
    if (selectedElement) {
      // Single element color change - update visuals only
      const { element } = selectedElement;
      const updatedElement = { ...selectedElement };

      // Ensure we have a valid previousColor
      const initialColor = lastStableColorRef.current || 
        (activeProperty === 'fill' ? selectedElement.fill : selectedElement.stroke);

      if (activeProperty === 'fill' && selectedElement.fill !== color) {
        element.setAttribute('fill', color);
        updatedElement.fill = color;
        
        // Create or update pending change
        if (!pendingColorChange) {
          setPendingColorChange({
            elements: [{
              id: selectedElement.id,
              property: 'fill',
              previousColor: initialColor, // Use the stored initial color
              newColor: color
            }],
            timestamp: Date.now()
          });
        } else {
          // Check if we already have this change
          const existingChangeIndex = pendingColorChange.elements.findIndex(
            item => item.id === selectedElement.id && item.property === 'fill'
          );
          
          if (existingChangeIndex === -1) {
            // Add new change
            setPendingColorChange(prev => ({
              ...prev!,
              elements: [
                ...prev!.elements,
                {
                  id: selectedElement.id,
                  property: 'fill',
                  previousColor: initialColor, // Use the stored initial color
                  newColor: color
                }
              ]
            }));
          } else {
            // Update existing change with new color without changing the previous color
            setPendingColorChange(prev => {
              const updatedElements = [...prev!.elements];
              updatedElements[existingChangeIndex] = {
                ...updatedElements[existingChangeIndex],
                newColor: color
              };
              return {
                ...prev!,
                elements: updatedElements
              };
            });
          }
        }
      } else if (activeProperty === 'stroke' && selectedElement.stroke !== color) {
        element.setAttribute('stroke', color);
        updatedElement.stroke = color;
        
        // Create or update pending change (same pattern as above)
        if (!pendingColorChange) {
          setPendingColorChange({
            elements: [{
              id: selectedElement.id,
              property: 'stroke',
              previousColor: initialColor, // Use the stored initial color
              newColor: color
            }],
            timestamp: Date.now()
          });
        } else {
          const existingChangeIndex = pendingColorChange.elements.findIndex(
            item => item.id === selectedElement.id && item.property === 'stroke'
          );
          
          if (existingChangeIndex === -1) {
            setPendingColorChange(prev => ({
              ...prev!,
              elements: [
                ...prev!.elements,
                {
                  id: selectedElement.id,
                  property: 'stroke',
                  previousColor: initialColor, // Use the stored initial color
                  newColor: color
                }
              ]
            }));
          } else {
            setPendingColorChange(prev => {
              const updatedElements = [...prev!.elements];
              updatedElements[existingChangeIndex] = {
                ...updatedElements[existingChangeIndex],
                newColor: color
              };
              return {
                ...prev!,
                elements: updatedElements
              };
            });
          }
        }
      }
      
      setSelectedElement(updatedElement);
      setSvgElements(prevElements => 
        prevElements.map(el => 
          el.id === selectedElement.id ? updatedElement : el
        )
      );
    }
  };

  // Modify handleElementSelect to clear palette selection
  const handleElementSelect = useCallback((element: ColorableElement) => {
    // Clear all previous highlights first
    const allHighlighted = svgRef.current?.querySelectorAll('.selected-element');
    allHighlighted?.forEach(el => {
      el.classList.remove('selected-element');
    });

    setSelectedPaletteColor(null); // Clear palette selection
    
    // Highlight only the selected element
    element.element.classList.add('selected-element');
    setSelectedElement(element);

    // Default to fill or stroke based on what's available
    if (element.fill) {
      setActiveProperty('fill');
    } else if (element.stroke) {
      setActiveProperty('stroke');
    }
  }, []);

  // Handle property tab change
  const handlePropertyChange = (value: string) => {
    setActiveProperty(value as 'fill' | 'stroke');
  };

  // Get SVG as string for download
  const getSvgString = useCallback(() => {
    if (!svgRef.current) return '';

    try {
      // Clone the SVG to remove selection styling
      const clonedSvg = svgRef.current.cloneNode(true) as SVGSVGElement;

      // Remove selection styling
      const selectedElements = clonedSvg.querySelectorAll('.selected-element');
      for (const el of selectedElements) {
        el.classList.remove('selected-element');
      }
      
      // Remove any temporary styles
      clonedSvg.removeAttribute('style');
      clonedSvg.style.cssText = '';
      
      // Get the original SVG information from the source
      const originalSvgElement = document.createElement('div');
      originalSvgElement.innerHTML = svgContent;
      const originalSvg = originalSvgElement.querySelector('svg');
      
      if (!originalSvg) {
        console.error('Original SVG could not be parsed');
        return '';
      }
      
      // Retrieve original attributes
      const originalViewBox = originalSvg.getAttribute('viewBox');
      const originalWidth = originalSvg.getAttribute('width');
      const originalHeight = originalSvg.getAttribute('height');
      
      // Important: Preserve ALL attributes from the source SVG
      const preserveAllAttributes = () => {
        if (!originalSvg) return;
        
        // Store all elements by ID from original SVG
        const originalElements = new Map<string, Element>();
        originalSvg.querySelectorAll('*[id]').forEach(el => {
          const id = el.getAttribute('id');
          if (id) {
            originalElements.set(id, el);
          }
        });
        
        // Apply all original attributes to cloned elements
        clonedSvg.querySelectorAll('*[id]').forEach(el => {
          const id = el.getAttribute('id');
          if (id && originalElements.has(id)) {
            const originalEl = originalElements.get(id)!;
            
            // Copy ALL attributes from original element
            Array.from(originalEl.attributes).forEach(attr => {
              // Skip id attribute as it's already set and some attributes that should be controlled by our editing
              if (attr.name !== 'id' && 
                  attr.name !== 'class' && 
                  attr.name !== 'style' && 
                  !(attr.name === 'fill' && el.hasAttribute('fill')) && 
                  !(attr.name === 'stroke' && el.hasAttribute('stroke'))) {
                el.setAttribute(attr.name, attr.value);
              }
            });
          }
        });
        
        // Also preserve attributes on the root SVG element itself
        Array.from(originalSvg.attributes).forEach(attr => {
          // Skip some attributes we'll set explicitly later
          if (attr.name !== 'viewBox' && 
              attr.name !== 'width' && 
              attr.name !== 'height' && 
              attr.name !== 'xmlns' && 
              attr.name !== 'xmlns:xlink' && 
              attr.name !== 'style' && 
              attr.name !== 'class') {
            clonedSvg.setAttribute(attr.name, attr.value);
          }
        });
      };
      
      // Apply all original attributes
      preserveAllAttributes();
      
      // Ensure we have the full bounding box of all content
      const bbox = clonedSvg.getBBox();
      
      // Create a more generous viewBox with extra padding to ensure all content is visible
      const padding = Math.max(bbox.width, bbox.height) * 0.25; // 25% padding
      const fullWidth = bbox.width + (padding * 2);
      const fullHeight = bbox.height + (padding * 2);
      const generatedViewBox = `${bbox.x - padding} ${bbox.y - padding} ${fullWidth} ${fullHeight}`;
      
      // IMPORTANT: Explicitly set viewBox - prioritize original but ensure it's adequate
      if (originalViewBox) {
        // If original viewbox exists, use it
        clonedSvg.setAttribute('viewBox', originalViewBox);
      } else {
        // Otherwise use our calculated viewbox with generous padding
        clonedSvg.setAttribute('viewBox', generatedViewBox);
      }

      // IMPORTANT: Always set explicit width and height for proper rendering
      if (originalWidth && originalHeight) {
        clonedSvg.setAttribute('width', originalWidth);
        clonedSvg.setAttribute('height', originalHeight);
      } else {
        // Set width and height to match the aspect ratio of the bounding box
        clonedSvg.setAttribute('width', String(fullWidth));
        clonedSvg.setAttribute('height', String(fullHeight));
      }
      
      // IMPORTANT: Always set preserveAspectRatio to ensure the entire SVG is visible
      clonedSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // Ensure SVG namespace
      if (!clonedSvg.hasAttribute('xmlns')) {
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      // Add additional namespaces if needed
      if (!clonedSvg.hasAttribute('xmlns:xlink')) {
        clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      }

      return new XMLSerializer().serializeToString(clonedSvg);
    } catch (error) {
      console.error('Error generating SVG string:', error);
      toast({
        title: "Error",
        description: "Failed to generate the SVG for download.",
        variant: "destructive"
      });
      return '';
    }
  }, [svgRef, svgContent, originalSvgData]);

  // Handle SVG download
  const handleDownload = useCallback(() => {
    const svgString = getSvgString();
    if (!svgString) return;

    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited-svg.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "SVG downloaded",
        description: "Your edited SVG has been downloaded",
      });
    } catch (error) {
      console.error('Error downloading SVG:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the SVG file.",
        variant: "destructive"
      });
    }
  }, [getSvgString]);

  // Add download keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if not in an input field
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }

      // Download shortcut (Ctrl+S or Command+S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Only allow download if SVG is modified
        if (isSvgModified && svgContent) {
          handleDownload();
        } 
        // else {
        //   toast({
        //     title: "Download blocked",
        //     description: "No changes have been made to the SVG.",
        //     variant: "default"
        //   });
        // }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDownload, isSvgModified, svgContent]);

  // Add touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) { // Single touch for panning
      const touch = e.touches[0];
      setIsDragging(true);
      setMoveDistance({ x: 0, y: 0 });
      // Store initial touch position and current viewBox
      setDragStart({ x: viewBox.x, y: viewBox.y });
      setLastMousePosition({ x: touch.clientX, y: touch.clientY });
      
      // Prevent default to avoid scrolling the page
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && svgRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      
      // Calculate touch movement in screen pixels
      const dx = touch.clientX - lastMousePosition.x;
      const dy = touch.clientY - lastMousePosition.y;
      
      // Update total move distance for detecting panning vs. tapping
      setMoveDistance(prev => ({
        x: prev.x + Math.abs(dx),
        y: prev.y + Math.abs(dy)
      }));

      // If moved more than a few pixels, consider it panning
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setIsPanning(true);
      }
      
      // Convert screen pixels to SVG coordinate units
      const svgRect = svgRef.current.getBoundingClientRect();
      const svgWidth = svgRect.width;
      const svgHeight = svgRect.height;
      
      // Calculate scaling factor between screen pixels and SVG units
      const scaleX = viewBox.width / svgWidth;
      const scaleY = viewBox.height / svgHeight;
      
      // Calculate the new viewBox coordinates
      // Move in the opposite direction of touch movement
      const newX = dragStart.x - (touch.clientX - lastMousePosition.x) * scaleX;
      const newY = dragStart.y - (touch.clientY - lastMousePosition.y) * scaleY;
      
      // Update the SVG viewBox
      svgRef.current.setAttribute('viewBox', `${newX} ${newY} ${viewBox.width} ${viewBox.height}`);
      setViewBox({ ...viewBox, x: newX, y: newY });
      
      // Update drag reference for next move
      setDragStart({ x: newX, y: newY });
      setLastMousePosition({ x: touch.clientX, y: touch.clientY });
      
      // Prevent default to avoid scrolling the page
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Only allow element selection if we haven't been panning
    if (!isPanning && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      
      // Get the element at the touch position
      const elementAtTouch = document.elementFromPoint(touch.clientX, touch.clientY) as SVGElement;
      const element = svgElements.find(el => el.element === elementAtTouch);
      
      if (element) {
        handleElementSelect(element);
      } else if (elementAtTouch === svgRef.current) {
        // Touched on the SVG background/empty area, clear highlights
        const allHighlighted = svgRef.current?.querySelectorAll('.selected-element');
        allHighlighted?.forEach(el => {
          el.classList.remove('selected-element');
        });
        setSelectedElement(null);
        setSelectedPaletteColor(null);
      }
    }
    
    setIsDragging(false);
    setIsPanning(false);
    setMoveDistance({ x: 0, y: 0 });
  };

  // Update the initialization effect to add padding
  useEffect(() => {
    if (svgRef.current) {
      const svg = svgRef.current;
      const bbox = svg.getBBox();
      // Add some padding around the SVG
      const padding = 20;
      const initialViewBox = {
        x: bbox.x - padding,
        y: bbox.y - padding,
        width: bbox.width + padding * 2,
        height: bbox.height + padding * 2
      };
      svg.setAttribute('viewBox', `${initialViewBox.x} ${initialViewBox.y} ${initialViewBox.width} ${initialViewBox.height}`);
      setViewBox(initialViewBox);
    }
  }, [svgContent]);

  // Update the click event listeners to SVG elements
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const listeners = svgElements.map((item) => {
      const { element } = item;

      const handleClick = (e: Event) => {
        // Only handle click if we're not panning
        if (!isPanning) {
        e.stopPropagation();
        handleElementSelect(item);
        }
      };

      element.addEventListener('click', handleClick);

      return { element, handler: handleClick };
    });

    return () => {
      for (const { element, handler } of listeners) {
        element.removeEventListener('click', handler);
      }
    };
  }, [svgElements, handleElementSelect, isPanning]);

  // Add function to clear all selections
  const clearSelection = () => {
    const allHighlighted = svgRef.current?.querySelectorAll('.selected-element');
    allHighlighted?.forEach(el => {
      el.classList.remove('selected-element');
    });
    setSelectedElement(null);
    setSelectedPaletteColor(null);
  };

  // Add a function just for highlighting without selection
  const highlightElement = useCallback((element: ColorableElement) => {
    // Clear all previous highlights
    const allHighlighted = svgRef.current?.querySelectorAll('.selected-element');
    allHighlighted?.forEach(el => {
      el.classList.remove('selected-element');
    });
    
    // Highlight only the element
    element.element.classList.add('selected-element');
  }, []);

  // Add outside click handler
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const colorEditorCard = document.querySelector('.color-editor-card');
      // Check for any color picker related elements (including portal elements)
      const isColorPickerClick = (e.target as Element)?.closest('.color-picker-popover, [data-radix-color-picker], [class*="react-colorful"]');
      
      // Only clear if click is outside SVG container, color editor, and color picker
      if (svgContainerRef.current && 
          !svgContainerRef.current.contains(e.target as Node) && 
          !colorEditorCard?.contains(e.target as Node) &&
          !isColorPickerClick) {
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Add function to calculate outline size based on SVG dimensions
  const calculateOutlineSize = useCallback(() => {
    if (!svgRef.current) return { outline: '2px', offset: '1px' };
    
    const bbox = svgRef.current.getBBox();
    const svgWidth = svgRef.current.clientWidth || svgRef.current.getBoundingClientRect().width;
    
    // Get the viewBox dimensions
    const viewBoxWidth = viewBox.width || bbox.width;
    
    // Calculate the scale factor between SVG units and display units
    const scaleFactor = viewBoxWidth / svgWidth;
    
    // Base size in pixels (what we want to see on screen)
    const baseSize = 2;
    
    // Convert the base size to SVG units
    const outlineSize = baseSize * scaleFactor;
    const offsetSize = outlineSize / 2;
    
    return {
      outline: `${outlineSize}px`,
      offset: `${offsetSize}px`
    };
  }, [viewBox]);

  // Update outline size when SVG content changes or zoom changes
  useEffect(() => {
    if (!svgRef.current) return;
    const { outline, offset } = calculateOutlineSize();
    const style = document.createElement('style');
    style.textContent = `
      .selected-element {
        outline: ${outline} solid #0284c7;
        outline-offset: ${offset};
        z-index: 1000;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [svgContent, zoom, calculateOutlineSize]);

  // Handle mouse wheel events for zooming
  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom if Command (Mac) or Control (Windows/Linux) key is pressed
    if (!(e.metaKey || e.ctrlKey)) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!svgRef.current) return;
    
    // Determine zoom direction and amount
    const delta = e.deltaY;
    // Reduce zoom factor (0.95/1.05 instead of 0.9/1.1) for more gradual zooming
    const zoomFactor = delta > 0 ? 0.95 : 1.05; // Zoom out if positive delta, zoom in if negative
    
    // Get mouse position relative to SVG
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;
    
    // Convert mouse position to SVG coordinates
    const svgMouseX = viewBox.x + (mouseX / svgRect.width) * viewBox.width;
    const svgMouseY = viewBox.y + (mouseY / svgRect.height) * viewBox.height;
    
    // Calculate new viewBox dimensions
    const newWidth = viewBox.width / zoomFactor;
    const newHeight = viewBox.height / zoomFactor;
    
    // Calculate new position to zoom centered on mouse
    const newX = svgMouseX - (mouseX / svgRect.width) * newWidth;
    const newY = svgMouseY - (mouseY / svgRect.height) * newHeight;
    
    // Update SVG viewBox
    svgRef.current.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
    setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
    
    // Update zoom state
    setZoom(zoom * zoomFactor);
  };

  // Add effect to handle wheel events at the document level
  useEffect(() => {
    const svgContainer = svgContainerRef.current;
    if (!svgContainer) return;
    
    // This prevents the mouse wheel from zooming the page
    const preventZoom = (e: WheelEvent) => {
      // Only prevent if the wheel event is inside the SVG container AND Command/Control is pressed
      if (svgContainer.contains(e.target as Node) && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
      }
    };
    
    // Add the event listener with passive: false to allow preventDefault
    // This is critical for preventing browser zoom behavior
    document.addEventListener('wheel', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', preventZoom);
    };
  }, []);

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setMoveDistance({ x: 0, y: 0 });
      // Store initial mouse position and current viewBox
      setDragStart({ x: viewBox.x, y: viewBox.y });
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && svgRef.current) {
      // Calculate mouse movement in screen pixels
      const dx = e.clientX - lastMousePosition.x;
      const dy = e.clientY - lastMousePosition.y;
      
      // Update total move distance for detecting panning vs. clicking
      setMoveDistance(prev => ({
        x: prev.x + Math.abs(dx),
        y: prev.y + Math.abs(dy)
      }));

      // If moved more than a few pixels, consider it panning
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setIsPanning(true);
      }
      
      // Convert screen pixels to SVG coordinate units
      const svgRect = svgRef.current.getBoundingClientRect();
      const svgWidth = svgRect.width;
      const svgHeight = svgRect.height;
      
      // Calculate scaling factor between screen pixels and SVG units
      const scaleX = viewBox.width / svgWidth;
      const scaleY = viewBox.height / svgHeight;
      
      // Calculate the new viewBox coordinates
      // Move in the opposite direction of mouse movement
      const newX = dragStart.x - (e.clientX - lastMousePosition.x) * scaleX;
      const newY = dragStart.y - (e.clientY - lastMousePosition.y) * scaleY;
      
      // Update the SVG viewBox
      svgRef.current.setAttribute('viewBox', `${newX} ${newY} ${viewBox.width} ${viewBox.height}`);
      setViewBox({ ...viewBox, x: newX, y: newY });
      
      // Update drag reference for next move
      setDragStart({ x: newX, y: newY });
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Only allow element selection if we haven't been panning
    if (!isPanning && e.button === 0) {
      // Handle element selection
      const target = e.target as SVGElement;
      const element = svgElements.find(el => el.element === target);
      
      if (element) {
        handleElementSelect(element);
      } else if (target === svgRef.current) {
        // Clicked on the SVG background/empty area, clear highlights
        const allHighlighted = svgRef.current?.querySelectorAll('.selected-element');
        allHighlighted?.forEach(el => {
          el.classList.remove('selected-element');
        });
        setSelectedElement(null);
        setSelectedPaletteColor(null);
      }
    }
    
    setIsDragging(false);
    setIsPanning(false);
    setMoveDistance({ x: 0, y: 0 });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* SVG Preview */}
      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center">
              <h3 className="text-lg font-medium whitespace-nowrap flex-shrink-0">SVG Preview</h3>
              {/* Undo/Redo controls - inline with title on mobile */}
              <div className="flex items-center gap-2 ml-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUndo}
                  disabled={currentHistoryIndex < 0}
                  title={`${modifierKey} Z`}
                  className="h-8 w-8 relative group"
                >
                  <span>↩</span>
                  {/* <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <kbd className="bg-primary text-primary-foreground text-[8px] px-1 rounded flex items-center">
                      <span className="mr-0.5">{modifierKey}</span>Z
                    </kbd>
                  </div> */}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRedo}
                  disabled={currentHistoryIndex >= colorHistory.length - 1}
                  title={`${modifierKey} Y`}
                  className="h-8 w-8 relative group"
                >
                  <span>↪</span>
                  {/* <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <kbd className="bg-primary text-primary-foreground text-[8px] px-1 rounded flex items-center">
                      <span className="mr-0.5">{modifierKey}</span>Y
                    </kbd>
                  </div> */}
                </Button>
              </div>
            </div>
            
            {/* Reset Colors and Download - on second line for small screens */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleResetColors} 
                variant="outline"
                size="sm"
                title={`Reset all colors to original (${modifierKey}+R)`}
                disabled={!isSvgModified}
                className="group relative"
              >
                <RefreshCcw className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Reset</span>
              </Button>
              <Button 
                onClick={handleDownload} 
                variant="outline"
                title={`Download SVG (${modifierKey}+S)`}
                disabled={!svgRef.current || (!isSvgModified && !!svgContent)}
              >
                <Download className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Download</span>
              </Button>
            </div>
          </div>
          <div
            id="svg-container"
            ref={svgContainerRef}
            className="border rounded-lg p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900 cursor-move"
            style={{ 
              touchAction: 'none',
              height: svgElements.length > 0 ? 'calc(100vh - 230px)' : '300px',
              minHeight: '300px',
              maxHeight: '600px'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          />

          <style jsx global>{`
            #svg-container svg {
              width: 100%;
              height: 100%;
              min-height: 200px;
              user-select: none;
            }
            
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: rgba(0, 0, 0, 0.4);
            }
            
            .dark .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(255, 255, 255, 0.2);
            }
            
            .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: rgba(255, 255, 255, 0.4);
            }
          `}</style>
           <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2 justify-center mt-5">
                {/* <div className="flex items-center gap-1"> */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleZoom(1.2)}
                    // title={`${modifierKey} +`}
                    className="h-8 w-8"
                  >
                    +
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleZoom(0.8)}
                    // title={`${modifierKey} -`}
                    className="h-8 w-8"
                  >
                    -
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    // title={`${modifierKey} 0`}
                  >
                    Reset View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!selectedElement}
                    onClick={clearSelection}
                  >
                    Clear selection
                  </Button>
                {/* </div> */}

                {/* <div className="flex items-center gap-1"> */}
                 
                  
                {/* </div> */}
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Color Editor */}
      <Card className="color-editor-card h-fit">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Color Editor</h3>

          {svgElements.length > 0 ? (
            <>
              <div className="mb-4">
                <Label htmlFor="element-select">Select Element</Label>
                <div className="min-h-[37px]">
                <Select
                  onValueChange={(value) => {
                      setSelectedPaletteColor(null); // Clear palette selection
                    const element = svgElements.find(el => el.id === value);
                    if (element) {
                      handleElementSelect(element);
                    }
                  }}
                  value={selectedElement?.id || ''}
                >
                    <SelectTrigger className="h-[37px]">
                    <SelectValue placeholder="Select an element" />
                  </SelectTrigger>
                  <SelectContent>
                    {svgElements.map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.id}
                          onMouseEnter={() => {
                            highlightElement(item);
                          }}
                      >
                        {item.element.tagName}
                        {item.id.startsWith('svg-element-') ? ` #${Number.parseInt(item.id.split('-')[2]) + 1}` : ` (${item.id})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
              </div>

              {selectedElement && (
                <>
                  <Tabs defaultValue="fill" onValueChange={handlePropertyChange} value={activeProperty}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="fill" disabled={!selectedElement.fill}>Fill</TabsTrigger>
                      <TabsTrigger value="stroke" disabled={!selectedElement.stroke}>Stroke</TabsTrigger>
                    </TabsList>
                    <TabsContent value="fill">
                      <div className="py-2">
                        <Label className="mb-1 block">Current Fill Color</Label>
                        <div
                          className="h-8 w-full rounded border relative cursor-pointer group"
                          style={{ backgroundColor: selectedElement.fill || 'transparent' }}
                          onClick={() => {
                            navigator.clipboard.writeText(selectedElement.fill || 'transparent');
                            toast({
                              title: "Copied to clipboard",
                              description: <div className="flex items-center">
                                <span>Fill color: </span>
                                <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: selectedElement.fill || 'transparent' }}></div>
                                <code className="bg-secondary text-secondary-foreground px-1 rounded">{selectedElement.fill || 'transparent'}</code>
                              </div>,
                              variant: "default"
                            });
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
                            <span className="text-xs filter invert brightness-50">Click to copy</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="stroke">
                      <div className="py-2">
                        <Label className="mb-1 block">Current Stroke Color</Label>
                        <div
                          className="h-8 w-full rounded border relative cursor-pointer group"
                          style={{ backgroundColor: selectedElement.stroke || 'transparent' }}
                          onClick={() => {
                            navigator.clipboard.writeText(selectedElement.stroke || 'transparent');
                            toast({
                              title: "Copied to clipboard",
                              description: <div className="flex items-center">
                                <span>Stroke color: </span>
                                <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: selectedElement.stroke || 'transparent' }}></div>
                                <code className="bg-secondary text-secondary-foreground px-1 rounded">{selectedElement.stroke || 'transparent'}</code>
                              </div>,
                              variant: "default"
                            });
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
                            <span className="text-xs filter invert brightness-50">Click to copy</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator className="my-3" />
                </>
              )}

                  {/* Color Picker */}
              {(selectedElement || selectedPaletteColor) && (
                <>
                  <div 
                    className="mb-3 color-picker-popover" 
                    data-radix-color-picker-container
                  >
                    <ColorPicker
                      color={getCurrentColor() || '#000000'}
                      onChange={handleColorChange}
                    />
                    {selectedPaletteColor && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Changing color for all elements using {selectedPaletteColor}
                      </p>
                    )}
                  </div>
                  <Separator className="my-3" />
                </>
              )}

                  {/* Dynamic Color Palette */}
                  {svgColors.length > 0 && (
                    <div>
                      <Label className="mb-1 block">SVG Colors</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Click a color to change all elements using this color:
                      </p>
                      <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar p-2">
                        {svgColors.map((color) => (
                          <button
                            key={color}
                            className={`h-8 w-full rounded border hover:ring-2 hover:ring-offset-1 hover:ring-primary transition-all relative group ${
                              selectedPaletteColor === color ? 'ring-2 ring-primary ring-offset-1' : 
                              (selectedElement && getActiveElementColor() === color) ? 'ring-2 ring-primary ring-offset-1' : ''
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              // Clear any highlighted elements
                              const allHighlighted = svgRef.current?.querySelectorAll('.selected-element');
                              allHighlighted?.forEach(el => {
                                el.classList.remove('selected-element');
                              });
                              
                              setSelectedElement(null);
                              setSelectedPaletteColor(color);
                            }}
                            aria-label={`Select elements using ${color}`}
                          >
                            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 text-white text-[9px] font-mono rounded">
                              {color}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              {svgContent ? "No colorable elements found in SVG" : "Upload an SVG to start editing"}
            </p>
          )}
          
          {/* Keyboard shortcuts help */}
          <div className="mt-4 p-3 bg-muted rounded-md text-xs">
            <h4 className="font-medium mb-2">Keyboard & Touch Shortcuts</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li className='hidden lg:flex items-center gap-1'><kbd className=" px-1.5 py-0.5 bg-background rounded border">{modifierKey} +</kbd> Zoom in</li> {" "}
              <li className='hidden lg:flex items-center gap-1'><kbd className=" px-1.5 py-0.5 bg-background rounded border">{modifierKey} -</kbd> Zoom out</li>
              <li className='hidden lg:flex items-center gap-1'><kbd className=" px-1.5 py-0.5 bg-background rounded border">{modifierKey} 0</kbd> Reset view</li>
              <li className='hidden lg:flex items-center gap-1'><kbd className=" px-1.5 py-0.5 bg-background rounded border">{modifierKey} Z</kbd> Undo</li>
              <li className='hidden lg:flex items-center gap-1'><kbd className=" px-1.5 py-0.5 bg-background rounded border">{modifierKey} Y</kbd> Redo</li>
              <li className='hidden lg:flex items-center gap-1'><kbd className=" px-1.5 py-0.5 bg-background rounded border">{modifierKey} S</kbd> Download SVG</li>
              <li className='hidden lg:flex items-center gap-1'><kbd className=" px-1.5 py-0.5 bg-background rounded border">{modifierKey} R</kbd> Reset colors</li>
              <li className='hidden lg:flex items-center gap-1'><kbd className="px-1.5 py-0.5 bg-background rounded border">{modifierKey} + Mouse wheel</kbd> Zoom in/out</li>
              <li className="pt-1">
                <span className="text-muted-foreground/80">Touch Gestures:</span>
              </li>
              <li>Drag with one finger to pan</li>
              <li>Tap to select an element</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
