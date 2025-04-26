"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, History, ClipboardEdit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HistoryItem, clearHistory, getHistory, EncodingType } from "./utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface HistorySectionProps {
  setInput: (input: string) => void;
  setActiveTab: (tab: EncodingType) => void;
}

export function HistorySection({ setInput, setActiveTab }: HistorySectionProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const loadHistory = () => {
    const items = getHistory();
    setHistory(items);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    toast({
      title: "History cleared",
      description: "Your operation history has been cleared",
    });
  };

  const handleUseHistoryItem = (item: HistoryItem) => {
    setInput(item.output);
    setActiveTab(item.encodingType);
    setOpen(false);
    toast({
      title: "Loaded from history",
      description: `Set input to ${item.operation === "encode" ? "encoded" : "decoded"} result`,
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatContent = (content: string) => {
    if (content.length <= 30) return content;
    return `${content.substring(0, 30)}...`;
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (newOpen) loadHistory();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-1.5" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Operation History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {history.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No history found. Your recent operations will appear here.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleUseHistoryItem(item)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.operation === "encode" ? "default" : "secondary"}>
                        {item.operation}
                      </Badge>
                      <Badge variant="outline">{item.encodingType}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="text-sm overflow-hidden text-ellipsis">
                      <span className="text-muted-foreground mr-1">Input:</span>
                      {formatContent(item.input)}
                    </div>
                    <div className="text-sm overflow-hidden text-ellipsis">
                      <span className="text-muted-foreground mr-1">Output:</span>
                      {formatContent(item.output)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="flex justify-between items-center border-t pt-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearHistory}
            disabled={history.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clear History
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" size="sm">
              <ClipboardEdit className="h-4 w-4 mr-1.5" />
              Back to Editor
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 