"use client";

import { useState, useCallback } from "react";
import { EncodingType, encode, decode, saveToHistory } from "./components/utils";
import { EncodingSelector } from "./components/EncodingSelector";
import { InputSection } from "./components/InputSection";
import { OutputSection } from "./components/OutputSection";
import { HistorySection } from "./components/HistorySection";
import { useToast } from "@/hooks/use-toast";

export default function EncodeDecode() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState<EncodingType>("base64");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleEncode = useCallback(async () => {
    if (!input) return;
    
    setIsProcessing(true);
    
    try {
      // For large inputs, we can use setTimeout to avoid blocking the UI
      setTimeout(() => {
        const result = encode(input, activeTab);
        setOutput(result);
        
        // Save to history
        saveToHistory({
          input,
          output: result,
          encodingType: activeTab,
          operation: 'encode'
        });
        
        setIsProcessing(false);
      }, 0);
    } catch (error) {
      console.error('Encoding error:', error);
      toast({
        title: "Encoding failed",
        description: "Failed to encode the input. Please check your input and try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }, [input, activeTab, toast]);

  const handleDecode = useCallback(async () => {
    if (!input) return;
    
    setIsProcessing(true);
    
    try {
      // For large inputs, we can use setTimeout to avoid blocking the UI
      setTimeout(() => {
        const result = decode(input, activeTab);
        setOutput(result);
        
        // Save to history
        saveToHistory({
          input,
          output: result,
          encodingType: activeTab,
          operation: 'decode'
        });
        
        setIsProcessing(false);
      }, 0);
    } catch (error) {
      console.error('Decoding error:', error);
      toast({
        title: "Decoding failed",
        description: "Failed to decode the input. Please check your input is valid for the selected format.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }, [input, activeTab, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Convert text between different formats
        </p>
        <HistorySection setInput={setInput} setActiveTab={setActiveTab} />
      </div>

      <EncodingSelector activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <InputSection
          input={input}
          setInput={setInput}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleEncode={handleEncode}
          handleDecode={handleDecode}
          isProcessing={isProcessing}
        />

        <OutputSection
          output={output}
          setInput={setInput}
          setOutput={setOutput}
          activeTab={activeTab}
          loading={isProcessing}
        />
      </div>
    </div>
  );
}
