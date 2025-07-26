"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyIcon, BookOpenIcon, WandIcon, SaveIcon, RotateCcwIcon, ChevronDownIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRegexStore, type RegexPattern } from "../../../store/regex-store";

interface Match {
  text: string;
  index: number;
  length: number;
  groups?: { [key: string]: string };
}

interface RegexFlag {
  key: string;
  label: string;
  description: string;
  flag: string;
}

const REGEX_FLAGS: RegexFlag[] = [
  {
    key: "global",
    label: "Global",
    description: "Don't return after first match",
    flag: "g"
  },
  {
    key: "multiline",
    label: "Multiline",
    description: "^ and $ match start/end of line",
    flag: "m"
  },
  {
    key: "insensitive",
    label: "Case Insensitive",
    description: "Case insensitive match",
    flag: "i"
  },
  {
    key: "unicode",
    label: "Unicode",
    description: "Match with full unicode",
    flag: "u"
  },
  {
    key: "sticky",
    label: "Sticky",
    description: "Matches only from the index indicated",
    flag: "y"
  },
  {
    key: "dotAll",
    label: "Dot All",
    description: "Dot matches newline characters",
    flag: "s"
  },
  {
    key: "hasIndices",
    label: "Has Indices",
    description: "Add indices to groups",
    flag: "d"
  }
];

// Common regex patterns with explanations
const COMMON_PATTERNS: RegexPattern[] = [
  {
    name: "Email",
    pattern: "\\b[\\w\\.-]+@[\\w\\.-]+\\.\\w{2,}\\b",
    description: "Matches valid email addresses",
    example: "user@example.com"
  },
  {
    name: "URL",
    pattern: "https?:\\/\\/[\\w\\-\\.]+\\.\\w{2,}[\\/\\w\\-\\.\\?\\=\\&\\%\\#]*",
    description: "Matches HTTP/HTTPS URLs",
    example: "https://example.com"
  },
  {
    name: "Phone (US)",
    pattern: "\\b\\(?\\d{3}\\)?[-.]?\\s*\\d{3}[-.]?\\s*\\d{4}\\b",
    description: "Matches US phone numbers in various formats",
    example: "(123) 456-7890"
  },
  {
    name: "Date (MM/DD/YYYY)",
    pattern: "\\b(0?[1-9]|1[0-2])\\/(0?[1-9]|[12]\\d|3[01])\\/\\d{4}\\b",
    description: "Matches dates in MM/DD/YYYY format",
    example: "12/25/2024"
  },
  {
    name: "IP Address",
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    description: "Matches IPv4 addresses",
    example: "192.168.1.1"
  }
];

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [replaceText, setReplaceText] = useState("");
  const [replacedText, setReplacedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("test");
  const [enabledFlags, setEnabledFlags] = useState<Record<string, boolean>>({
    global: true,
    multiline: false,
    insensitive: false,
    unicode: false,
    sticky: false,
    dotAll: false,
    hasIndices: false
  });

  // Get saved patterns from Zustand store
  const { savedPatterns, addPattern } = useRegexStore();

  // Save patterns to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // localStorage.setItem('savedPatterns', JSON.stringify(savedPatterns)); // This is now handled by Zustand
    }
  }, [savedPatterns]);

  // Update flags when switches change
  useEffect(() => {
    const newFlags = REGEX_FLAGS.reduce((acc, flag) => {
      return enabledFlags[flag.key] ? acc + flag.flag : acc;
    }, "");
    setFlags(newFlags || "");
  }, [enabledFlags]);

  // Test the regex whenever pattern, flags, or test text changes
  useEffect(() => {
    if (!pattern || !testText) {
      setMatches([]);
      setError(null);
      setReplacedText(null);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const newMatches: Match[] = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regex.exec(testText)) !== null) {
          newMatches.push({
            text: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.groups
          });
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          newMatches.push({
            text: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.groups
          });
        }
      }

      setMatches(newMatches);
      setError(null);

      // Update replaced text if in replace mode
      if (activeTab === "replace") {
        const replaced = testText.replace(regex, replaceText);
        setReplacedText(replaced);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid regular expression');
      setMatches([]);
      setReplacedText(null);
    }
  }, [pattern, flags, testText, replaceText, activeTab]);

  // Function to highlight matches in the text
  const getHighlightedText = () => {
    if (!matches.length || !testText) return testText;

    const result = [];
    let lastIndex = 0;

    matches.forEach((match, idx) => {
      // Add text before the match
      result.push(testText.slice(lastIndex, match.index));
      
      // Add the highlighted match
      result.push(
        <mark 
          key={idx}
          className="bg-yellow-200 dark:bg-yellow-800"
        >
          {testText.slice(match.index, match.index + match.length)}
        </mark>
      );
      
      lastIndex = match.index + match.length;
    });

    // Add any remaining text
    result.push(testText.slice(lastIndex));

    return result;
  };

  const handleSavePattern = () => {
    if (!pattern) return;
    
    const newPattern: RegexPattern = {
      name: `Custom Pattern ${savedPatterns.length + 1}`,
      pattern,
      description: "Custom saved pattern",
      example: matches[0]?.text || ""
    };

    addPattern(newPattern);
    toast({
      title: "Pattern Saved",
      description: "Your pattern has been saved to the library"
    });
  };

  const handleLoadPattern = (patternObj: RegexPattern) => {
    setPattern(patternObj.pattern);
    setTestText(prev => prev || patternObj.example);
  };

  const handleCopyPattern = () => {
    navigator.clipboard.writeText(pattern);
    toast({
      title: "Copied!",
      description: "Pattern copied to clipboard"
    });
  };

  const handleCopyReplaced = () => {
    if (replacedText) {
      navigator.clipboard.writeText(replacedText);
      toast({
        title: "Copied!",
        description: "Replaced text copied to clipboard"
      });
    }
  };

  const handleReset = () => {
    setPattern("");
    setTestText("");
    setReplaceText("");
    setMatches([]);
    setError(null);
    setReplacedText(null);
    setEnabledFlags({
      global: true,
      multiline: false,
      insensitive: false,
      unicode: false,
      sticky: false,
      dotAll: false,
      hasIndices: false
    });
  };

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <WandIcon className="h-6 w-6" />
            Regular Expression Tester
          </CardTitle>
          <CardDescription>
            Test, validate, and experiment with regular expressions in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
            <div className="space-y-4">
              {/* Pattern Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="pattern">Regular Expression Pattern</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopyPattern}
                      disabled={!pattern}
                    >
                      <CopyIcon className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSavePattern}
                      disabled={!pattern}
                    >
                      <SaveIcon className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleReset}
                    >
                      <RotateCcwIcon className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-muted-foreground">/</span>
                  <Input
                    id="pattern"
                    placeholder="Enter your regex pattern..."
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className={error ? 'border-red-500' : ''}
                  />
                  <span className="text-muted-foreground">/{flags}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ChevronDownIcon className="h-4 w-4 mr-1" />
                        Flags
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Regular Expression Flags</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {REGEX_FLAGS.map((flag) => (
                        <DropdownMenuCheckboxItem
                          key={flag.key}
                          checked={enabledFlags[flag.key]}
                          onCheckedChange={(checked) => 
                            setEnabledFlags(prev => ({...prev, [flag.key]: checked}))
                          }
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{flag.label}</span>
                              <Badge variant="outline" className="text-xs">
                                {flag.flag}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {flag.description}
                            </span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {error && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>

              {/* Test/Replace Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="test">Test</TabsTrigger>
                  <TabsTrigger value="replace">Replace</TabsTrigger>
                </TabsList>

                <TabsContent value="test" className="mt-4">
                  <div className="space-y-4">
                    {/* Test Text Input */}
                    <div className="space-y-2">
                      <Label htmlFor="test-text">Test Text</Label>
                      <Textarea
                        id="test-text"
                        placeholder="Enter text to test against..."
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                        className="min-h-[150px] font-mono"
                      />
                    </div>

                    {/* Results Area */}
                    {(matches.length > 0 || testText) && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">Results</h3>
                            <Badge variant={matches.length > 0 ? "default" : "secondary"}>
                              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                            </Badge>
                          </div>
                        </div>

                        <Card>
                          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                            <div className="whitespace-pre-wrap font-mono">
                              {getHighlightedText()}
                            </div>
                          </ScrollArea>
                        </Card>
                      </>
                    )}
                  </div>
                </TabsContent>

                {/* Replace tab content remains the same */}
                <TabsContent value="replace" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-text">Original Text</Label>
                      <Textarea
                        id="test-text"
                        placeholder="Enter text to replace in..."
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                        className="min-h-[200px] font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="replace-text">Replacement Result</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyReplaced}
                          disabled={!replacedText}
                        >
                          <CopyIcon className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="relative">
                        <Textarea
                          id="replace-text"
                          placeholder="Enter replacement pattern..."
                          value={replaceText}
                          onChange={(e) => setReplaceText(e.target.value)}
                          className="mb-2"
                        />
                        <Card>
                          <ScrollArea className="h-[132px] w-full rounded-md border p-4">
                            <div className="whitespace-pre-wrap font-mono">
                              {replacedText || testText}
                            </div>
                          </ScrollArea>
                        </Card>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Side - Pattern Library and Match Details */}
            <div className="space-y-6">
              {/* Pattern Library */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpenIcon className="h-4 w-4" />
                    Pattern Library
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ScrollArea className="h-[200px]">
                    {COMMON_PATTERNS.concat(savedPatterns).map((p, i) => (
                      <div
                        key={i}
                        className="p-2 hover:bg-muted rounded-md cursor-pointer mb-2"
                        onClick={() => handleLoadPattern(p)}
                      >
                        <div className="font-medium text-sm">{p.name}</div>
                        <code className="text-xs text-muted-foreground">{p.pattern}</code>
                        <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Match Details */}
              {matches.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Match Details</h4>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[300px]">
                      <div className="px-3 pb-3 space-y-3">
                        {matches.map((match, index) => (
                          <div key={index} className="bg-muted/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">Match {index + 1}</Badge>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  Position: {match.index}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Length: {match.length}
                                </Badge>
                              </div>
                            </div>

                            <div className="bg-background rounded-md p-2">
                              <div className="text-xs text-muted-foreground mb-1">Matched Text:</div>
                              <code className="text-sm break-all">{match.text}</code>
                            </div>
                            
                            {match.groups && Object.keys(match.groups).length > 0 && (
                              <div className="bg-background rounded-md p-2">
                                <div className="text-xs text-muted-foreground mb-1">Groups:</div>
                                <div className="grid gap-1">
                                  {Object.entries(match.groups).map(([name, value]) => (
                                    <div key={name} className="grid grid-cols-[80px,1fr] gap-2 items-center">
                                      <code className="text-xs text-muted-foreground">{name}:</code>
                                      <code className="text-sm break-all">{value}</code>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="bg-background rounded-md p-2">
                              <div className="text-xs text-muted-foreground mb-1">Context:</div>
                              <div className="text-sm font-mono break-all">
                                {match.index > 0 && (
                                  <span className="text-muted-foreground">
                                    {testText.slice(Math.max(0, match.index - 10), match.index)}
                                  </span>
                                )}
                                <span className="bg-yellow-200 dark:bg-yellow-800 px-1">
                                  {match.text}
                                </span>
                                <span className="text-muted-foreground">
                                  {testText.slice(match.index + match.length, match.index + match.length + 10)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 