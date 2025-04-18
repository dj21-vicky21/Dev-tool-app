"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

type EncodingType = "base64" | "url" | "html";

const encode = (text: string, type: EncodingType): string => {
  switch (type) {
    case "base64":
      return btoa(text);
    case "url":
      return encodeURIComponent(text);
    case "html":
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    default:
      return text;
  }
};

const decode = (text: string, type: EncodingType): string => {
  try {
    switch (type) {
      case "base64":
        return atob(text);
      case "url":
        return decodeURIComponent(text);
      case "html":
        const textarea = document.createElement("textarea");
        textarea.innerHTML = text;
        return textarea.value;
      default:
        return text;
    }
  } catch (error) {
    console.log("--> ~ decode ~ error:", error);
    return "Invalid input for selected encoding";
  }
};

export default function EncodeDecode() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState<EncodingType>("base64");
  const { toast } = useToast();

  const handleEncode = () => {
    setOutput(encode(input, activeTab));
  };

  const handleDecode = () => {
    setOutput(decode(input, activeTab));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    toast({
      title: "Copied!",
      description: "Output copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Convert text between different formats
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as EncodingType)}
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="base64">Base64</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
        </TabsList>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Enter text to encode or decode</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter text here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px]"
              />
              <div className="mt-4 flex space-x-2">
                <Button
                  onClick={handleEncode}
                  className="flex-1"
                  disabled={!input}
                >
                  Encode
                </Button>
                <Button
                  onClick={handleDecode}
                  variant="secondary"
                  className="flex-1"
                  disabled={!input}
                >
                  Decode
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
              <CardDescription>Encoded or decoded result</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea readOnly value={output} className="min-h-[200px]" />
              <div className="mt-4">
                <Button
                  disabled={!output}
                  onClick={copyToClipboard}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
