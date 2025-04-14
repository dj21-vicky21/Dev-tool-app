"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface SVGUploadProps {
  onSvgLoaded: (svgContent: string) => void;
}

export function SVGUpload({ onSvgLoaded }: SVGUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    // Guard for SSR
    if (typeof window === 'undefined') return;

    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    // Guard for SSR
    if (typeof window === 'undefined') return;

    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Guard for SSR
    if (typeof window === 'undefined') return;

    e.preventDefault();

    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.svg')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an SVG file",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          if (e.target?.result) {
            const svgContent = e.target.result as string;

            // Validate that the content is actually SVG
            if (!svgContent.trim().startsWith('<svg') && !svgContent.trim().startsWith('<?xml')) {
              toast({
                title: "Invalid SVG content",
                description: "The file doesn't contain valid SVG markup",
                variant: "destructive"
              });
              setIsLoading(false);
              return;
            }

            onSvgLoaded(svgContent);
            toast({
              title: "SVG loaded successfully",
              description: `Loaded ${file.name}`,
            });
          } else {
            toast({
              title: "Error reading file",
              description: "Could not read the file content",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error processing SVG file:', error);
          toast({
            title: "Error",
            description: "Failed to process the SVG file",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Failed to read the file",
          variant: "destructive"
        });
        setIsLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error handling file:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload SVG</CardTitle>
        <CardDescription>
          Upload an SVG file to edit its colors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer ${
            dragActive ? "border-primary bg-muted/50" : "border-muted-foreground/25"
          } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Processing SVG file...</p>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-muted-foreground"
                >
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                  <path d="M12 12v9" />
                  <path d="m16 16-4-4-4 4" />
                </svg>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your SVG file here, or click to browse
                </p>
              </>
            )}
          </div>
        </div>
        <Input
          ref={inputRef}
          type="file"
          accept=".svg"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />
      </CardContent>
    </Card>
  );
}
