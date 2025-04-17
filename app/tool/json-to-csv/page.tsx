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

function jsonToCSV(jsonData: Record<string, unknown>[]): string {
  if (!Array.isArray(jsonData) || !jsonData.length) return "";

  const headers = Object.keys(jsonData[0]);
  const rows = jsonData.map((obj) =>
    headers
      .map((header) => {
        let cell = obj[header];
        if (cell === null || cell === undefined) cell = "";
        if (typeof cell === "object") cell = JSON.stringify(cell);
        cell = String(cell).replace(/"/g, '""');
        return `"${cell}"`;
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export default function JsonToCsv() {
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("converted.csv");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleConvert = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter some JSON data",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      const jsonData = JSON.parse(jsonInput);
      if (!Array.isArray(jsonData)) {
        throw new Error("Input must be an array of objects");
      }
      if (jsonData.length === 0) {
        throw new Error("JSON array is empty");
      }
      const csv = jsonToCSV(jsonData);
      setCsvOutput(csv);
    } catch (error) {
      console.error("Error converting JSON to CSV:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Invalid JSON input",
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
    setFileName(`${baseName}.csv`);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      
      // Auto-convert if file is loaded
      try {
        const jsonData = JSON.parse(content);
        if (!Array.isArray(jsonData)) {
          throw new Error("Input must be an array of objects");
        }
        if (jsonData.length === 0) {
          throw new Error("JSON array is empty");
        }
        
        const csv = jsonToCSV(jsonData);
        setCsvOutput(csv);
        toast({
          title: "Success",
          description: `${file.name} loaded and converted successfully`,
        });
      } catch (error) {
        console.error("Error auto-converting JSON:", error);
        // Just load the file, don't auto-convert if error
        toast({
          title: "File Loaded",
          description: "JSON file loaded but not converted. Please check the format and convert manually.",
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
    if (!csvOutput) {
      toast({
        title: "Error",
        description: "No CSV to copy",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await navigator.clipboard.writeText(csvOutput);
      toast({
        title: "Copied!",
        description: "CSV copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadCSV = () => {
    if (!csvOutput) {
      toast({
        title: "Error",
        description: "No CSV to download",
        variant: "destructive",
      });
      return;
    }
    
    const blob = new Blob([csvOutput], { type: "text/csv" });
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
      description: `CSV saved as ${fileName}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JSON to CSV</h1>
        <p className="text-muted-foreground">
          Convert JSON array data to CSV format
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              JSON Input
              <Button variant="outline" size="sm" onClick={triggerFileUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Import JSON
              </Button>
            </CardTitle>
            <CardDescription>Enter your JSON array or import a file</CardDescription>
            <Input 
              type="file" 
              ref={fileInputRef} 
              accept=".json" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </CardContent>
          <CardFooter>
            <Button
              disabled={!jsonInput || isProcessing}
              onClick={handleConvert}
              className="w-full"
            >
              {isProcessing ? "Converting..." : "Convert to CSV"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              CSV Output
              <Input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="max-w-[200px] text-sm"
                placeholder="filename.csv"
              />
            </CardTitle>
            <CardDescription>Your converted CSV data</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={csvOutput}
              className="min-h-[300px] font-mono text-sm"
            />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={!csvOutput}
              onClick={copyToClipboard}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy CSV
            </Button>
            <Button
              disabled={!csvOutput}
              className="flex-1"
              onClick={downloadCSV}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
