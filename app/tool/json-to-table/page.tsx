"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyIcon, TableIcon, FileTextIcon, TablePropertiesIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableData {
  headers: string[];
  rows: string[][];
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | { [key: string]: JsonValue } | JsonValue[];

export default function JsonToTable() {
  const [jsonInput, setJsonInput] = useState("");
  const [tableData, setTableData] = useState<TableData | null>(null);
  const { toast } = useToast();

  const parseJson = (jsonString: string): TableData | null => {
    try {
      const data = JSON.parse(jsonString);

      // Helper function to convert any value to string
      const toString = (value: JsonValue): string => {
        if (value === null) return "null";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      };

      if (Array.isArray(data)) {
        if (data.length === 0) {
          throw new Error("Empty array");
        }

        // Get all possible headers from all objects
        const headers = Array.from(
          new Set(
            data.reduce<string[]>((acc, curr) => {
              if (curr && typeof curr === "object" && !Array.isArray(curr)) {
                return [...acc, ...Object.keys(curr)];
              }
              return acc;
            }, [])
          )
        );

        // Create rows with all possible fields
        const rows = data.map((item) => {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            return headers.map((header) => toString(item[header] ?? ""));
          }
          return headers.map(() => "");
        });

        return { headers, rows };
      } else if (data && typeof data === "object" && !Array.isArray(data)) {
        const headers = Object.keys(data);
        const rows = [headers.map((header) => toString(data[header]))];
        return { headers, rows };
      } else {
        throw new Error("Invalid JSON structure. Please provide an object or array of objects.");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error parsing JSON",
          description: error.message,
          variant: "destructive",
        });
      }
      return null;
    }
  };

  const copyTableAsMarkdown = (data: TableData) => {
    const headers = `| ${data.headers.join(" | ")} |`;
    const separator = `| ${data.headers.map(() => "---").join(" | ")} |`;
    const rows = data.rows.map(row => `| ${row.join(" | ")} |`);
    
    const markdown = [headers, separator, ...rows].join("\n");
    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: "Copied!",
        description: "Table copied as Markdown",
      });
    });
  };

  const copyTableForExcel = async (data: TableData) => {
    try {
      // Create a table structure that Excel can understand
      const tableText = [
        data.headers.join("\t"),  // Tab-separated headers
        ...data.rows.map(row => row.join("\t"))  // Tab-separated rows
      ].join("\n");

      // Use the clipboard API to set both text and HTML formats
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([tableText], { type: 'text/plain' }),
        })
      ]);

      toast({
        title: "Copied!",
        description: "Table copied for Excel (use Ctrl+V or Cmd+V to paste)",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy table. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConvert = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter some JSON data",
        variant: "destructive",
      });
      return;
    }

    const result = parseJson(jsonInput);
    if (result) {
      setTableData(result);
      toast({
        title: "Success",
        description: "JSON converted to table successfully",
      });
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonInput).then(() => {
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard",
      });
    });
  };

  const handlePasteExample = () => {
    const exampleJson = JSON.stringify([
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        isActive: true
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "123-456-7890",
        isActive: false
      }
    ], null, 2);

    setJsonInput(exampleJson);
  };

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TableIcon className="h-6 w-6" />
            JSON to Table Converter
          </CardTitle>
          <CardDescription>
            Convert JSON data into a readable table format. Supports both single objects and arrays of
            objects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Textarea
                placeholder="Paste your JSON here..."
                className="min-h-[200px] font-mono"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              {jsonInput && (
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={handleCopyJson}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConvert} className="w-full md:w-auto">
                Convert to Table
              </Button>
              <Button onClick={handlePasteExample} variant="outline" className="w-full md:w-auto">
                Load Example
              </Button>
            </div>
          </div>

          {tableData && (
            <Card>
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-sm font-medium">Table Preview</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CopyIcon className="h-4 w-4 mr-2" />
                      Copy Table
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyTableForExcel(tableData)}>
                      <TablePropertiesIcon className="h-4 w-4 mr-2" />
                      Copy table
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyTableAsMarkdown(tableData)}>
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      Copy as Markdown
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableData.headers.map((header, index) => (
                        <TableHead key={index} className="min-w-[150px]">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex} className="font-mono">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 