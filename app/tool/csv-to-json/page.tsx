"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Upload, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";

function csvToJSON(csv: string): Record<string, string>[] {
  // Split the input CSV into lines
  const lines = csv.trim().split("\n");
  
  if (lines.length === 0) {
    throw new Error("No data found in CSV");
  }

  // Extract headers and clean them up (remove extra spaces and quotes)
  const headers = lines[0]
    .split(",")
    .map((header) => header.trim().replace(/^"(.*)"$/, "$1"));

  // Process each data line
  return lines
    .slice(1) // Skip the first line (headers)
    .filter((line) => line.trim()) // Remove empty lines
    .map((line) => {
      // Split line into values and handle quoted values with commas
      const values: string[] = [];
      let inQuotes = false;
      let currentValue = "";
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
          currentValue += char;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue.trim());
      
      // Clean up values
      const cleanValues = values.map(value => {
        // Remove surrounding quotes and handle escaped quotes
        if (value.startsWith('"') && value.endsWith('"')) {
          return value.slice(1, -1).replace(/""/g, '"');
        }
        return value;
      });

      // Combine headers with corresponding values into an object
      return headers.reduce((obj, header, index) => {
        obj[header] = cleanValues[index] || ""; // Default to empty string if no value
        return obj;
      }, {} as Record<string, string>);
    });
}

export default function CsvToJson() {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("converted.json");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleConvert = () => {
    if (!csvInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter some CSV data",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      const json = csvToJSON(csvInput);
      setJsonOutput(JSON.stringify(json, null, 2));
    } catch (error) {
      console.error("Error converting CSV to JSON:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid CSV format",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Set the filename for download
    const baseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    setFileName(`${baseName}.json`);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvInput(content);
      
      // Auto-convert if file is loaded
      try {
        const json = csvToJSON(content);
        setJsonOutput(JSON.stringify(json, null, 2));
        toast({
          title: "Success",
          description: `${file.name} loaded successfully`,
        });
      } catch (error) {
        console.error("Error auto-converting CSV:", error);
        // Just load the file, don't auto-convert if error
        toast({
          title: "File Loaded",
          description: "CSV file loaded but not converted. Please check the format and convert manually.",
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read the file",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const copyToClipboard = async () => {
    if (!jsonOutput) {
      toast({
        title: "Error",
        description: "No JSON to copy",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await navigator.clipboard.writeText(jsonOutput);
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadJSON = () => {
    if (!jsonOutput) {
      toast({
        title: "Error",
        description: "No JSON to download",
        variant: "destructive",
      });
      return;
    }
    
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: `JSON saved as ${fileName}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CSV to JSON</h1>
        <p className="text-muted-foreground">Convert CSV data to JSON format</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              CSV Input
              <Button variant="outline" size="sm" onClick={triggerFileUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            </CardTitle>
            <CardDescription>Enter your CSV data or import a file</CardDescription>
            <Input 
              type="file" 
              ref={fileInputRef} 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="name,age\nJohn,30\nJane,25"
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </CardContent>
          <CardFooter>
            <Button
              disabled={!csvInput || isProcessing}
              onClick={handleConvert}
              className="w-full"
            >
              {isProcessing ? "Converting..." : "Convert to JSON"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              JSON Output
              <Input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="max-w-[200px] text-sm"
                placeholder="filename.json"
              />
            </CardTitle>
            <CardDescription>Your converted JSON data</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={jsonOutput}
              className="min-h-[300px] font-mono text-sm"
            />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={!jsonOutput}
              onClick={copyToClipboard}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy JSON
            </Button>
            <Button
              disabled={!jsonOutput}
              className="flex-1"
              onClick={downloadJSON}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
