import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  className?: string;
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  href,
  className,
}: ToolCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 tool-card-hover", className)}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mb-1 font-medium leading-none tracking-tight">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <Button asChild className="w-full" size="sm">
        <Link href={href}>Open {title}</Link>
      </Button>
    </div>
  );
} 