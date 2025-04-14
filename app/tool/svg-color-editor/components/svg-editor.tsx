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
function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): (...args: Args) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

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
  }, [viewBox.width]);

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
  const [moveDistance, setMoveDistance] = useState({ x: 0, y: 0 });

  // Add debounced toast function that supports React elements
  const debouncedToast = useCallback(
    debounce((title: string, description: string | React.ReactNode) => {
      toast({
        title,
        description,
      });
    }, 500),
    []
  );

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
  const highlightElementsByColor = (color: string | null) => {
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
  };

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

  // Fix: Reimplement undo/redo functions with improved state handling
  const handleUndo = useCallback(() => {
    if (currentHistoryIndex >= 0 && colorHistory.length > 0) {
      console.log(`Undoing change ${currentHistoryIndex} of ${colorHistory.length}`);
      const change = colorHistory[currentHistoryIndex];
      
      // Create a copy of the SVG elements to modify
      const updatedElements = [...svgElements];
      
      // Group elements by id to avoid applying multiple changes to the same element in the wrong order
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
      
      // Now apply grouped changes to each element
      elementChangeMap.forEach((elementChanges, id) => {
        const elementIndex = updatedElements.findIndex(el => el.id === id);
        if (elementIndex !== -1) {
          const element = updatedElements[elementIndex];
          const updatedElement = { ...element };
          
          // Apply each property change to this element
          elementChanges.changes.forEach(changeItem => {
            // Update the DOM element
            element.element.setAttribute(changeItem.property, changeItem.previousColor || 'none');
            
            // Update our state object
            if (changeItem.property === 'fill') {
              updatedElement.fill = changeItem.previousColor;
            } else {
              updatedElement.stroke = changeItem.previousColor;
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
            updatedElement.fill = changedElement.previousColor;
          } else {
            updatedElement.stroke = changedElement.previousColor;
          }
          setSelectedElement(updatedElement);
        }
      }
      
      // If this was a palette color change, update the selected palette color
      if (change.elements.length > 1) {
        // Detect if this was a palette color change
        // We'll check if multiple elements were changed to the same color
        const samePropertyChanges = change.elements.filter(item => {
          // Group by property (fill or stroke)
          return item.property === change.elements[0].property;
        });
        
        if (samePropertyChanges.length > 1) {
          // Check if all previous colors are the same
          const allPreviousColors = new Set(samePropertyChanges.map(item => item.previousColor));
          const allNewColors = new Set(samePropertyChanges.map(item => item.newColor));
          
          // If exactly one previous color and one new color for multiple elements,
          // this was likely a palette color change
          if (allPreviousColors.size === 1 && allNewColors.size === 1) {
            const previousColor = samePropertyChanges[0].previousColor;
            // If we're currently showing this palette color (the "new" color),
            // switch to the previous color
            if (selectedPaletteColor === samePropertyChanges[0].newColor) {
              setSelectedPaletteColor(previousColor);
            }
          }
        }
      }
      
      // Update the history index
      setCurrentHistoryIndex(currentHistoryIndex - 1);

      // Get the color we're undoing to for notification
      const primaryPreviousColor = change.elements[0].previousColor;
      
      toast({
        title: "Undo",
        description: change.elements.length > 1 
          ? <div className="flex items-center flex-wrap">
              <span>Undid changes to {change.elements.length} elements</span>
              {primaryPreviousColor && (
                <div className="flex items-center ml-1">
                  <span>to </span>
                  <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: primaryPreviousColor || 'transparent' }}></div>
                  <code className="bg-secondary text-secondary-foreground px-1 rounded text-xs">{primaryPreviousColor}</code>
                </div>
              )}
            </div>
          : <div className="flex items-center flex-wrap">
              <span>Undid {change.elements[0].property} change </span>
              {primaryPreviousColor && (
                <div className="flex items-center ml-1">
                  <span>to </span>
                  <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: primaryPreviousColor || 'transparent' }}></div>
                  <code className="bg-secondary text-secondary-foreground px-1 rounded text-xs">{primaryPreviousColor}</code>
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
  }, [colorHistory, currentHistoryIndex, svgElements, selectedElement, selectedPaletteColor]);

  // Fix: Reimplement redo with improved state handling
  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < colorHistory.length - 1) {
      console.log(`Redoing to change ${currentHistoryIndex + 1} of ${colorHistory.length}`);
      const change = colorHistory[currentHistoryIndex + 1];
      
      // Create a copy of the SVG elements to modify
      const updatedElements = [...svgElements];
      
      // Group elements by id to avoid applying multiple changes to the same element in the wrong order
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
      
      // Now apply grouped changes to each element
      elementChangeMap.forEach((elementChanges, id) => {
        const elementIndex = updatedElements.findIndex(el => el.id === id);
        if (elementIndex !== -1) {
          const element = updatedElements[elementIndex];
          const updatedElement = { ...element };
          
          // Apply each property change to this element
          elementChanges.changes.forEach(changeItem => {
            // Update the DOM element
            element.element.setAttribute(changeItem.property, changeItem.newColor || 'none');
            
            // Update our state object
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
        // We'll check if multiple elements were changed to the same color
        const samePropertyChanges = change.elements.filter(item => {
          // Group by property (fill or stroke)
          return item.property === change.elements[0].property;
        });
        
        if (samePropertyChanges.length > 1) {
          // Check if all new colors are the same
          const allNewColors = new Set(samePropertyChanges.map(item => item.newColor));
          const allPreviousColors = new Set(samePropertyChanges.map(item => item.previousColor));
          
          // If exactly one previous color and one new color for multiple elements,
          // this was likely a palette color change
          if (allPreviousColors.size === 1 && allNewColors.size === 1) {
            const newColor = samePropertyChanges[0].newColor;
            // If we're currently showing the previous palette color,
            // switch to the new color
            if (selectedPaletteColor === samePropertyChanges[0].previousColor) {
              setSelectedPaletteColor(newColor);
            }
          }
        }
      }
      
      // Update the history index
      setCurrentHistoryIndex(currentHistoryIndex + 1);

      // Get the color we're redoing to for notification
      const primaryNewColor = change.elements[0].newColor;
      
      toast({
        title: "Redo",
        description: change.elements.length > 1 
          ? <div className="flex items-center flex-wrap">
              <span>Redid changes to {change.elements.length} elements</span>
              {primaryNewColor && (
                <div className="flex items-center ml-1">
                  <span>to </span>
                  <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: primaryNewColor || 'transparent' }}></div>
                  <code className="bg-secondary text-secondary-foreground px-1 rounded text-xs">{primaryNewColor}</code>
                </div>
              )}
            </div>
          : <div className="flex items-center flex-wrap">
              <span>Redid {change.elements[0].property} change </span>
              {primaryNewColor && (
                <div className="flex items-center ml-1">
                  <span>to </span>
                  <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: primaryNewColor || 'transparent' }}></div>
                  <code className="bg-secondary text-secondary-foreground px-1 rounded text-xs">{primaryNewColor}</code>
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
  }, [colorHistory, currentHistoryIndex, svgElements, selectedElement, selectedPaletteColor]);

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
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleZoom, handleReset, handleUndo, handleRedo]);

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
      handlePaletteColorChange(selectedPaletteColor, color);
      return;
    }
    
    // Otherwise, handle single element change as before
    if (!isColorPickerDragging) {
      setIsColorPickerDragging(true);
      lastStableColorRef.current = getCurrentColor();
    }
    
    // Apply visual changes immediately but don't store in history yet
    if (selectedElement) {
      // Single element color change - update visuals only
      const { element } = selectedElement;
      const updatedElement = { ...selectedElement };

      if (activeProperty === 'fill' && selectedElement.fill !== color) {
        element.setAttribute('fill', color);
        updatedElement.fill = color;
        
        // Create or update pending change
        if (!pendingColorChange) {
          setPendingColorChange({
            elements: [{
              id: selectedElement.id,
              property: 'fill',
              previousColor: selectedElement.fill,
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
                  previousColor: selectedElement.fill,
                  newColor: color
                }
              ]
            }));
          } else {
            // Update existing change with new color
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
              previousColor: selectedElement.stroke,
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
                  previousColor: selectedElement.stroke,
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

  // Modified handleColorPickerDragEnd to also update the modified state
  const handleColorPickerDragEnd = useCallback(() => {
    if (isColorPickerDragging && pendingColorChange && pendingColorChange.elements.length > 0) {
      // Only add to history if the final color is different from the starting color
      const finalColor = getCurrentColor();
      // Normalize color format to prevent duplicates (e.g., "#123456" vs "#123456")
      const normalizedFinalColor = finalColor ? finalColor.toLowerCase().replace(/#+/g, '#') : null;
      const normalizedLastColor = lastStableColorRef.current ? lastStableColorRef.current.toLowerCase().replace(/#+/g, '#') : null;
      
      if (normalizedFinalColor !== normalizedLastColor) {
        console.log('Adding color change to history', {
          current: currentHistoryIndex,
          total: colorHistory.length,
          elementsChanged: pendingColorChange.elements.length
        });
        
        // Before adding to history, normalize all color values in the pending change
        const normalizedPendingChange = {
          ...pendingColorChange,
          elements: pendingColorChange.elements.map(el => ({
            ...el,
            previousColor: el.previousColor ? el.previousColor.toLowerCase().replace(/#+/g, '#') : null,
            newColor: el.newColor ? el.newColor.toLowerCase().replace(/#+/g, '#') : null
          }))
        };
        
        // Truncate forward history if we're not at the end
        const newHistory = colorHistory.slice(0, currentHistoryIndex + 1);
        const updatedHistory = [...newHistory, normalizedPendingChange];
        setColorHistory(updatedHistory);
        setCurrentHistoryIndex(updatedHistory.length - 1);
        
        // Mark SVG as modified
        setIsSvgModified(true);
        
        // Show notification about the change
        debouncedToast(
          "Color updated",
          pendingColorChange.elements.length > 1 
            ? <div className="flex items-center">
                <span>Updated {pendingColorChange.elements.length} elements to </span>
                <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: finalColor || 'transparent' }}></div>
                <code className="bg-secondary text-secondary-foreground px-1 rounded">{finalColor || 'transparent'}</code>
              </div>
            : <div className="flex items-center">
                <span>Updated {pendingColorChange.elements[0].property} to </span>
                <div className="h-4 w-4 mx-1 inline-block border" style={{ backgroundColor: finalColor || 'transparent' }}></div>
                <code className="bg-secondary text-secondary-foreground px-1 rounded">{finalColor || 'transparent'}</code>
              </div>
        );
      }
    }
    
    // Reset dragging state
    setIsColorPickerDragging(false);
    setPendingColorChange(null);
  }, [isColorPickerDragging, pendingColorChange, colorHistory, currentHistoryIndex, getCurrentColor, lastStableColorRef, debouncedToast]);

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
  const getSvgString = () => {
    if (!svgRef.current) return '';

    try {
      // Clone the SVG to remove selection styling
      const clonedSvg = svgRef.current.cloneNode(true) as SVGSVGElement;

      // Remove selection styling
      const selectedElements = clonedSvg.querySelectorAll('.selected-element');
      for (const el of selectedElements) {
        el.classList.remove('selected-element');
      }

      // Get the actual bounding box of all content
      const bbox = clonedSvg.getBBox();
      
      // Calculate dimensions with appropriate padding to prevent cropping
      const padding = Math.max(bbox.width, bbox.height) * 0.15; // Increased padding to 15%
      const fullWidth = bbox.width + (padding * 2);
      const fullHeight = bbox.height + (padding * 2);
      const viewBoxValue = `${bbox.x - padding} ${bbox.y - padding} ${fullWidth} ${fullHeight}`;

      // Remove any transform attributes that might affect positioning
      clonedSvg.removeAttribute('transform');
      const allElements = clonedSvg.querySelectorAll('*');
      allElements.forEach(el => {
        if (el instanceof SVGElement) {
          el.style.transform = '';
          el.removeAttribute('transform');
        }
      });

      // Remove any temporary attributes and styles
      clonedSvg.removeAttribute('style');
      clonedSvg.style.cssText = '';

      // Get the original viewBox from the SVG file (if it exists)
      const originalSvgElement = document.createElement('div');
      originalSvgElement.innerHTML = svgContent;
      const originalSvg = originalSvgElement.querySelector('svg');
      const originalViewBox = originalSvg?.getAttribute('viewBox');
      const originalWidth = originalSvg?.getAttribute('width');
      const originalHeight = originalSvg?.getAttribute('height');

      // Prioritize original viewBox from the source SVG
      if (originalViewBox) {
        clonedSvg.setAttribute('viewBox', originalViewBox);
      } else if (originalSvgData.viewBox) {
        clonedSvg.setAttribute('viewBox', originalSvgData.viewBox);
      } else {
        clonedSvg.setAttribute('viewBox', viewBoxValue);
      }

      // Set width and height to maintain aspect ratio
      if (originalWidth && originalHeight) {
        clonedSvg.setAttribute('width', originalWidth);
        clonedSvg.setAttribute('height', originalHeight);
      } else if (originalSvgData.width && originalSvgData.height) {
        clonedSvg.setAttribute('width', originalSvgData.width);
        clonedSvg.setAttribute('height', originalSvgData.height);
      } else {
        // If no original dimensions, use the content dimensions with extra padding to prevent cropping
        clonedSvg.setAttribute('width', String(fullWidth));
        clonedSvg.setAttribute('height', String(fullHeight));
        // Also set preserveAspectRatio to ensure proper scaling
        clonedSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      }

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
  };

  // Handle SVG download
  const handleDownload = () => {
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
  };

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
    // Clear all previous highlights first
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
                  <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <kbd className="bg-primary text-primary-foreground text-[8px] px-1 rounded flex items-center">
                      <span className="mr-0.5">{modifierKey}</span>Z
                    </kbd>
                  </div>
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
                  <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <kbd className="bg-primary text-primary-foreground text-[8px] px-1 rounded flex items-center">
                      <span className="mr-0.5">{modifierKey}</span>Y
                    </kbd>
                  </div>
                </Button>
              </div>
            </div>
            
            {/* Reset Colors and Download - on second line for small screens */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleResetColors} 
                variant="outline"
                size="sm"
                title="Reset all colors to original"
                disabled={!isSvgModified}
              >
                Reset Colors
              </Button>
              <Button 
                onClick={handleDownload} 
                variant="outline"
                disabled={!svgRef.current || (!isSvgModified && !!svgContent)}
              >
                Download
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
            onWheel={handleWheel}
          />

          <style jsx global>{`
            #svg-container svg {
              width: 100%;
              height: 100%;
              min-height: 200px;
              user-select: none;
            }
          `}</style>
           <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2 justify-center mt-5">
                {/* <div className="flex items-center gap-1"> */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleZoom(1.2)}
                    title={`${modifierKey} +`}
                    className="h-8 w-8"
                  >
                    +
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleZoom(0.8)}
                    title={`${modifierKey} -`}
                    className="h-8 w-8"
                  >
                    -
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    title={`${modifierKey} 0`}
                  >
                    Reset View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                  >
                    Clear
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
                      <div className="grid grid-cols-5 gap-2">
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
