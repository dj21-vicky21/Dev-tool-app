import { Palette, KeyRound, Lock, FileCode, FileJson, FileSpreadsheet, QrCode, Text, Code2, Edit2, Paintbrush, Layers, Ruler } from "lucide-react"
import { Tool } from "./types"

export const tools: Tool[] = [
  {
    name: "Color Converter",
    description: "Convert colors between different formats (HEX, RGB, HSL)",
    href: "/tool/color-converter",
    icon: Palette,
    isNew: false
  },
  {
    name: "JWT Generator - Decoder",
    description: "Generate and decode JSON Web Tokens",
    href: "/tool/jwt-generator-decoder",
    icon: KeyRound,
    isNew: false
  },
  {
    name: "Password Generator",
    description: "Generate secure, customizable passwords",
    href: "/tool/password-generator",
    icon: Lock,
    isNew: false
  },
  {
    name: "Encode/Decode",
    description: "Encode and decode strings using various methods",
    href: "/tool/encode-decode",
    icon: FileCode,
    isNew: false
  },
  {
    name: "JSON to CSV",
    description: "Convert JSON data to CSV format",
    href: "/tool/json-to-csv",
    icon: FileJson,
    isNew: false
  },
  {
    name: "CSV to JSON",
    description: "Convert CSV data to JSON format",
    href: "/tool/csv-to-json",
    icon: FileSpreadsheet,
    isNew: false
  },
  {
    name: "UUID Generator",
    description: "Generate unique UUIDs/GUIDs with custom formats",
    href: "/tool/uuid-generator",
    icon: FileSpreadsheet,
    isNew: false
  },
  {
    name: "QR Code Generator",
    description: "Generate unique QR codes for URLs, text, or custom data",
    href: "/tool/qr-code-generator",
    icon: QrCode,
    isNew: false
  },
  {
    name: "Text Analyser",
    description: "Analyze and extract insights from text data efficiently",
    href: "/tool/text-analyzer",
    icon: Text,
    isNew: false
  },
  {
    name: "JSON Tool",
    description: "Format, validate, and analyze JSON data",
    href: "/tool/json-tool",
    icon: Code2,
    isNew: false
  },
  {
    name: "SVG Color Editor",
    description: "Edit SVG colors interactively",
    href: "/tool/svg-color-editor",
    icon: Edit2,
    isNew: true
  },
  {
    name: "Gradient Generator",
    description: "Generate CSS gradients with ease",
    href: "/tool/gradient-generator",
    icon: Paintbrush,
    isNew: true
  },
  {
    name: "Glassmorphism Generator",
    description: "Create beautiful glass effect UI in CSS and Tailwind",
    href: "/tool/glassmorphism",
    icon: Layers,
    isNew: true
  },
  {
    name: "CSS Unit Converter",
    description: "Convert between different CSS units like px, em, rem, vh, vw, and more",
    href: "/tool/css-unit-converter",
    icon: Ruler,
    isNew: true
  }
]