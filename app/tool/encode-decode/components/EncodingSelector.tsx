"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EncodingType, encodingOptions } from "./utils";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EncodingSelectorProps {
  activeTab: EncodingType;
  setActiveTab: (tab: EncodingType) => void;
}

export function EncodingSelector({ activeTab, setActiveTab }: EncodingSelectorProps) {
  return (
    <div className="space-y-2">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as EncodingType)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 w-full md:h-11">
          {encodingOptions.slice(0, 4).map((option) => (
            <TooltipProvider key={option.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={option.id}
                    className={cn("data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1",activeTab === option.id && "bg-primary/10 text-primary")}
                  >
                    {option.name}
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] text-sm">
                  {option.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </TabsList>
        <TabsList className="grid grid-cols-4 w-full mt-2 md:h-11">
          {encodingOptions.slice(4).map((option) => (
            <TooltipProvider key={option.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={option.id}
                    className={cn("data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1",activeTab === option.id && "bg-primary/10 text-primary")}
                  >
                    {option.name}
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] text-sm">
                  {option.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
} 