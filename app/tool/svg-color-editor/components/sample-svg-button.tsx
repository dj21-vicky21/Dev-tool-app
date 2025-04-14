"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SampleSVGButtonProps {
  onSampleSvgLoaded: (svgContent: string) => void;
}

export function SampleSVGButton({ onSampleSvgLoaded }: SampleSVGButtonProps) {
  const loadSampleSvg = async () => {
    try {
      const response = await fetch('/window.svg');
      if (!response.ok) {
        throw new Error('Failed to load sample SVG');
      }

      const svgContent = await response.text();
      onSampleSvgLoaded(svgContent);

      toast({
        title: "Sample SVG loaded",
        description: "You can now edit the sample SVG",
      });
    } catch (error) {
      toast({
        title: "Error loading sample",
        description: "Failed to load the sample SVG",
        variant: "destructive",
      });
      console.error('Error loading sample SVG:', error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={loadSampleSvg}
      className="mt-2"
    >
      Try with Sample SVG
    </Button>
  );
}
