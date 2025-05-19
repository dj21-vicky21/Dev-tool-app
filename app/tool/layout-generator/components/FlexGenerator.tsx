"use client";

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
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

interface FlexGeneratorProps {
  copyToClipboard: (code: string, type: string) => void;
  copied: string | null;
}

type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";

export default function FlexGenerator({ copyToClipboard, copied }: FlexGeneratorProps) {
  // Flex Configuration
  const [flexDirection, setFlexDirection] = useState<FlexDirection>("row");
  const [flexWrap, setFlexWrap] = useState<FlexWrap>("nowrap");
  const [justifyContent, setJustifyContent] = useState<string>("flex-start");
  const [alignItems, setAlignItems] = useState<string>("stretch");
  const [gap, setGap] = useState<number>(16);
  const [itemCount, setItemCount] = useState<number>(4);
  const [isResponsive, setIsResponsive] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [cellColor] = useState<string>("#e2e8f0");

  // Generate CSS code
  const generateCssCode = useCallback(() => {
    let css = `.flex-container {\n`;
    css += `  display: flex;\n`;
    css += `  flex-direction: ${flexDirection};\n`;
    css += `  flex-wrap: ${flexWrap};\n`;
    css += `  justify-content: ${justifyContent};\n`;
    css += `  align-items: ${alignItems};\n`;
    css += `  gap: ${gap}px;\n`;
    css += `}\n\n`;
    
    css += `.flex-item {\n`;
    css += `  padding: 1rem;\n`;
    css += `  background-color: #e2e8f0;\n`;
    css += `  border-radius: 0.25rem;\n`;
    css += `}\n\n`;
    
    // Add responsive styles if enabled
    if (isResponsive) {
      css += `/* Mobile Layout */\n`;
      css += `@media (max-width: 480px) {\n`;
      css += `  .flex-container {\n`;
      css += `    flex-direction: column;\n`;
      css += `  }\n`;
      css += `}\n`;
    }
    
    return css;
  }, [flexDirection, flexWrap, justifyContent, alignItems, gap, isResponsive]);

  // Generate Tailwind CSS code
  const generateTailwindCode = useCallback(() => {
    // Map CSS flex values to Tailwind classes
    const directionClass = `flex-${flexDirection}`;
    const wrapClass = flexWrap === 'nowrap' ? 'flex-nowrap' : 
                     flexWrap === 'wrap' ? 'flex-wrap' : 'flex-wrap-reverse';
    const justifyClass = justifyContent === 'flex-start' ? 'justify-start' :
                        justifyContent === 'flex-end' ? 'justify-end' :
                        justifyContent === 'center' ? 'justify-center' :
                        justifyContent === 'space-between' ? 'justify-between' :
                        justifyContent === 'space-around' ? 'justify-around' : 'justify-evenly';
    const alignClass = alignItems === 'flex-start' ? 'items-start' :
                      alignItems === 'flex-end' ? 'items-end' :
                      alignItems === 'center' ? 'items-center' :
                      alignItems === 'baseline' ? 'items-baseline' : 'items-stretch';
    const gapClass = `gap-[${gap}px]`;
    
    let tailwind = `<div class="flex ${directionClass} ${wrapClass} ${justifyClass} ${alignClass} ${gapClass}`;
    
    // Add responsive classes if enabled
    if (isResponsive) {
      tailwind += ` sm:flex-col`;
    }
    
    tailwind += `">\n`;
    
    // Add placeholder items
    for (let i = 0; i < itemCount; i++) {
      tailwind += `  <div class="bg-slate-200 p-4 rounded">Item ${i+1}</div>\n`;
    }
    
    tailwind += `</div>`;
    
    return tailwind;
  }, [flexDirection, flexWrap, justifyContent, alignItems, gap, itemCount, isResponsive]);

  // Generate HTML for preview
  const generatePreviewHtml = useCallback(() => {
    const items = [];
    for (let i = 0; i < itemCount; i++) {
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
  }, [itemCount, cellColor]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4 md:col-span-1">
          <h3 className="text-lg font-medium mb-4">Flexbox Configuration</h3>
          
          <div className="space-y-2">
            <Label htmlFor="flex-direction">Flex Direction</Label>
            <Select 
              value={flexDirection} 
              onValueChange={(value: FlexDirection) => setFlexDirection(value)}
            >
              <SelectTrigger id="flex-direction">
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="row">Row</SelectItem>
                <SelectItem value="row-reverse">Row Reverse</SelectItem>
                <SelectItem value="column">Column</SelectItem>
                <SelectItem value="column-reverse">Column Reverse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flex-wrap">Flex Wrap</Label>
            <Select 
              value={flexWrap} 
              onValueChange={(value: FlexWrap) => setFlexWrap(value)}
            >
              <SelectTrigger id="flex-wrap">
                <SelectValue placeholder="Select wrap behavior" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nowrap">No Wrap</SelectItem>
                <SelectItem value="wrap">Wrap</SelectItem>
                <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justify-content">Justify Content</Label>
            <Select value={justifyContent} onValueChange={setJustifyContent}>
              <SelectTrigger id="justify-content">
                <SelectValue placeholder="Select justification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flex-start">Flex Start</SelectItem>
                <SelectItem value="flex-end">Flex End</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="space-between">Space Between</SelectItem>
                <SelectItem value="space-around">Space Around</SelectItem>
                <SelectItem value="space-evenly">Space Evenly</SelectItem>
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
                <SelectItem value="flex-start">Flex Start</SelectItem>
                <SelectItem value="flex-end">Flex End</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="baseline">Baseline</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="items">Number of Items: {itemCount}</Label>
            <Slider
              id="items"
              min={1}
              max={12}
              step={1}
              value={[itemCount]}
              onValueChange={(value) => setItemCount(value[0])}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="responsive"
              checked={isResponsive}
              onCheckedChange={setIsResponsive}
            />
            <Label htmlFor="responsive">Enable responsive behavior</Label>
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
                    display: 'flex',
                    flexDirection: flexDirection,
                    flexWrap: flexWrap,
                    justifyContent,
                    alignItems,
                    gap: `${gap}px`,
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