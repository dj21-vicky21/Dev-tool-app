"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {tools} from "../lib/tools"


export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTools = tools.filter((tool) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      tool.name.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower)
    )
  })
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Frontend DevTools Suite</h1>
        <p className="text-lg text-muted-foreground mt-2">
          A collection of modern, fast, and easy-to-use development tools
        </p>
      </div>

      <div className="mb-6 flex items-center justify-center">
        <div className="relative">
        <Input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-lg pl-10"  // Add padding to the left for the icon
        />
        {/* Search icon */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="h-full hover:ring-1 hover:ring-primary/20 transition-all transform hover:scale-[1.01]">
            <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{tool.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}