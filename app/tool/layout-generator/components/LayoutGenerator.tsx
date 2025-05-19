"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import GridGenerator from "./GridGenerator";
import FlexGenerator from "./FlexGenerator";

export default function LayoutGenerator() {
  const [layoutType, setLayoutType] = useState<"grid" | "flex">("grid");
  const [copied, setCopied] = useState<string | null>(null);

  // Handle copying code to clipboard
  const copyToClipboard = useCallback((code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    
    toast({
      title: "Copied!",
      description: `${type} code copied to clipboard`,
    });

    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <Tabs value={layoutType} onValueChange={(value) => setLayoutType(value as "grid" | "flex")} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="grid">CSS Grid</TabsTrigger>
            <TabsTrigger value="flex">Flexbox</TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            {layoutType === "grid" ? (
              <GridGenerator copyToClipboard={copyToClipboard} copied={copied} />
            ) : (
              <FlexGenerator copyToClipboard={copyToClipboard} copied={copied} />
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 