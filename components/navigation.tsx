"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Palette, KeyRound, Lock, FileCode, FileJson, FileSpreadsheet, Moon, Sun, PenToolIcon as ToolIcon } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const tools = [
  {
    name: "Color Converter",
    href: "/tool/color-converter",
    icon: Palette
  },
  {
    name: "JWT Decoder",
    href: "/tool/jwt-decoder",
    icon: KeyRound
  },
  {
    name: "Password Generator",
    href: "/tool/password-generator",
    icon: Lock
  },
  {
    name: "Encode/Decode",
    href: "/tool/encode-decode",
    icon: FileCode
  },
  {
    name: "JSON to CSV",
    href: "/tool/json-to-csv",
    icon: FileJson
  },
  {
    name: "CSV to JSON",
    href: "/tool/csv-to-json",
    icon: FileSpreadsheet
  }
]

export function Navigation() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center px-4  mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <FileCode className="h-6 w-6" />
            <span className="font-bold">DevTools</span>
          </Link>
        </div>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <ToolIcon className="h-4 w-4" />
                <span>Tools</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {tools.map((tool) => (
                <DropdownMenuItem key={tool.href} asChild>
                  <Link href={tool.href} className="flex items-center space-x-2">
                    <tool.icon className="h-4 w-4" />
                    <span>{tool.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </div>
  )
}