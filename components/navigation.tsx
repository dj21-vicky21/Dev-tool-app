"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  PenToolIcon as ToolIcon,
  FileCode2
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {tools} from "../lib/tools"

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Check if the current route is the homepage
  const isHomePage = pathname === "/" ? true : false;

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center px-4  mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <FileCode2 className="h-6 w-6" />
            <span className="font-bold">Stackkit</span>
          </Link>
        </div>
        <div className="ml-auto flex">
          <div className={cn(isHomePage ? "hidden" : "")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ToolIcon className="h-4 w-4" />
                  <span>Tools</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className=" grid grid-cols-2 gap-2">
                {tools.slice(0, 8).map((tool) => (
                  <DropdownMenuItem key={tool.href} asChild>
                    <Link
                      href={tool.href}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
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
    </div>
  );
}
