"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EncodingType, getExampleText, detectEncoding } from "./utils";
import { 
  UploadCloud, 
  Trash2, 
  FileText, 
  RotateCcw, 
  Wand2, 
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InputSectionProps {
  input: string;
  setInput: (value: string) => void;
  activeTab: EncodingType;
  setActiveTab: (tab: EncodingType) => void;
  handleEncode: () => void;
  handleDecode: () => void;
  isProcessing: boolean;
}

export function InputSection({
  input,
  setInput,
  activeTab,
  setActiveTab,
  handleEncode,
  handleDecode,
  isProcessing
}: InputSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [fileError, setFileError] = useState<string | null>(null);
  
  const handleClear = () => {
    setInput("");
    setFileError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
      setFileError("File too large. Maximum size is 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        // Truncate if too large
        const maxLength = 100000; // 100k characters
        const truncated = result.length > maxLength 
          ? result.substring(0, maxLength) + "\n\n[Content truncated due to size...]" 
          : result;
        setInput(truncated);
        
        // Attempt to auto-detect format
        const detectedType = detectEncoding(truncated);
        if (detectedType) {
          setActiveTab(detectedType);
          toast({
            title: "Format detected!",
            description: `Detected as ${detectedType} encoding.`,
          });
        }
      }
    };
    reader.onerror = () => {
      setFileError("Error reading file.");
    };
    reader.readAsText(file);
  };

  const handleExample = () => {
    const example = getExampleText(activeTab);
    setInput(example.encoded);
  };

  const handleAutoDetect = useCallback(() => {
    if (!input) {
      toast({
        title: "No input",
        description: "Please enter some text to detect its encoding format.",
        variant: "destructive",
      });
      return;
    }
    
    const detectedType = detectEncoding(input);
    if (detectedType) {
      setActiveTab(detectedType);
      toast({
        title: "Format detected!",
        description: `Detected as ${detectedType} encoding.`,
      });
    } else {
      toast({
        title: "Detection failed",
        description: "Couldn't determine the encoding format. Please select manually.",
        variant: "destructive",
      });
    }
  }, [input, setActiveTab, toast]);
  
  return (
    <Card className="transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Input</CardTitle>
            <CardDescription>Enter text to encode or decode</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {input.length} chars
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter text here or upload a file..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm resize-y"
        />
        
        {fileError && (
          <p className="text-destructive text-sm">{fileError}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleEncode}
            className="w-full"
            disabled={!input || isProcessing}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Encode
          </Button>
          <Button
            onClick={handleDecode}
            variant="secondary"
            className="w-full"
            disabled={!input || isProcessing}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Decode
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 border-t px-6 py-4 bg-muted/30">
        <div className="flex flex-wrap gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <UploadCloud className="h-4 w-4 mr-1.5" />
            Upload File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.json,.xml,.html,.csv,.md"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="flex-1"
            disabled={!input}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clear
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExample}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Load Example
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoDetect}
            className="flex-1"
            disabled={!input}
          >
            <Wand2 className="h-4 w-4 mr-1.5" />
            Auto-Detect
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 