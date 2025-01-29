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

function jsonToCSV(json: string[]): string {
  if (!Array.isArray(json) || !json.length) return "";

  const headers = Object.keys(json[0]);
  const rows = json.map((obj) =>
    headers
      .map((header: any) => {
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
  const { toast } = useToast();

  const handleConvert = () => {
    try {
      const jsonData = JSON.parse(jsonInput);
      if (!Array.isArray(jsonData)) {
        throw new Error("Input must be an array of objects");
      }
      const csv = jsonToCSV(jsonData);
      setCsvOutput(csv);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Invalid JSON input",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(csvOutput);
    toast({
      title: "Copied!",
      description: "CSV copied to clipboard",
    });
  };

  const downloadCSV = () => {
    const blob = new Blob([csvOutput], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
            <CardTitle>JSON Input</CardTitle>
            <CardDescription>Enter your JSON array</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            <Button
              disabled={!jsonInput}
              onClick={handleConvert}
              className="w-full mt-4"
            >
              Convert to CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Output</CardTitle>
            <CardDescription>Your converted CSV data</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={csvOutput}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!csvOutput}
                onClick={copyToClipboard}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                disabled={!csvOutput}
                variant="outline"
                className="flex-1"
                onClick={downloadCSV}
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
