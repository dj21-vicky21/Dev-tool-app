"use client"

import JWTDecoderComponent from "./components/JWTDecoder"

export default function JWTDecoder() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Decode, verify, and generate JSON Web Tokens
        </p>
      </div>

      <JWTDecoderComponent />
    </div>
  )
}