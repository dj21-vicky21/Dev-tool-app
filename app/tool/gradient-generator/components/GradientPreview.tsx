"use client";

import { Card } from "@/components/ui/card";
import { GradientPreviewProps } from "./types";
import { buildGradientStyle } from "./utils";
import { Maximize2, Minimize2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GradientPreview({
  colorStops,
  gradientType,
  rotation,
}: GradientPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const gradientStyle = buildGradientStyle(colorStops, gradientType, rotation);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Direct mapping for SVG/Canvas coordinates
  const getGradientCoordinates = (angle: number, width = 800, height = 600) => {
    // Normalize angle to 0-360
    const deg = ((angle % 360) + 360) % 360;
    const centerX = width / 2;
    const centerY = height / 2;
    switch (deg) {
      case 0: return { x1: centerX, y1: height, x2: centerX, y2: 0 };
      case 90: return { x1: 0, y1: centerY, x2: width, y2: centerY };
      case 180: return { x1: centerX, y1: 0, x2: centerX, y2: height };
      case 270: return { x1: width, y1: centerY, x2: 0, y2: centerY };
      case 45: return { x1: 0, y1: height, x2: width, y2: 0 };
      case 135: return { x1: 0, y1: 0, x2: width, y2: height };
      case 225: return { x1: width, y1: 0, x2: 0, y2: height };
      case 315: return { x1: width, y1: height, x2: 0, y2: 0 };
      default:
        const radians = (deg - 90) * (Math.PI / 180);
        const distance = Math.sqrt(width * width + height * height);
        const dx = Math.cos(radians) * distance;
        const dy = Math.sin(radians) * distance;
        return {
          x1: centerX - dx / 2,
          y1: centerY - dy / 2,
          x2: centerX + dx / 2,
          y2: centerY + dy / 2
        };
    }
  };
  
  const exportAsSVG = () => {
    if (!previewRef.current) return;
    
    // Get actual preview size
    const rect = previewRef.current.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    
    // Ensure the color stops are sorted by position (same as CSS)
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    
    // Create SVG with the gradient
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    // svg.setAttribute("preserveAspectRatio", "none");
    
    // Create defs for gradient
    const defs = document.createElementNS(svgNS, "defs");
    const gradientId = "exportedGradient";
    
    // Create gradient element
    const gradientElement = document.createElementNS(
      svgNS, 
      gradientType === "linear" ? "linearGradient" : "radialGradient"
    );
    gradientElement.setAttribute("id", gradientId);
    
    if (gradientType === "linear") {
      // Get coordinates based on the CSS angle, using actual preview dimensions
      const coords = getGradientCoordinates(rotation, width, height);
      gradientElement.setAttribute("gradientUnits", "userSpaceOnUse");
      gradientElement.setAttribute("x1", `${coords.x1}`);
      gradientElement.setAttribute("y1", `${coords.y1}`);
      gradientElement.setAttribute("x2", `${coords.x2}`);
      gradientElement.setAttribute("y2", `${coords.y2}`);
    } else {
      gradientElement.setAttribute("cx", "50%");
      gradientElement.setAttribute("cy", "50%");
      gradientElement.setAttribute("r", "50%");
    }
    
    // Add stops in the same order as CSS
    sortedStops.forEach(stop => {
      const stopElement = document.createElementNS(svgNS, "stop");
      stopElement.setAttribute("offset", `${stop.position / 100}`); // SVG uses 0-1 range
      stopElement.setAttribute("stop-color", stop.color);
      gradientElement.appendChild(stopElement);
    });
    
    defs.appendChild(gradientElement);
    svg.appendChild(defs);
    
    // Create rectangle with the gradient
    const svgRect = document.createElementNS(svgNS, "rect");
    svgRect.setAttribute("width", String(width));
    svgRect.setAttribute("height", String(height));
    svgRect.setAttribute("fill", `url(#${gradientId})`);
    svg.appendChild(svgRect);
    
    // Convert to SVG string
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `gradient-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  };
  
  const exportAsPNG = () => {
    if (!previewRef.current) return;
    
    // Get actual preview size
    const rect = previewRef.current.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    
    // Ensure the color stops are sorted by position (same as CSS)
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    
    // Create a canvas with the gradient
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    if (gradientType === "linear") {
      // Get coordinates based on the CSS angle, using actual preview dimensions
      const coords = getGradientCoordinates(rotation, width, height);
      
      const gradient = ctx.createLinearGradient(
        coords.x1, coords.y1, coords.x2, coords.y2
      );
      
      // Add color stops in the same order as CSS
      sortedStops.forEach(stop => {
        gradient.addColorStop(stop.position / 100, stop.color);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Create radial gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, 
        canvas.height / 2, 
        0, 
        canvas.width / 2, 
        canvas.height / 2, 
        Math.min(canvas.width, canvas.height) / 2
      );
      
      // Add color stops in the same order as CSS
      sortedStops.forEach(stop => {
        gradient.addColorStop(stop.position / 100, stop.color);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Convert to PNG
    const dataUrl = canvas.toDataURL("image/png");
    
    // Create download link
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `gradient-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative h-full">
      <Card 
        ref={previewRef}
        className={`overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[350px] md:h-full min-h-[350px]'}`}
        style={gradientStyle}
      >
        <div className="absolute bottom-4 right-4 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportAsSVG}>
                Export as SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsPNG}>
                Export as PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleFullscreen}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
} 