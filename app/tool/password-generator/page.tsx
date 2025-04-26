"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Copy, RefreshCw } from "lucide-react"

function generatePassword(
  length: number,
  useUppercase: boolean,
  useLowercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean
): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  let chars = ""
  if (useUppercase) chars += uppercase
  if (useLowercase) chars += lowercase
  if (useNumbers) chars += numbers
  if (useSymbols) chars += symbols

  if (chars === "") chars = lowercase

  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return password
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(12)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [password, setPassword] = useState("")
  const { toast } = useToast()

  const handleGenerate = () => {
    const newPassword = generatePassword(
      length,
      useUppercase,
      useLowercase,
      useNumbers,
      useSymbols
    )
    setPassword(newPassword)
  }

  const copyToClipboard = async () => {
    if (password) {
      await navigator.clipboard.writeText(password)
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Generate secure, random passwords
        </p>
      </div>

      <Card>
        <CardContent className="py-6 px-3">
          <div className="flex gap-2">
            <Input
              readOnly
              value={password}
              className="font-mono"
              placeholder="Click generate to create a password"
            />
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleGenerate}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
          <CardDescription>Customize your password settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Password Length: {length}</label>
            </div>
            <Slider
              value={[length]}
              onValueChange={(value) => setLength(value[0])}
              min={3}
              max={32}
              step={1}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Uppercase Letters</label>
              <Switch
                checked={useUppercase}
                onCheckedChange={setUseUppercase}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Lowercase Letters</label>
              <Switch
                checked={useLowercase}
                onCheckedChange={setUseLowercase}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Numbers</label>
              <Switch
                checked={useNumbers}
                onCheckedChange={setUseNumbers}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Symbols</label>
              <Switch
                checked={useSymbols}
                onCheckedChange={setUseSymbols}
              />
            </div>
          </div>

          <Button className="w-full" onClick={handleGenerate}>
            Generate Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}