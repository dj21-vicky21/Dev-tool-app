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
  
  const exportAsSVG = () => {
    if (!previewRef.current) return;
    
    // Create SVG with the gradient
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "800");
    svg.setAttribute("height", "600");
    
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
      // Convert rotation angle to x1,y1,x2,y2 coordinates
      const angle = rotation % 360;
      const angleInRadians = (angle - 90) * (Math.PI / 180);
      const x1 = 50 + 50 * Math.cos(angleInRadians);
      const y1 = 50 + 50 * Math.sin(angleInRadians);
      const x2 = 50 + 50 * Math.cos(angleInRadians + Math.PI);
      const y2 = 50 + 50 * Math.sin(angleInRadians + Math.PI);
      
      gradientElement.setAttribute("x1", `${x1}%`);
      gradientElement.setAttribute("y1", `${y1}%`);
      gradientElement.setAttribute("x2", `${x2}%`);
      gradientElement.setAttribute("y2", `${y2}%`);
    } else {
      gradientElement.setAttribute("cx", "50%");
      gradientElement.setAttribute("cy", "50%");
      gradientElement.setAttribute("r", "50%");
    }
    
    // Add stops
    colorStops.forEach(stop => {
      const stopElement = document.createElementNS(svgNS, "stop");
      stopElement.setAttribute("offset", `${stop.position}%`);
      stopElement.setAttribute("stop-color", stop.color);
      gradientElement.appendChild(stopElement);
    });
    
    defs.appendChild(gradientElement);
    svg.appendChild(defs);
    
    // Create rectangle with the gradient
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", `url(#${gradientId})`);
    svg.appendChild(rect);
    
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
    
    // Create a canvas with the gradient
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    if (gradientType === "linear") {
      // Create linear gradient
      const angleInRadians = (rotation - 90) * (Math.PI / 180);
      const x1 = 400 + 400 * Math.cos(angleInRadians);
      const y1 = 300 + 300 * Math.sin(angleInRadians);
      const x2 = 400 + 400 * Math.cos(angleInRadians + Math.PI);
      const y2 = 300 + 300 * Math.sin(angleInRadians + Math.PI);
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      
      // Add color stops
      colorStops.forEach(stop => {
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
      
      // Add color stops
      colorStops.forEach(stop => {
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