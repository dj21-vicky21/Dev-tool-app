"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EncodingType } from "./utils";
import { 
  Copy, 
  Download, 
  RotateCw,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface OutputSectionProps {
  output: string;
  setInput: (value: string) => void;
  setOutput: (value: string) => void;
  activeTab: EncodingType;
  loading: boolean;
}

export function OutputSection({
  output,
  setInput,
  setOutput,
  activeTab,
  loading
}: OutputSectionProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Output copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadOutput = () => {
    if (!output) return;
    
    const element = document.createElement("a");
    const file = new Blob([output], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `encoded_${activeTab}_${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded!",
      description: "Output saved to file",
    });
  };

  const swapWithInput = () => {
    setInput(output);
    setOutput("");
  };

  const shareOutput = async () => {
    if (!output) return;
    
    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Encoded/Decoded text (${activeTab})`,
          text: output,
        });
        toast({
          title: "Shared!",
          description: "Content shared successfully",
        });
      } catch (error) {
        // Check if it's an AbortError (user canceled the share)
        if (error instanceof Error && error.name === "AbortError") {
          // User cancelled sharing, no need to show error toast
          console.log("Share cancelled by user");
        } else {
          // For other errors, fallback to clipboard
          console.error("Error sharing:", error);
          toast({
            title: "Sharing failed",
            description: "Copied to clipboard instead",
          });
          await copyToClipboard();
        }
      }
    } else {
      // Fallback to clipboard if Web Share API is not supported
      copyToClipboard();
    }
  };

  return (
    <Card className="transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Output</CardTitle>
            <CardDescription>Encoded or decoded result</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary">
              {activeTab}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {output.length} chars
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            readOnly
            value={output}
            className={`min-h-[200px] font-mono text-sm resize-y ${loading ? 'opacity-50' : ''}`}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="flex flex-col items-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                <span className="mt-2 text-sm">Processing...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 border-t px-6 py-4 bg-muted/30">
        <div className="flex flex-wrap gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!output || loading}
            className="flex-1"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 mr-1.5" />
            )}
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadOutput}
            disabled={!output || loading}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={swapWithInput}
            disabled={!output || loading}
            className="flex-1"
          >
            <RotateCw className="h-4 w-4 mr-1.5" />
            Use as Input
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={shareOutput}
            disabled={!output || loading || !navigator.share}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 