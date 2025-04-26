import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Encode/Decode Tool | DevGarage",
  description: "Convert text between various formats including Base64, URL, HTML, Hex, Binary, Morse code, ROT13, and Unicode.",
  keywords: "encode, decode, base64, url encoding, html entities, hexadecimal, binary, morse code, rot13, unicode, text conversion",
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout