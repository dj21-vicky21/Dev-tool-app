"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Copy, FileJson, Minimize2, Maximize2, AlertCircle, FileSearch, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JsonValue } from "@/lib/types"
interface JsonAnalysis {
  keyCount: number
  arrayCount: number
  objectCount: number
  maxDepth: number
  size: {
    original: number
    minified: number
    reduction: number
  }
  isValid: boolean
  error?: string
}


function analyzeJson(json: string): JsonAnalysis {
  const analysis: JsonAnalysis = {
    keyCount: 0,
    arrayCount: 0,
    objectCount: 0,
    maxDepth: 0,
    size: {
      original: new Blob([json]).size,
      minified: 0,
      reduction: 0
    },
    isValid: true
  }

  try {
    // Try parsing the JSON to check validity
    const parsed = JSON.parse(json)
    
    // Calculate minified size
    const minified = JSON.stringify(parsed)
    analysis.size.minified = new Blob([minified]).size
    analysis.size.reduction = ((analysis.size.original - analysis.size.minified) / analysis.size.original) * 100

    // Analyze structure
    function traverse(obj: JsonValue, depth: number = 0) {
      analysis.maxDepth = Math.max(analysis.maxDepth, depth)

      if (Array.isArray(obj)) {
        analysis.arrayCount++
        obj.forEach(item => traverse(item, depth + 1))
      } else if (typeof obj === 'object' && obj !== null) {
        analysis.objectCount++
        analysis.keyCount += Object.keys(obj).length
        Object.values(obj).forEach(value => traverse(value, depth + 1))
      }
    }

    traverse(parsed)
  } catch (error) {
    analysis.isValid = false
    analysis.error = error instanceof Error ? error.message : 'Invalid JSON'
  }

  return analysis
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function JsonTools() {
  const [input, setInput] = useState("")
  const [isCompact, setIsCompact] = useState(false)
  const [analysis, setAnalysis] = useState<JsonAnalysis>({
    keyCount: 0,
    arrayCount: 0,
    objectCount: 0,
    maxDepth: 0,
    size: {
      original: 0,
      minified: 0,
      reduction: 0
    },
    isValid: true
  })
  const { toast } = useToast()

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (input.trim()) {
        setAnalysis(analyzeJson(input))
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [input])

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, isCompact ? 0 : 2)
      setInput(formatted)
      toast({
        title: "Success",
        description: "JSON formatted successfully",
      })
    } catch (error) {
      console.log("--> ~ formatJson ~ error:", error)
      toast({
        title: "Error",
        description: "Invalid JSON",
        variant: "destructive",
      })
    }
  }

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed))
      setIsCompact(true)
      toast({
        title: "Success",
        description: "JSON minified successfully",
      })
    } catch (error) {
      console.log("--> ~ minifyJson ~ error:", error)
      toast({
        title: "Error",
        description: "Invalid JSON",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(input)
    toast({
      title: "Copied!",
      description: "JSON copied to clipboard",
    })
  }

  const downloadJson = () => {
    const blob = new Blob([input], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JSON Tools</h1>
        <p className="text-muted-foreground">
          Validate, format, and analyze JSON data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              JSON Input
            </CardTitle>
            <CardDescription>Enter or paste your JSON</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder='{"example": "Enter your JSON here"}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!input.trim()}
                variant="outline"
                onClick={() => {
                  setIsCompact(!isCompact)
                  formatJson()
                }}
              >
                {isCompact ? <Maximize2 className="mr-2 h-4 w-4" /> : <Minimize2 className="mr-2 h-4 w-4" />}
                {isCompact ? "Prettify" : "Compact"}
              </Button>
              <Button
                disabled={!input.trim()}
                variant="outline"
                onClick={minifyJson}
              >
                <Minimize2 className="mr-2 h-4 w-4" />
                Minify
              </Button>
              <Button
                disabled={!input.trim()}
                variant="outline"
                onClick={copyToClipboard}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                disabled={!input.trim()}
                variant="outline"
                onClick={downloadJson}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Validation
              </CardTitle>
              <CardDescription>JSON validation status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${
                analysis.isValid 
                  ? "bg-green-500/10 text-green-500" 
                  : "bg-red-500/10 text-red-500"
              }`}>
                <p className="font-medium">
                  {analysis.isValid 
                    ? "✓ Valid JSON" 
                    : `✗ Invalid JSON: ${analysis.error}`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5" />
                Analysis
              </CardTitle>
              <CardDescription>JSON structure analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="structure">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="size">Size</TabsTrigger>
                </TabsList>
                <TabsContent value="structure" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Keys</p>
                      <p className="text-2xl font-bold">{analysis.keyCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Objects</p>
                      <p className="text-2xl font-bold">{analysis.objectCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Arrays</p>
                      <p className="text-2xl font-bold">{analysis.arrayCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Max Depth</p>
                      <p className="text-2xl font-bold">{analysis.maxDepth}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="size" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Original Size</p>
                      <p className="text-2xl font-bold">{formatBytes(analysis.size.original)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Minified Size</p>
                      <p className="text-2xl font-bold">{formatBytes(analysis.size.minified)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Size Reduction</p>
                      <p className="text-2xl font-bold">{analysis.size.reduction.toFixed(1)}%</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}