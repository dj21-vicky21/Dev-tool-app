"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { v1, v3, v4, v5, v6, v7, version } from "uuid";
import { Copy, Check, RefreshCw, Info, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

// UUID namespace for v3 and v5
const NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

export default function UuidGenerator() {
  const [uuidVersion, setUuidVersion] = useState("4");
  const [quantity, setQuantity] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<Record<number, boolean>>({});
  const [allCopied, setAllCopied] = useState(false);
  const [name, setName] = useState("example.com");
  const [activeTab, setActiveTab] = useState("generate");
  const [uuidToCheck, setUuidToCheck] = useState("");
  const [checkResult, setCheckResult] = useState<{
    version: string | null;
    isValid: boolean;
  } | null>(null);

  const generateUuid = (version: string, name?: string): string => {
    switch (version) {
      case "1":
        return v1();
      case "3":
        return v3(name || "example.com", NAMESPACE);
      case "4":
        return v4();
      case "5":
        return v5(name || "example.com", NAMESPACE);
      case "6":
        return v6();
      case "7":
        return v7();
      default:
        return v4();
    }
  };

  const handleGenerate = () => {
    const newUuids = [];
    for (let i = 0; i < quantity; i++) {
      newUuids.push(generateUuid(uuidVersion, name));
    }
    setUuids(newUuids);
    setCopied({});
    setAllCopied(false);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [index]: true });
    setTimeout(() => {
      setCopied({ ...copied, [index]: false });
    }, 2000);
  };

  const copyAllToClipboard = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    setAllCopied(true);
    setTimeout(() => {
      setAllCopied(false);
    }, 2000);
  };

  const checkUuidVersion = () => {
    // Basic UUID format validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(uuidToCheck)) {
      setCheckResult({ version: null, isValid: false });
      return;
    }

    // Extract the version digit (position 14-15, index-based)
    const versionChar = version(uuidToCheck);

    if (versionChar === 1) {
      setCheckResult({ version: "1", isValid: true });
    } else if (versionChar === 3) {
      setCheckResult({ version: "3", isValid: true });
    } else if (versionChar === 4) {
      setCheckResult({ version: "4", isValid: true });
    } else if (versionChar === 5) {
      setCheckResult({ version: "5", isValid: true });
    } else if (versionChar === 6) {
      setCheckResult({ version: "6", isValid: true });
    } else if (versionChar === 7) {
      setCheckResult({ version: "7", isValid: true });
    } else if (versionChar === 8) {
      setCheckResult({ version: "8", isValid: true });
    } else {
      setCheckResult({ version: "unknown", isValid: true });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            UUID Generator
          </CardTitle>
          <CardDescription>
            Generate UUIDs in various formats for your applications
          </CardDescription>
        </CardHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full px-6"
        >
          <TabsList className="grid grid-cols-2 w-full mb-4 ">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="check">Version Check</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <CardContent className="space-y-6 p-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">UUID Version</label>
                    <Select
                      value={uuidVersion}
                      onValueChange={(value) => {
                        setUuidVersion(value);
                        setUuids([]);
                        if (value === "3" || value === "5") {
                          setQuantity(1);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          Version 1 (Time-based)
                        </SelectItem>
                        <SelectItem value="3">
                          Version 3 (MD5 namespace)
                        </SelectItem>
                        <SelectItem value="4">Version 4 (Random)</SelectItem>
                        <SelectItem value="5">
                          Version 5 (SHA-1 namespace)
                        </SelectItem>
                        <SelectItem value="6">
                          Version 6 (time-based)
                        </SelectItem>
                        <SelectItem value="7">
                          Version 7 (Unix timestamp)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {uuidVersion != "5" && uuidVersion != "3" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Quantity: {quantity}
                        </label>
                      </div>
                      <Slider
                        value={[quantity]}
                        min={1}
                        max={100}
                        step={1}
                        onValueChange={(value) => setQuantity(value[0])}
                        className="py-2"
                      />
                    </div>
                  )}
                </div>

                {(uuidVersion === "3" || uuidVersion === "5") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Name String
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Name string used to generate namespace UUIDs</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter a name string"
                    />
                  </div>
                )}

                <Button onClick={handleGenerate} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate UUIDs
                </Button>
              </div>

              {uuids.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Generated UUIDs</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAllToClipboard}
                      className="text-xs"
                    >
                      {allCopied ? (
                        <>
                          <Check className="mr-1 h-3 w-3" /> Copied All
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" /> Copy All
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border rounded-md max-h-[300px] overflow-y-auto">
                    <div className="divide-y">
                      {uuids.map((uuid, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 hover:bg-muted/50"
                        >
                          <code className="text-sm font-mono">{uuid}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(uuid, index)}
                          >
                            {copied[index] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="check">
            <CardContent className="space-y-6 p-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Enter UUID to Check
                  </label>
                  <div className="flex gap-2 sm:flex-row flex-col">
                    <Input
                      value={uuidToCheck}
                      onChange={(e) => setUuidToCheck(e.target.value)}
                      placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={checkUuidVersion}
                      disabled={uuidToCheck.length === 0}
                      className="shrink-0"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Check
                    </Button>
                  </div>
                </div>

                {checkResult && (
                  <Alert
                    className={
                      checkResult.isValid
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-red-50 border-red-200"
                    }
                  >
                    <AlertDescription>
                      {checkResult.isValid ? (
                        checkResult.version === "unknown" ? (
                          <div className="font-medium">
                            This appears to be a valid UUID, but with an
                            unrecognized version character:{" "}
                            {uuidToCheck.charAt(14)}
                          </div>
                        ) : (
                          <div className="font-medium text-emerald-700">
                            This is a valid{" "}
                            <span className="font-bold">
                              Version {checkResult.version}
                            </span>{" "}
                            UUID.
                          </div>
                        )
                      ) : (
                        <div className="font-medium text-red-700">
                          This is not a valid UUID. UUIDs must be in the format:
                          xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">UUID Format Reference</h3>
                  <div className="text-sm space-y-2 text-muted-foreground">
                    <p>
                      UUIDs follow this format:{" "}
                      <code className="bg-muted p-1 rounded">
                        xxxxxxxx-xxxx-
                        <span className="text-primary font-bold">V</span>
                        xxx-xxxx-xxxxxxxxxxxx
                      </code>
                    </p>
                    <p>
                      Where <span className="text-primary font-bold">V</span> is
                      the version number.
                    </p>
                    <p>
                      The version is encoded in the 13th character of the UUID
                      (position 14 when counting from 0).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex flex-col space-y-4 py-3">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="v1">V1</TabsTrigger>
              <TabsTrigger value="v3-v5">V3/V5</TabsTrigger>
              <TabsTrigger value="v4">V4</TabsTrigger>
              <TabsTrigger value="v6">V6</TabsTrigger>
              <TabsTrigger value="v7">V7</TabsTrigger>
            </TabsList>
            <TabsContent
              value="about"
              className="text-sm text-muted-foreground"
            >
              <p>
                UUIDs (Universally Unique Identifiers) are 128-bit identifiers
                that are unique across both space and time, with minimal
                coordination between systems generating them.
              </p>
            </TabsContent>
            <TabsContent value="v1" className="text-sm text-muted-foreground">
              <p>
                Version 1 UUIDs are generated based on timestamp and MAC
                address. They&apos;re useful when you need sortable IDs.
              </p>
            </TabsContent>
            <TabsContent
              value="v3-v5"
              className="text-sm text-muted-foreground"
            >
              <p>
                Version 3 (MD5) and Version 5 (SHA-1) UUIDs are generated from a
                namespace and a name. They produce the same UUID for the same
                inputs.
              </p>
            </TabsContent>
            <TabsContent value="v4" className="text-sm text-muted-foreground">
              <p>
                Version 4 UUIDs are generated using random numbers. They&apos;re
                the most common type and ideal for most applications requiring
                unique IDs.
              </p>
            </TabsContent>
            <TabsContent value="v6" className="text-sm text-muted-foreground">
              <p>
                Verdion 6 UUIDs is a time-based UUID, similar to v1, but it
                reorders the time-related bits to make it more sortable. It
                still uses the current timestamp as part of the UUID but aims
                for better lexicographical sorting by changing the layout of the
                time fields.
              </p>
            </TabsContent>
            <TabsContent value="v7" className="text-sm text-muted-foreground">
              <p>
                Verdion 7 UUIDs is based on Unix timestamp (milliseconds since
                January 1, 1970) and includes a random component. It is a
                time-based UUID with a focus on preserving uniqueness while
                being sorted by time. It&apos;s designed to improve upon the
                randomness and ordering of UUID v1
              </p>
            </TabsContent>
          </Tabs>
        </CardFooter>
      </Card>
    </div>
  );
}
