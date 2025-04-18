"use client";

import React, { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const getCurrentToolName = (path: string) => {
    // First try exact match
    const exactMatch = tools.find(tool => tool.href === path);
    if (exactMatch) return exactMatch.name;
    
    // If no exact match, try to find a tool whose path is a prefix of the current path
    const matchingTool = tools.find(tool => path.startsWith(tool.href));
    return matchingTool?.name;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-4">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle tools menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle className="text-xl">
                Dev tools
              </SheetTitle>
            </SheetHeader>
            <div className="py-6">
              <ul className="space-y-2">
                {[...tools]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((tool) => (
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
              </ul>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-2xl font-bold">
          {getCurrentToolName(pathname) || "Dev Tools"}
        </h1>
      </div>
      {children}
    </div>
  )
}