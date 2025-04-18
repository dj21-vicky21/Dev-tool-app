"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Copy } from "lucide-react"

function decodeJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid JWT format')

    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))
    
    return { header, payload }
  } catch (error) {
    console.log("--> ~ decodeJWT ~ error:", error)
    return null
  }
}

export default function JWTDecoder() {
  const [token, setToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.1pdRnjl42BJikwi5RMOzxypJhw1dSTnqq3O004HGGpc")
  const [decodedData, setDecodedData] = useState<{ header: object; payload: object } | null>(null)
  const { toast } = useToast()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleDecode = () => {
    const decoded = decodeJWT(token)
    if (decoded) {
      setDecodedData(decoded)
    } else {
      toast({
        title: "Error",
        description: "Invalid JWT format",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "JSON copied to clipboard",
    })
  }

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.click();
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Decode and inspect JSON Web Tokens
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Enter your JWT</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your JWT here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <Button
            ref={buttonRef}
              disabled={!token}
              onClick={handleDecode}
              className="w-full mt-4"
            >
              Decode
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {decodedData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Header</CardTitle>
                  <CardDescription>JWT header information</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto">
                    <code>{JSON.stringify(decodedData.header, null, 2)}</code>
                  </pre>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => copyToClipboard(JSON.stringify(decodedData.header, null, 2))}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Header
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payload</CardTitle>
                  <CardDescription>JWT payload data</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto">
                    <code>{JSON.stringify(decodedData.payload, null, 2)}</code>
                  </pre>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => copyToClipboard(JSON.stringify(decodedData.payload, null, 2))}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Payload
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}