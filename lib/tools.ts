import { Palette, KeyRound, Lock, FileCode, FileJson, FileSpreadsheet, QrCode, Text, Code2, Edit2 } from "lucide-react"

export const tools = [
  {
    name: "Color Converter",
    description: "Convert colors between different formats (HEX, RGB, HSL)",
    href: "/tool/color-converter",
    icon: Palette
  },
  {
    name: "JWT Decoder",
    description: "Decode and verify JSON Web Tokens",
    href: "/tool/jwt-decoder",
    icon: KeyRound
  },
  {
    name: "Password Generator",
    description: "Generate secure, customizable passwords",
    href: "/tool/password-generator",
    icon: Lock
  },
  {
    name: "Encode/Decode",
    description: "Encode and decode strings using various methods",
    href: "/tool/encode-decode",
    icon: FileCode
  },
  {
    name: "JSON to CSV",
    description: "Convert JSON data to CSV format",
    href: "/tool/json-to-csv",
    icon: FileJson
  },
  {
    name: "CSV to JSON",
    description: "Convert CSV data to JSON format",
    href: "/tool/csv-to-json",
    icon: FileSpreadsheet
  },
  {
    name: "UUID Generator",
    description: "Generate unique UUIDs/GUIDs with custom formats",
    href: "/tool/uuid-generator",
    icon: FileSpreadsheet
  },
  {
    name: "QR Code Generator",
    description: "Generate unique QR codes for URLs, text, or custom data",
    href: "/tool/qr-code-generator",
    icon: QrCode
  },
  {
    name: "Text Analyser",
    description: "Analyze and extract insights from text data efficiently",
    href: "/tool/text-analyzer",
    icon: Text
  },
  {
    name: "JSON Tool",
    description: "Format, validate, and analyze JSON data",
    href: "/tool/json-tool",
    icon: Code2
  },
  {
    name: "SVG Color Editor",
    description: "Edit SVG colors interactively",
    href: "/tool/svg-color-editor",
    icon: Edit2
  }
]