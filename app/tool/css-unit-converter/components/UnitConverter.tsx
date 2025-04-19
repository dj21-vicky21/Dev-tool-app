"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Check, ArrowRightLeft, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// CSS unit groups
const LENGTH_UNITS = ["px", "em", "rem", "vw", "vh", "vmin", "vmax", "%", "cm", "mm", "in", "pt", "pc"];
const ANGLE_UNITS = ["deg", "rad", "grad", "turn"];
const TIME_UNITS = ["s", "ms"];
const RESOLUTION_UNITS = ["dpi", "dpcm", "dppx"];

// Base values for conversion
const BASE_FONT_SIZE_PX = 16; // Default browser font size
const BASE_VIEWPORT_WIDTH_PX = 1920; // Assumed viewport width
const BASE_VIEWPORT_HEIGHT_PX = 1080; // Assumed viewport height
const BASE_CONTAINER_SIZE_PX = 1000; // Assumed container size for %

export default function UnitConverter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("length");
  const [inputValue, setInputValue] = useState<number>(100);
  const [inputUnit, setInputUnit] = useState<string>("px");
  const [targetUnit, setTargetUnit] = useState<string>("rem");
  const [fontSizePx, setFontSizePx] = useState<number>(BASE_FONT_SIZE_PX);
  const [viewportWidthPx, setViewportWidthPx] = useState<number>(BASE_VIEWPORT_WIDTH_PX);
  const [viewportHeightPx, setViewportHeightPx] = useState<number>(BASE_VIEWPORT_HEIGHT_PX);
  const [containerSizePx, setContainerSizePx] = useState<number>(BASE_CONTAINER_SIZE_PX);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Unit descriptions
  const unitDescriptions = {
    px: "Pixels - Absolute unit for screens",
    em: "Relative to parent element's font size",
    rem: "Relative to root element's font size",
    vw: "1% of viewport width",
    vh: "1% of viewport height",
    vmin: "1% of smaller viewport dimension",
    vmax: "1% of larger viewport dimension",
    "%": "Percentage relative to parent element",
    cm: "Centimeters (physical unit)",
    mm: "Millimeters (physical unit)",
    in: "Inches (physical unit)",
    pt: "Points (1/72 of an inch)",
    pc: "Picas (12 points)",
    deg: "Degrees (0-360)",
    rad: "Radians (0-2π)",
    grad: "Gradians (0-400)",
    turn: "Complete turns (1turn = 360deg)",
    s: "Seconds",
    ms: "Milliseconds (1000ms = 1s)",
    dpi: "Dots per inch",
    dpcm: "Dots per centimeter",
    dppx: "Dots per px unit (1dppx = 96dpi)"
  };

  // Get current units based on active tab
  const getCurrentUnits = () => {
    switch (activeTab) {
      case "length":
        return LENGTH_UNITS;
      case "angle":
        return ANGLE_UNITS;
      case "time":
        return TIME_UNITS;
      case "resolution":
        return RESOLUTION_UNITS;
      default:
        return LENGTH_UNITS;
    }
  };

  // Reset unit when changing tabs
  useEffect(() => {
    const units = getCurrentUnits();
    setInputUnit(units[0]);
    setTargetUnit(units[1]);
  }, [activeTab]);

  // Copy value to clipboard
  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    
    toast({
      title: "Copied!",
      description: `${value} copied to clipboard`,
    });

    setTimeout(() => setCopied(null), 2000);
  };

  // Convert between length units
  const convertLength = (value: number, fromUnit: string, toUnit: string): number => {
    // First convert to px as base unit
    let valueInPx: number;

    switch (fromUnit) {
      case "px":
        valueInPx = value;
        break;
      case "em":
        valueInPx = value * fontSizePx;
        break;
      case "rem":
        valueInPx = value * BASE_FONT_SIZE_PX;
        break;
      case "vw":
        valueInPx = (value / 100) * viewportWidthPx;
        break;
      case "vh":
        valueInPx = (value / 100) * viewportHeightPx;
        break;
      case "vmin":
        valueInPx = (value / 100) * Math.min(viewportWidthPx, viewportHeightPx);
        break;
      case "vmax":
        valueInPx = (value / 100) * Math.max(viewportWidthPx, viewportHeightPx);
        break;
      case "%":
        valueInPx = (value / 100) * containerSizePx;
        break;
      case "cm":
        valueInPx = value * 37.8; // 1cm ≈ 37.8px
        break;
      case "mm":
        valueInPx = value * 3.78; // 1mm ≈ 3.78px
        break;
      case "in":
        valueInPx = value * 96; // 1in = 96px
        break;
      case "pt":
        valueInPx = value * 1.33; // 1pt ≈ 1.33px
        break;
      case "pc":
        valueInPx = value * 16; // 1pc = 16px
        break;
      default:
        valueInPx = value;
    }

    // Then convert from px to target unit
    switch (toUnit) {
      case "px":
        return valueInPx;
      case "em":
        return valueInPx / fontSizePx;
      case "rem":
        return valueInPx / BASE_FONT_SIZE_PX;
      case "vw":
        return (valueInPx / viewportWidthPx) * 100;
      case "vh":
        return (valueInPx / viewportHeightPx) * 100;
      case "vmin":
        return (valueInPx / Math.min(viewportWidthPx, viewportHeightPx)) * 100;
      case "vmax":
        return (valueInPx / Math.max(viewportWidthPx, viewportHeightPx)) * 100;
      case "%":
        return (valueInPx / containerSizePx) * 100;
      case "cm":
        return valueInPx / 37.8;
      case "mm":
        return valueInPx / 3.78;
      case "in":
        return valueInPx / 96;
      case "pt":
        return valueInPx / 1.33;
      case "pc":
        return valueInPx / 16;
      default:
        return valueInPx;
    }
  };

  // Convert between angle units
  const convertAngle = (value: number, fromUnit: string, toUnit: string): number => {
    // First convert to degrees as base unit
    let valueInDegrees: number;

    switch (fromUnit) {
      case "deg":
        valueInDegrees = value;
        break;
      case "rad":
        valueInDegrees = value * (180 / Math.PI);
        break;
      case "grad":
        valueInDegrees = value * 0.9;
        break;
      case "turn":
        valueInDegrees = value * 360;
        break;
      default:
        valueInDegrees = value;
    }

    // Then convert from degrees to target unit
    switch (toUnit) {
      case "deg":
        return valueInDegrees;
      case "rad":
        return valueInDegrees * (Math.PI / 180);
      case "grad":
        return valueInDegrees / 0.9;
      case "turn":
        return valueInDegrees / 360;
      default:
        return valueInDegrees;
    }
  };

  // Convert between time units
  const convertTime = (value: number, fromUnit: string, toUnit: string): number => {
    if (fromUnit === "s" && toUnit === "ms") {
      return value * 1000;
    } else if (fromUnit === "ms" && toUnit === "s") {
      return value / 1000;
    }
    return value;
  };

  // Convert between resolution units
  const convertResolution = (value: number, fromUnit: string, toUnit: string): number => {
    // First convert to dppx as base unit
    let valueInDppx: number;

    switch (fromUnit) {
      case "dppx":
        valueInDppx = value;
        break;
      case "dpi":
        valueInDppx = value / 96;
        break;
      case "dpcm":
        valueInDppx = value / 37.8;
        break;
      default:
        valueInDppx = value;
    }

    // Then convert from dppx to target unit
    switch (toUnit) {
      case "dppx":
        return valueInDppx;
      case "dpi":
        return valueInDppx * 96;
      case "dpcm":
        return valueInDppx * 37.8;
      default:
        return valueInDppx;
    }
  };

  // Handle conversion based on active tab
  const convertValue = (value: number, fromUnit: string, toUnit: string): number => {
    if (fromUnit === toUnit) return value;

    switch (activeTab) {
      case "length":
        return convertLength(value, fromUnit, toUnit);
      case "angle":
        return convertAngle(value, fromUnit, toUnit);
      case "time":
        return convertTime(value, fromUnit, toUnit);
      case "resolution":
        return convertResolution(value, fromUnit, toUnit);
      default:
        return value;
    }
  };

  // Format output value with appropriate precision
  const formatValue = (value: number): string => {
    if (value === 0) return "0";
    
    // For very small values, use scientific notation
    if (Math.abs(value) < 0.001) {
      return value.toExponential(4);
    }
    
    // For values with decimals, limit to 4 decimal places
    if (Math.abs(value) % 1 !== 0) {
      // Remove trailing zeros
      return parseFloat(value.toFixed(4)).toString();
    }
    
    return value.toString();
  };

  // Get formatted output value with unit
  const getFormattedOutput = (value: number, unit: string): string => {
    return `${formatValue(value)}${unit}`;
  };

  // Swap input and target units
  const swapUnits = () => {
    const temp = inputUnit;
    setInputUnit(targetUnit);
    setTargetUnit(temp);
  };

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <Tabs defaultValue="length" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="length">Length</TabsTrigger>
            <TabsTrigger value="angle">Angle</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="resolution">Resolution</TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            {/* Simple converter UI */}
            <div className="flex flex-col md:flex-row gap-4 justify-center md:items-end">
              <div className="w-full md:w-auto">
                <Label htmlFor="inputValue" className="text-sm mb-2 block">Value</Label>
                <div className="flex h-10">
                  <Input
                    id="inputValue"
                    onFocus={(e) => e.target.select()}
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
                    className="rounded-r-none w-24 h-full"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-full">
                          <Select value={inputUnit} onValueChange={setInputUnit}>
                            <SelectTrigger className="w-[80px] h-full rounded-l-none border-l-0">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {getCurrentUnits().map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{unitDescriptions[inputUnit as keyof typeof unitDescriptions]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={swapUnits}
                className="mx-2 hidden md:flex"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span className="sr-only">Swap units</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={swapUnits}
                className="my-2 md:hidden"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Swap
              </Button>

              <div className="w-full md:w-auto">
                <Label htmlFor="targetUnit" className="text-sm mb-2 block">Convert to</Label>
                <div className="flex h-10">
                  <Input
                    id="targetValue"
                    type="text"
                    value={formatValue(convertValue(inputValue, inputUnit, targetUnit))}
                    readOnly
                    className="rounded-r-none w-24 bg-muted h-full"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-full">
                          <Select value={targetUnit} onValueChange={setTargetUnit}>
                            <SelectTrigger className="w-[80px] h-full rounded-l-none border-l-0">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {getCurrentUnits().map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{unitDescriptions[targetUnit as keyof typeof unitDescriptions]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(getFormattedOutput(convertValue(inputValue, inputUnit, targetUnit), targetUnit))}
                className="mt-6 md:mt-0 h-10 w-10"
              >
                {copied === getFormattedOutput(convertValue(inputValue, inputUnit, targetUnit), targetUnit) ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Advanced settings toggle */}
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                size="sm"
                className="flex items-center gap-1 text-xs font-normal text-muted-foreground"
              >
                <Info className="h-3 w-3 mr-1" />
                {showAdvanced ? "Hide advanced settings" : "Show advanced settings"}
              </Button>
            </div>

            {/* Show advanced settings if enabled */}
            {showAdvanced && activeTab === "length" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md">
                <div>
                  <Label htmlFor="fontSizePx" className="text-sm">Root Font Size (px)</Label>
                  <Input
                    onFocus={(e) => e.target.select()}
                    id="fontSizePx"
                    type="number"
                    value={fontSizePx}
                    onChange={(e) => setFontSizePx(parseFloat(e.target.value) || BASE_FONT_SIZE_PX)}
                    className="mt-1 h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used for em/rem calculations</p>
                </div>
                <div>
                  <Label htmlFor="containerSizePx" className="text-sm">Container Size (px)</Label>
                  <Input
                    onFocus={(e) => e.target.select()}
                    id="containerSizePx"
                    type="number"
                    value={containerSizePx}
                    onChange={(e) => setContainerSizePx(parseFloat(e.target.value) || BASE_CONTAINER_SIZE_PX)}
                    className="mt-1 h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Parent element size for % calculations</p>
                </div>
                <div>
                  <Label htmlFor="viewportWidthPx" className="text-sm">Viewport Width (px)</Label>
                  <Input
                    onFocus={(e) => e.target.select()}
                    id="viewportWidthPx"
                    type="number"
                    value={viewportWidthPx}
                    onChange={(e) => setViewportWidthPx(parseFloat(e.target.value) || BASE_VIEWPORT_WIDTH_PX)}
                    className="mt-1 h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used for vw calculations</p>
                </div>
                <div>
                  <Label htmlFor="viewportHeightPx" className="text-sm">Viewport Height (px)</Label>
                  <Input
                    onFocus={(e) => e.target.select()}
                    id="viewportHeightPx"
                    type="number"
                    value={viewportHeightPx}
                    onChange={(e) => setViewportHeightPx(parseFloat(e.target.value) || BASE_VIEWPORT_HEIGHT_PX)}
                    className="mt-1 h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used for vh calculations</p>
                </div>
              </div>
            )}

            {/* All conversions table */}
            {showAdvanced && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">All conversions</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Unit</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="w-[50px] text-right">Copy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCurrentUnits().map((unit) => {
                        if (unit === inputUnit || unit === targetUnit) return null;
                        
                        const convertedValue = convertValue(inputValue, inputUnit, unit);
                        const formattedOutput = getFormattedOutput(convertedValue, unit);
                        
                        return (
                          <TableRow key={unit}>
                            <TableCell className="font-medium">{unit}</TableCell>
                            <TableCell>{formatValue(convertedValue)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(formattedOutput)}
                              >
                                {copied === formattedOutput ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Information about units */}
            {showAdvanced && (
              <div className="mt-4 bg-muted/30 p-4 rounded-md text-sm space-y-2">
                <h3 className="font-medium">About {activeTab} units in CSS</h3>
                
                {activeTab === "length" && (
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                    <li><strong>px</strong> - Pixels, absolute unit based on screen resolution</li>
                    <li><strong>em</strong> - Relative to the font-size of the element</li>
                    <li><strong>rem</strong> - Relative to the font-size of the root element</li>
                    <li><strong>%</strong> - Relative to the parent element</li>
                    <li><strong>vw, vh</strong> - Relative to 1% of viewport width/height</li>
                    <li><strong>vmin, vmax</strong> - Relative to 1% of smaller/larger viewport dimension</li>
                  </ul>
                )}

                {activeTab === "angle" && (
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                    <li><strong>deg</strong> - Degrees, 360 degrees in a full circle</li>
                    <li><strong>rad</strong> - Radians, 2π radians in a full circle</li>
                    <li><strong>grad</strong> - Gradians, 400 gradians in a full circle</li>
                    <li><strong>turn</strong> - A full turn equals 1turn (360 degrees)</li>
                  </ul>
                )}

                {activeTab === "time" && (
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                    <li><strong>s</strong> - Seconds</li>
                    <li><strong>ms</strong> - Milliseconds (1s = 1000ms)</li>
                  </ul>
                )}

                {activeTab === "resolution" && (
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                    <li><strong>dpi</strong> - Dots per inch</li>
                    <li><strong>dpcm</strong> - Dots per centimeter</li>
                    <li><strong>dppx</strong> - Dots per pixel (1dppx = 96dpi)</li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 