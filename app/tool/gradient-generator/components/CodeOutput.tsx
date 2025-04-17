"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { CodeOutputProps } from "./types";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  generateCssCode, 
  generateColorsCode, 
  generateValuesCode 
} from "./utils";

export default function CodeOutput({
  colorStops,
  gradientType,
  rotation,
  activeTab,
}: CodeOutputProps) {
  const [copied, setCopied] = useState(false);
  
  const cssCode = generateCssCode(colorStops, gradientType, rotation);
  const colorsCode = generateColorsCode(colorStops);
  const valuesCode = generateValuesCode(colorStops);
  
  const getCode = () => {
    switch (activeTab) {
      case "css":
        return cssCode;
      case "colors":
        return colorsCode;
      case "values":
        return valuesCode;
      default:
        return cssCode;
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };
  
  return (
    <div className="relative mt-2">
      <TabsContent value="css" className="relative">
        <pre className="p-4 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-sm overflow-x-auto">
          {cssCode}
        </pre>
      </TabsContent>
      
      <TabsContent value="colors" className="relative">
        <pre className="p-4 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-sm overflow-x-auto">
          {colorsCode}
        </pre>
      </TabsContent>
      
      <TabsContent value="values" className="relative">
        <pre className="p-4 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
          {valuesCode}
        </pre>
      </TabsContent>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2"
        onClick={copyToClipboard}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
} 