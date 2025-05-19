"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface GridGeneratorProps {
  copyToClipboard: (code: string, type: string) => void;
  copied: string | null;
}

export default function GridGenerator({ copyToClipboard, copied }: GridGeneratorProps) {
  // Grid Configuration
  const [columns, setColumns] = useState<number>(3);
  const [rows, setRows] = useState<number>(2);
  const [gap, setGap] = useState<number>(16);
  const [columnLayout, setColumnLayout] = useState<string>("1fr 1fr 1fr");
  const [rowLayout, setRowLayout] = useState<string>("auto auto");
  const [justifyItems, setJustifyItems] = useState<string>("stretch");
  const [alignItems, setAlignItems] = useState<string>("stretch");
  const [isResponsive, setIsResponsive] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [cellColor] = useState<string>("#e2e8f0");
  const [gridTemplateAreas, setGridTemplateAreas] = useState<string[]>([]);

  // Handle columns change
  useEffect(() => {
    // Generate default column template when columns change
    const newColumnTemplate = Array(columns).fill("1fr").join(" ");
    setColumnLayout(newColumnTemplate);
  }, [columns]);

  // Handle rows change
  useEffect(() => {
    // Generate default row template when rows change
    const newRowTemplate = Array(rows).fill("auto").join(" ");
    setRowLayout(newRowTemplate);
    
    // Reset template areas when row/column count changes
    generateDefaultTemplateAreas();
  }, [rows, columns]);

  // Generate default template areas based on rows and columns
  const generateDefaultTemplateAreas = useCallback(() => {
    const areas = [];
    for (let r = 0; r < rows; r++) {
      let rowStr = "";
      for (let c = 0; c < columns; c++) {
        rowStr += `area-${r}-${c} `;
      }
      areas.push(rowStr.trim());
    }
    setGridTemplateAreas(areas);
  }, [rows, columns]);

  // Generate CSS code
  const generateCssCode = useCallback(() => {
    const areasString = gridTemplateAreas.map(row => `"${row}"`).join(" ");
    
    let css = `.grid-container {\n`;
    css += `  display: grid;\n`;
    css += `  grid-template-columns: ${columnLayout};\n`;
    css += `  grid-template-rows: ${rowLayout};\n`;
    css += `  gap: ${gap}px;\n`;
    css += `  justify-items: ${justifyItems};\n`;
    css += `  align-items: ${alignItems};\n`;
    
    if (gridTemplateAreas.length > 0) {
      css += `  grid-template-areas: ${areasString};\n`;
    }
    
    css += `}\n\n`;
    
    // Add responsive styles if enabled
    if (isResponsive) {
      css += `/* Tablet Layout */\n`;
      css += `@media (max-width: 768px) {\n`;
      css += `  .grid-container {\n`;
      css += `    grid-template-columns: ${columns > 2 ? Array(Math.ceil(columns/2)).fill("1fr").join(" ") : columnLayout};\n`;
      css += `  }\n`;
      css += `}\n\n`;
      
      css += `/* Mobile Layout */\n`;
      css += `@media (max-width: 480px) {\n`;
      css += `  .grid-container {\n`;
      css += `    grid-template-columns: 1fr;\n`;
      css += `  }\n`;
      css += `}\n`;
    }
    
    return css;
  }, [columnLayout, rowLayout, gap, justifyItems, alignItems, gridTemplateAreas, isResponsive, columns]);

  // Generate Tailwind CSS code
  const generateTailwindCode = useCallback(() => {
    // Map CSS grid values to Tailwind classes
    const gridColsClass = `grid-cols-${columns}`;
    const gridRowsClass = `grid-rows-${rows}`;
    const gapClass = `gap-[${gap}px]`;
    const justifyClass = `justify-items-${justifyItems === 'start' ? 'start' : 
                          justifyItems === 'end' ? 'end' : 
                          justifyItems === 'center' ? 'center' : 'stretch'}`;
    const alignClass = `items-${alignItems === 'start' ? 'start' : 
                      alignItems === 'end' ? 'end' : 
                      alignItems === 'center' ? 'center' : 'stretch'}`;
    
    let tailwind = `<div class="grid ${gridColsClass} ${gridRowsClass} ${gapClass} ${justifyClass} ${alignClass}`;
    
    // Add responsive classes if enabled
    if (isResponsive) {
      tailwind += ` md:${gridColsClass} sm:grid-cols-${Math.ceil(columns/2)} xs:grid-cols-1`;
    }
    
    tailwind += `">\n`;
    
    // Add placeholder items
    for (let i = 0; i < rows * columns; i++) {
      tailwind += `  <div class="bg-slate-200 p-4 rounded">Item ${i+1}</div>\n`;
    }
    
    tailwind += `</div>`;
    
    return tailwind;
  }, [columns, rows, gap, justifyItems, alignItems, isResponsive]);

  // Generate HTML for preview
  const generatePreviewHtml = useCallback(() => {
    const items = [];
    for (let i = 0; i < rows * columns; i++) {
      items.push(
        <div 
          key={i}
          className="p-4 rounded text-center font-medium text-black"
          style={{ backgroundColor: cellColor }}
        >
          Item {i+1}
        </div>
      );
    }
    return items;
  }, [rows, columns, cellColor]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4 md:col-span-1">
          <h3 className="text-lg font-medium mb-4">Grid Configuration</h3>
          
          <div className="space-y-2">
            <Label htmlFor="columns">Columns: {columns}</Label>
            <Slider
              id="columns"
              min={1}
              max={12}
              step={1}
              value={[columns]}
              onValueChange={(value) => setColumns(value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rows">Rows: {rows}</Label>
            <Slider
              id="rows"
              min={1}
              max={8}
              step={1}
              value={[rows]}
              onValueChange={(value) => setRows(value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gap">Gap: {gap}px</Label>
            <Slider
              id="gap"
              min={0}
              max={40}
              step={1}
              value={[gap]}
              onValueChange={(value) => setGap(value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="column-layout">Column Layout</Label>
            <Input
              id="column-layout"
              value={columnLayout}
              onChange={(e) => setColumnLayout(e.target.value)}
              placeholder="e.g., 1fr 2fr 1fr"
            />
            <p className="text-xs text-muted-foreground">Space-separated values (fr, px, %, etc.)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="row-layout">Row Layout</Label>
            <Input
              id="row-layout"
              value={rowLayout}
              onChange={(e) => setRowLayout(e.target.value)}
              placeholder="e.g., auto auto"
            />
            <p className="text-xs text-muted-foreground">Space-separated values (auto, fr, px, etc.)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justify-items">Justify Items</Label>
            <Select value={justifyItems} onValueChange={setJustifyItems}>
              <SelectTrigger id="justify-items">
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="align-items">Align Items</Label>
            <Select value={alignItems} onValueChange={setAlignItems}>
              <SelectTrigger id="align-items">
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="responsive"
              checked={isResponsive}
              onCheckedChange={setIsResponsive}
            />
            <Label htmlFor="responsive">Enable responsive breakpoints</Label>
          </div>
        </div>

        {/* Preview and Code */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-4">
              <Card className="overflow-auto p-6 border-2 min-h-[400px]">
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: columnLayout,
                    gridTemplateRows: rowLayout,
                    gap: `${gap}px`,
                    justifyItems,
                    alignItems,
                    gridTemplateAreas: gridTemplateAreas.map(row => `"${row}"`).join(" ")
                  }}
                  className="w-full h-full"
                >
                  {generatePreviewHtml()}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="code" className="space-y-4">
              <Tabs defaultValue="css" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
                </TabsList>
                
                <TabsContent value="css" className="relative">
                  <pre className="rounded-md bg-slate-950 p-4 text-white text-sm overflow-auto max-h-[400px]">
                    <code>{generateCssCode()}</code>
                  </pre>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700"
                    onClick={() => copyToClipboard(generateCssCode(), "CSS")}
                  >
                    {copied === "CSS" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-white" />}
                  </Button>
                </TabsContent>
                
                <TabsContent value="tailwind" className="relative">
                  <pre className="rounded-md bg-slate-950 p-4 text-white text-sm overflow-auto max-h-[400px]">
                    <code>{generateTailwindCode()}</code>
                  </pre>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700"
                    onClick={() => copyToClipboard(generateTailwindCode(), "Tailwind")}
                  >
                    {copied === "Tailwind" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-white" />}
                  </Button>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 