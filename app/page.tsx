"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { tools } from "../lib/tools";
import { AuroraText } from "@/components/magicui/aurora-text";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTools = tools.filter((tool) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tool.name.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="container mx-auto px-4">
      <div className="relative overflow-hidden lg:p-8 mb-3">
        
        <div className="relative z-10 text-center space-y-4">
          <div className="inline-block bg-gradient-to-r from-secondary to-secondary/30 p-2 px-4 rounded-full text-xs font-medium mb-2">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-yellow-500" />
              <span>Powerful development tools in one place</span>
            </span>
          </div>
          
          <h1 className="text-6xl font-bold tracking-tight">
            <AuroraText colors={["#ec4899", "#9333ea"]}>Devtools</AuroraText>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A collection of modern, fast, and easy-to-use development tools to streamline your workflow
          </p>
          
          <div className="mt-8 flex items-center justify-center">
            <div className="relative max-w-md w-full">
              <Input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 shadow-sm border-primary/20 focus-visible:ring-primary" 
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="h-full hover:ring-1 hover:ring-primary/20 transition-all transform hover:scale-[1.01]">

              {tool.isNew && <div className="absolute -top-1 -right-1">
                <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-medium px-3 py-1 rounded-md shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  New
                </div>
              </div>}

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
  );
}
