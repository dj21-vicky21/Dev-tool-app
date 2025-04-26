"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, MessageSquare, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools";
import { Input } from "@/components/ui/input";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const getCurrentToolName = (path: string) => {
    // First try exact match
    const exactMatch = tools.find((tool) => tool.href === path);
    if (exactMatch) return exactMatch.name;

    // If no exact match, try to find a tool whose path is a prefix of the current path
    const matchingTool = tools.find((tool) => path.startsWith(tool.href));
    return matchingTool?.name;
  };

  const filteredTools = [...tools]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((tool) => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6 w-full justify-between">
        <div className="flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-4">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle tools menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-xl">Tools</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                      onClick={() => setSearchQuery("")}
                    >
                      <span className="sr-only">Clear search</span>
                      <span aria-hidden="true">×</span>
                    </Button>
                  )}
                </div>
                <div className="h-[calc(100vh-160px)] overflow-y-auto pr-2">
                  <ul className="space-y-2">
                    {filteredTools.map((tool) => (
                      <li key={tool.href}>
                        <Link
                          href={tool.href}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                            pathname === tool.href
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                          onClick={() => setOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            {tool.name}
                            {tool.isNew && (
                              <div className="inline-flex ml-2">
                                <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow-sm">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                  </span>
                                  New
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                    
                    {filteredTools.length === 0 && (
                      <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No tools found matching &ldquo;{searchQuery}&rdquo;
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-2xl font-bold">
            {getCurrentToolName(pathname) || "Tools"}
          </h1>
        </div>
        {!pathname.includes('/feedback') && (
          <div>
            <Link
              href={`/tool/feedback?tool=${
                getCurrentToolName(pathname) || "general"
              }`}
            >
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Feedback
              </Button>
            </Link>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
