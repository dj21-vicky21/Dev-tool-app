"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Copy, Trash2, FileText, BarChart } from "lucide-react"

interface CharacterFrequency {
  char: string
  count: number
  percentage: number
}

interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  spaces: number
  specialCharacters: number
  lines: number
  paragraphs: number
  sentences: number
  averageWordLength: number
  frequentChars: CharacterFrequency[]
}

function analyzeText(text: string): TextStats {
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, "").length
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
  const spaces = text.split(" ").length - 1
  const specialCharacters = text.replace(/[a-zA-Z0-9\s]/g, "").length
  const lines = text.split(/\r\n|\r|\n/).length
  const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length
  const averageWordLength = words > 0 ? charactersNoSpaces / words : 0

  // Calculate character frequency
  const charMap = new Map<string, number>()
  const textNoSpaces = text.replace(/\s/g, "")
  
  for (const char of textNoSpaces) {
    charMap.set(char, (charMap.get(char) || 0) + 1)
  }

  const frequentChars = Array.from(charMap.entries())
    .map(([char, count]) => ({
      char,
      count,
      percentage: (count / (textNoSpaces.length || 1)) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    characters,
    charactersNoSpaces,
    words,
    spaces,
    specialCharacters,
    lines,
    paragraphs,
    sentences,
    averageWordLength,
    frequentChars
  }
}

export default function TextAnalyzer() {
  const [text, setText] = useState("")
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    spaces: 0,
    specialCharacters: 0,
    lines: 0,
    paragraphs: 0,
    sentences: 0,
    averageWordLength: 0,
    frequentChars: []
  })
  const { toast } = useToast()

  useEffect(() => {
    setStats(analyzeText(text))
  }, [text])

  const copyStats = async () => {
    const statsText = `
Text Analysis Statistics:
Characters (with spaces): ${stats.characters}
Characters (without spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Spaces: ${stats.spaces}
Special Characters: ${stats.specialCharacters}
Lines: ${stats.lines}
Paragraphs: ${stats.paragraphs}
Sentences: ${stats.sentences}
Average Word Length: ${stats.averageWordLength.toFixed(1)} characters

Most Frequent Characters:
${stats.frequentChars.map(fc => `${fc.char}: ${fc.percentage.toFixed(1)}%`).join('\n')}
    `.trim()

    await navigator.clipboard.writeText(statsText)
    toast({
      title: "Copied!",
      description: "Statistics copied to clipboard",
    })
  }

  const clearText = () => {
    setText("")
    toast({
      title: "Cleared",
      description: "Text has been cleared",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Text Analyzer</h1>
        <p className="text-muted-foreground">
          Analyze text and get detailed statistics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>Paste or type your text here</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearText}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Text
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={copyStats}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Stats
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Text Statistics
              </CardTitle>
              <CardDescription>Detailed analysis of your text</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Characters</p>
                  <p className="text-2xl font-bold">{stats.characters}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Without Spaces</p>
                  <p className="text-2xl font-bold">{stats.charactersNoSpaces}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Words</p>
                  <p className="text-2xl font-bold">{stats.words}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Spaces</p>
                  <p className="text-2xl font-bold">{stats.spaces}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Special Characters</p>
                  <p className="text-2xl font-bold">{stats.specialCharacters}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Lines</p>
                  <p className="text-2xl font-bold">{stats.lines}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Paragraphs</p>
                  <p className="text-2xl font-bold">{stats.paragraphs}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Sentences</p>
                  <p className="text-2xl font-bold">{stats.sentences}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Word Length</p>
                <p className="text-2xl font-bold">{stats.averageWordLength.toFixed(1)} characters</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Character Frequency
              </CardTitle>
              <CardDescription>Most common characters in your text</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.frequentChars.map((fc) => (
                  <div key={fc.char} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {fc.char === " " ? "Space" : fc.char}
                      </span>
                      <span className="text-muted-foreground">
                        {fc.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fc.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}