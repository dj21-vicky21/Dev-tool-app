import { LucideIcon } from "lucide-react";

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type HSL = {
  h: number;
  s: number;
  l: number;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface Tool {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  isNew: boolean;
}
