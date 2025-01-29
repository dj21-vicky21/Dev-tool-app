"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download } from "lucide-react";

function csvToJSON(csv: string): Record<string, string>[] {
  // Split the input CSV into lines
  const lines = csv.trim().split("\n");

  // Extract headers and clean them up (remove extra spaces and quotes)
  const headers = lines[0]
    .split(",")
    .map((header) => header.trim().replace(/^"(.*)"$/, "$1"));

  // Process each data line
  return lines
    .slice(1) // Skip the first line (headers)
    .filter((line) => line.trim()) // Remove empty lines
    .map((line) => {
      // Split line into values and clean them up
      const values = line.split(",").map((value) => {
        value = value.trim();

        // Remove surrounding quotes and handle escaped quotes
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/""/g, '"');
        }

        return value;
      });

      // Combine headers with corresponding values into an object
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || ""; // Default to empty string if no value
        return obj;
      }, {} as Record<string, string>);
    });
}

export default function CsvToJson() {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const { toast } = useToast();

  const handleConvert = () => {
    try {
      const json = csvToJSON(csvInput);
      setJsonOutput(JSON.stringify(json, null, 2));
    } catch (error) {
      console.log("--> ~ handleConvert ~ error:", error);
      toast({
        title: "Error",
        description: "Invalid CSV format",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(jsonOutput);
    toast({
      title: "Copied!",
      description: "JSON copied to clipboard",
    });
  };

  const downloadJSON = () => {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
            <CardTitle>CSV Input</CardTitle>
            <CardDescription>Enter your CSV data</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="name,age\nJohn,30\nJane,25"
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            <Button
              disabled={!csvInput}
              onClick={handleConvert}
              className="w-full mt-4"
            >
              Convert to JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JSON Output</CardTitle>
            <CardDescription>Your converted JSON data</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={jsonOutput}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!jsonOutput}
                onClick={copyToClipboard}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                disabled={!jsonOutput}
                variant="outline"
                className="flex-1"
                onClick={downloadJSON}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
