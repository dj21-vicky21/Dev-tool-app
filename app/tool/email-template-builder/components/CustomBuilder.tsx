"use client";

import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  type DragEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Check,
  Download,
  Monitor,
  Smartphone,
  Eye,
  Code2,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Heading,
  Type,
  MousePointerClick,
  ImageIcon,
  Minus,
  Space,
  PanelTop,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter,
  RemoveFormatting,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type BlockType =
  | "logo"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "divider"
  | "spacer";

interface BlockProps {
  companyName?: string;
  logoUrl?: string;
  bgColor?: string;
  text?: string;
  level?: "h1" | "h2" | "h3";
  color?: string;
  alignment?: "left" | "center" | "right";
  html?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonColor?: string;
  src?: string;
  alt?: string;
  width?: string;
  dividerColor?: string;
  height?: number;
}

interface EmailBlock {
  id: string;
  type: BlockType;
  props: BlockProps;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const BLOCK_PALETTE: {
  type: BlockType;
  label: string;
  icon: typeof Heading;
}[] = [
  { type: "logo", label: "Logo / Header", icon: PanelTop },
  { type: "heading", label: "Heading", icon: Heading },
  { type: "text", label: "Text Block", icon: Type },
  { type: "button", label: "Button", icon: MousePointerClick },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "spacer", label: "Spacer", icon: Space },
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createBlock(type: BlockType): EmailBlock {
  const defaults: Record<BlockType, BlockProps> = {
    logo: { companyName: "Acme Inc", bgColor: "#4F46E5" },
    heading: {
      text: "Your Heading",
      level: "h1",
      color: "#1F2937",
      alignment: "center",
    },
    text: {
      html: "<p>Write your content here. Use the toolbar to format text with <b>bold</b>, <i>italic</i>, and more.</p>",
      alignment: "left",
    },
    button: {
      buttonText: "Click Here",
      buttonUrl: "https://example.com",
      buttonColor: "#4F46E5",
      alignment: "center",
    },
    image: { src: "", alt: "Image description", width: "100%" },
    divider: { dividerColor: "#E5E7EB" },
    spacer: { height: 24 },
  };
  return { id: uid(), type, props: { ...defaults[type] } };
}

const DEFAULT_BLOCKS: EmailBlock[] = [
  {
    id: uid(),
    type: "logo",
    props: { companyName: "Acme Inc", bgColor: "#4F46E5" },
  },
  {
    id: uid(),
    type: "heading",
    props: {
      text: "Welcome aboard!",
      level: "h1",
      color: "#1F2937",
      alignment: "center",
    },
  },
  {
    id: uid(),
    type: "text",
    props: {
      html: "<p>We're thrilled to have you join us. Start exploring the platform and discover everything we have to offer.</p>",
      alignment: "left",
    },
  },
  {
    id: uid(),
    type: "button",
    props: {
      buttonText: "Get Started",
      buttonUrl: "https://example.com",
      buttonColor: "#4F46E5",
      alignment: "center",
    },
  },
  { id: uid(), type: "divider", props: { dividerColor: "#E5E7EB" } },
  {
    id: uid(),
    type: "text",
    props: {
      html: '<p style="font-size:12px;color:#9CA3AF;">© 2026 Acme Inc. All rights reserved.<br/><a href="#" style="color:#9CA3AF;">Unsubscribe</a></p>',
      alignment: "center",
    },
  },
];

// ─── HTML generation ────────────────────────────────────────────────────────────

function blockToHtml(block: EmailBlock): string {
  const p = block.props;
  const align = p.alignment || "center";
  const margin =
    align === "center"
      ? "0 auto"
      : align === "right"
        ? "0 0 0 auto"
        : "0";

  switch (block.type) {
    case "logo":
      return `<tr><td style="padding:30px 40px;text-align:center;background:${p.bgColor || "#4F46E5"};">${
        p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.companyName || ""}" width="140" style="display:block;margin:0 auto;" />`
          : `<span style="font-size:24px;font-weight:700;color:#ffffff;">${p.companyName || ""}</span>`
      }</td></tr>`;

    case "heading": {
      const tag = p.level || "h1";
      const sizes: Record<string, string> = {
        h1: "26px",
        h2: "22px",
        h3: "18px",
      };
      return `<tr><td style="padding:24px 40px 8px;text-align:${align};"><${tag} style="margin:0;font-size:${sizes[tag]};font-weight:700;color:${p.color || "#1F2937"};">${p.text || ""}</${tag}></td></tr>`;
    }

    case "text":
      return `<tr><td style="padding:12px 40px;font-size:15px;line-height:1.6;color:#1F2937;text-align:${align};">${p.html || ""}</td></tr>`;

    case "button":
      return `<tr><td style="padding:16px 40px;text-align:${align};"><table role="presentation" cellpadding="0" cellspacing="0" style="margin:${margin};"><tr><td style="background:${p.buttonColor || "#4F46E5"};border-radius:6px;"><a href="${p.buttonUrl || "#"}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${p.buttonText || "Button"}</a></td></tr></table></td></tr>`;

    case "image":
      return `<tr><td style="padding:16px 40px;text-align:center;">${
        p.src
          ? `<img src="${p.src}" alt="${p.alt || ""}" width="${p.width || "100%"}" style="max-width:100%;display:block;margin:0 auto;border-radius:4px;" />`
          : `<div style="background:#F3F4F6;height:180px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:14px;">Image placeholder &mdash; add a URL in block properties</div>`
      }</td></tr>`;

    case "divider":
      return `<tr><td style="padding:16px 40px;"><hr style="border:none;border-top:1px solid ${p.dividerColor || "#E5E7EB"};margin:0;" /></td></tr>`;

    case "spacer":
      return `<tr><td style="height:${p.height || 24}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;

    default:
      return "";
  }
}

function blocksToHtml(
  blocks: EmailBlock[],
  bgColor: string
): string {
  const rows = blocks.map(blockToHtml).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email</title>
</head>
<body style="margin:0;padding:0;background-color:${bgColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${bgColor};">
    <tr>
      <td align="center" style="padding:30px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
${rows}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Rich-text toolbar ──────────────────────────────────────────────────────────

const TEXT_COLORS = [
  "#000000", "#1F2937", "#991B1B", "#92400E", "#065F46",
  "#1E40AF", "#5B21B6", "#9D174D", "#DC2626", "#EA580C",
  "#059669", "#2563EB", "#7C3AED", "#E11D48", "#6B7280",
  "#9CA3AF",
];

const HIGHLIGHT_COLORS = [
  "transparent", "#FEF08A", "#FDE68A", "#FECACA", "#BBF7D0",
  "#BFDBFE", "#DDD6FE", "#FBCFE8", "#FED7AA", "#CCFBF1",
];

function ColorPickerPopover({
  colors,
  onSelect,
  label,
  children,
}: {
  colors: string[];
  onSelect: (color: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={label}
        className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors"
      >
        {children}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 w-max min-w-[196px] rounded-lg border bg-popover p-2.5 shadow-md"
          onMouseDown={(e) => e.preventDefault()}
        >
          <p className="text-[10px] font-medium text-muted-foreground mb-2 px-0.5">
            {label}
          </p>
          <div className="grid grid-cols-8 gap-1.5">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onSelect(c);
                  setOpen(false);
                }}
                className="w-5 h-5 rounded-sm border border-border/60 hover:scale-125 hover:border-foreground/40 transition-all"
                style={{
                  backgroundColor: c === "transparent" ? "#ffffff" : c,
                  backgroundImage:
                    c === "transparent"
                      ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                      : undefined,
                  backgroundSize: c === "transparent" ? "6px 6px" : undefined,
                  backgroundPosition:
                    c === "transparent"
                      ? "0 0, 0 3px, 3px -3px, -3px 0px"
                      : undefined,
                }}
                title={c === "transparent" ? "None" : c}
              />
            ))}
          </div>
          <div className="mt-2 pt-2 border-t">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-muted-foreground">
              Custom:
              <input
                type="color"
                className="w-6 h-5 p-0 border-0 rounded cursor-pointer"
                onChange={(e) => {
                  onSelect(e.target.value);
                  setOpen(false);
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function RichTextToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  const exec = useCallback((command: string, value?: string) => {
    // Selection is preserved by onMouseDown preventDefault on the toolbar.
    // Calling focus() here would reset the cursor and break list commands.
    document.execCommand(command, false, value);
  }, []);

  const handleLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const btn =
    "h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors";

  return (
    <div
      className="flex flex-wrap gap-0.5 p-1 bg-muted/60 border-b rounded-t-md"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("input[type=color]")) return;
        e.preventDefault();
      }}
    >
      <button className={btn} onClick={() => exec("bold")} title="Bold">
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button className={btn} onClick={() => exec("italic")} title="Italic">
        <Italic className="h-3.5 w-3.5" />
      </button>
      <button
        className={btn}
        onClick={() => exec("underline")}
        title="Underline"
      >
        <Underline className="h-3.5 w-3.5" />
      </button>
      <button
        className={btn}
        onClick={() => exec("strikethrough")}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>

      <div className="w-px bg-border mx-0.5" />

      <ColorPickerPopover
        colors={TEXT_COLORS}
        label="Text Color"
        onSelect={(c) => {
          exec("foreColor", c);
          requestAnimationFrame(() => editorRef.current?.focus());
        }}
      >
        <Palette className="h-3.5 w-3.5" />
      </ColorPickerPopover>

      <ColorPickerPopover
        colors={HIGHLIGHT_COLORS}
        label="Highlight Color"
        onSelect={(c) => {
          exec("hiliteColor", c === "transparent" ? "transparent" : c);
          requestAnimationFrame(() => editorRef.current?.focus());
        }}
      >
        <Highlighter className="h-3.5 w-3.5" />
      </ColorPickerPopover>

      <div className="w-px bg-border mx-0.5" />

      <button className={btn} onClick={handleLink} title="Insert Link">
        <Link className="h-3.5 w-3.5" />
      </button>

      <div className="w-px bg-border mx-0.5" />

      <button
        className={btn}
        onClick={() => exec("insertUnorderedList")}
        title="Bullet List"
      >
        <List className="h-3.5 w-3.5" />
      </button>
      <button
        className={btn}
        onClick={() => exec("insertOrderedList")}
        title="Numbered List"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </button>

      <div className="w-px bg-border mx-0.5" />

      <button
        className={btn}
        onClick={() => exec("removeFormat")}
        title="Clear Formatting"
      >
        <RemoveFormatting className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Inline rich-text editor ────────────────────────────────────────────────────

function InlineRichText({
  blockId,
  initialHtml,
  onChange,
}: {
  blockId: string;
  initialHtml: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const initialRef = useRef(initialHtml);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = initialHtml;
      initialRef.current = initialHtml;
    }
    // Only run when blockId changes (switching to a different block)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId]);

  return (
    <div className="rounded-md border overflow-hidden">
      {focused && <RichTextToolbar editorRef={ref} />}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (ref.current) onChange(ref.current.innerHTML);
        }}
        onInput={() => {
          if (ref.current) onChange(ref.current.innerHTML);
        }}
        className="min-h-[56px] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
      />
    </div>
  );
}

// ─── Alignment toggle ───────────────────────────────────────────────────────────

function AlignmentToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "left" | "center" | "right") => void;
}) {
  const opts: { v: "left" | "center" | "right"; Icon: typeof AlignLeft }[] = [
    { v: "left", Icon: AlignLeft },
    { v: "center", Icon: AlignCenter },
    { v: "right", Icon: AlignRight },
  ];
  return (
    <div className="flex border rounded-md overflow-hidden">
      {opts.map(({ v, Icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-2.5 py-1.5 transition-colors ${
            value === v
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

// ─── Block properties panel ─────────────────────────────────────────────────────

function BlockPropertiesPanel({
  block,
  onUpdate,
}: {
  block: EmailBlock;
  onUpdate: (props: Partial<BlockProps>) => void;
}) {
  const p = block.props;

  switch (block.type) {
    case "logo":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Company Name</Label>
            <Input
              value={p.companyName || ""}
              onChange={(e) => onUpdate({ companyName: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">
              Logo URL{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              value={p.logoUrl || ""}
              onChange={(e) => onUpdate({ logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Background Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={p.bgColor || "#4F46E5"}
                onChange={(e) => onUpdate({ bgColor: e.target.value })}
                className="w-10 h-8 p-0.5 cursor-pointer"
              />
              <Input
                value={p.bgColor || "#4F46E5"}
                onChange={(e) => onUpdate({ bgColor: e.target.value })}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      );

    case "heading":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Heading Text</Label>
            <Input
              value={p.text || ""}
              onChange={(e) => onUpdate({ text: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Level</Label>
            <Select
              value={p.level || "h1"}
              onValueChange={(v) =>
                onUpdate({ level: v as "h1" | "h2" | "h3" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1 — Large</SelectItem>
                <SelectItem value="h2">H2 — Medium</SelectItem>
                <SelectItem value="h3">H3 — Small</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={p.color || "#1F2937"}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-10 h-8 p-0.5 cursor-pointer"
              />
              <Input
                value={p.color || "#1F2937"}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Alignment</Label>
            <AlignmentToggle
              value={p.alignment || "center"}
              onChange={(v) => onUpdate({ alignment: v })}
            />
          </div>
        </div>
      );

    case "text":
      return (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Edit the text content directly in the canvas. Use the toolbar that
            appears when focused.
          </p>
          <div className="space-y-1">
            <Label className="text-xs">Alignment</Label>
            <AlignmentToggle
              value={p.alignment || "left"}
              onChange={(v) => onUpdate({ alignment: v })}
            />
          </div>
        </div>
      );

    case "button":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Button Text</Label>
            <Input
              value={p.buttonText || ""}
              onChange={(e) => onUpdate({ buttonText: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">URL</Label>
            <Input
              value={p.buttonUrl || ""}
              onChange={(e) => onUpdate({ buttonUrl: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Button Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={p.buttonColor || "#4F46E5"}
                onChange={(e) => onUpdate({ buttonColor: e.target.value })}
                className="w-10 h-8 p-0.5 cursor-pointer"
              />
              <Input
                value={p.buttonColor || "#4F46E5"}
                onChange={(e) => onUpdate({ buttonColor: e.target.value })}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Alignment</Label>
            <AlignmentToggle
              value={p.alignment || "center"}
              onChange={(v) => onUpdate({ alignment: v })}
            />
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Image URL</Label>
            <Input
              value={p.src || ""}
              onChange={(e) => onUpdate({ src: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Alt Text</Label>
            <Input
              value={p.alt || ""}
              onChange={(e) => onUpdate({ alt: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Width</Label>
            <Input
              value={p.width || "100%"}
              onChange={(e) => onUpdate({ width: e.target.value })}
              placeholder="100% or 400"
            />
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={p.dividerColor || "#E5E7EB"}
                onChange={(e) => onUpdate({ dividerColor: e.target.value })}
                className="w-10 h-8 p-0.5 cursor-pointer"
              />
              <Input
                value={p.dividerColor || "#E5E7EB"}
                onChange={(e) => onUpdate({ dividerColor: e.target.value })}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      );

    case "spacer":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">
              Height: {p.height || 24}px
            </Label>
            <Slider
              value={[p.height || 24]}
              min={8}
              max={80}
              step={4}
              onValueChange={(v) => onUpdate({ height: v[0] })}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ─── Block type label ───────────────────────────────────────────────────────────

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  logo: "Logo",
  heading: "Heading",
  text: "Text",
  button: "Button",
  image: "Image",
  divider: "Divider",
  spacer: "Spacer",
};

// ─── Main component ─────────────────────────────────────────────────────────────

export default function CustomBuilder({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<EmailBlock[]>(() =>
    DEFAULT_BLOCKS.map((b) => ({ ...b, id: uid() }))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("canvas");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [copied, setCopied] = useState(false);
  const [bgColor, setBgColor] = useState("#F3F4F6");

  // DnD state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedId) ?? null,
    [blocks, selectedId]
  );

  const html = useMemo(
    () => blocksToHtml(blocks, bgColor),
    [blocks, bgColor]
  );

  // ─── Block operations ───────

  const addBlock = useCallback((type: BlockType) => {
    const b = createBlock(type);
    setBlocks((prev) => [...prev, b]);
    setSelectedId(b.id);
    setActiveTab("canvas");
  }, []);

  const updateBlockProps = useCallback(
    (id: string, patch: Partial<BlockProps>) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, props: { ...b.props, ...patch } } : b
        )
      );
    },
    []
  );

  const deleteBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId]
  );

  const moveBlock = useCallback((from: number, to: number) => {
    setBlocks((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const clone: EmailBlock = {
        ...prev[idx],
        id: uid(),
        props: { ...prev[idx].props },
      };
      const arr = [...prev];
      arr.splice(idx + 1, 0, clone);
      return arr;
    });
  }, []);

  // ─── DnD handlers ───────

  const handleDragStart = (e: DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.4";
    }
  };

  const handleDragEnd = (e: DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDragIdx(null);
    setDropIdx(null);
  };

  const handleDragOver = (e: DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropIdx(idx);
  };

  const handleDrop = (e: DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      moveBlock(dragIdx, idx);
    }
    setDragIdx(null);
    setDropIdx(null);
  };

  // ─── Export ───────

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "HTML copied to clipboard" });
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom-email-template.html";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "HTML file saved" });
  };

  // ─── Render ───────

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Templates
          </Button>
          <h2 className="text-lg font-semibold">Custom Builder</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyHtml}>
            {copied ? (
              <Check className="h-4 w-4 mr-1 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            Copy HTML
          </Button>
          <Button variant="outline" size="sm" onClick={downloadHtml}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ─── Left sidebar ─── */}
        <div className="xl:col-span-4 space-y-4">
          {/* Block palette */}
          <Card>
            <CardContent className="pt-5 space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Add Block
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {BLOCK_PALETTE.map((bp) => (
                  <button
                    key={bp.type}
                    onClick={() => addBlock(bp.type)}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-border p-2.5 text-left text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <bp.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    {bp.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email background color */}
          <Card>
            <CardContent className="pt-5 space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Email Background
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-8 p-0.5 cursor-pointer"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Properties editor */}
          {selectedBlock && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {BLOCK_TYPE_LABELS[selectedBlock.type]} Properties
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    {BLOCK_TYPE_LABELS[selectedBlock.type]}
                  </Badge>
                </div>
                <BlockPropertiesPanel
                  block={selectedBlock}
                  onUpdate={(patch) =>
                    updateBlockProps(selectedBlock.id, patch)
                  }
                />
              </CardContent>
            </Card>
          )}

          {!selectedBlock && (
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground text-center py-4">
                  Click a block in the canvas to edit its properties
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── Right panel ─── */}
        <div className="xl:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <TabsList>
                <TabsTrigger value="canvas" className="gap-1.5">
                  <GripVertical className="h-4 w-4" />
                  Canvas
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1.5">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-1.5">
                  <Code2 className="h-4 w-4" />
                  HTML
                </TabsTrigger>
              </TabsList>

              {activeTab === "preview" && (
                <div className="flex border rounded-md overflow-hidden">
                  <button
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
                      previewMode === "desktop"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
                      previewMode === "mobile"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </button>
                </div>
              )}
            </div>

            {/* Canvas */}
            <TabsContent value="canvas" className="mt-0">
              <div className="space-y-2">
                {blocks.length === 0 && (
                  <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                      <p className="text-sm">
                        No blocks yet. Add blocks from the palette on the left.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={() => setSelectedId(block.id)}
                    className={`group rounded-lg border transition-all ${
                      dropIdx === idx && dragIdx !== idx
                        ? "border-primary border-dashed border-2"
                        : selectedId === block.id
                          ? "border-primary ring-1 ring-primary/30"
                          : "border-border hover:border-primary/40"
                    } ${dragIdx === idx ? "opacity-50" : ""}`}
                  >
                    {/* Block header */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium"
                      >
                        {BLOCK_TYPE_LABELS[block.type]}
                      </Badge>
                      <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateBlock(block.id);
                          }}
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(idx, idx - 1);
                          }}
                          title="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={idx === blocks.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(idx, idx + 1);
                          }}
                          title="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(block.id);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Block content */}
                    <div className="p-3">
                      <BlockCanvasContent
                        block={block}
                        onUpdate={(patch) =>
                          updateBlockProps(block.id, patch)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Preview */}
            <TabsContent value="preview" className="mt-0">
              <Card className="overflow-hidden">
                <CardContent className="p-0 flex justify-center bg-muted/30">
                  <div
                    className="transition-all duration-300"
                    style={{
                      width: previewMode === "mobile" ? "375px" : "100%",
                      maxWidth: "100%",
                    }}
                  >
                    <iframe
                      srcDoc={html}
                      title="Email Preview"
                      className="w-full border-0"
                      style={{ height: "680px", backgroundColor: bgColor }}
                      sandbox="allow-same-origin"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* HTML */}
            <TabsContent value="code" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="font-mono text-xs">
                      HTML
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {html.length.toLocaleString()} characters
                    </span>
                  </div>
                  <pre className="p-4 rounded-md bg-muted overflow-auto text-xs font-mono leading-relaxed max-h-[600px]">
                    {html}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ─── Canvas block content rendering ─────────────────────────────────────────────

function BlockCanvasContent({
  block,
  onUpdate,
}: {
  block: EmailBlock;
  onUpdate: (patch: Partial<BlockProps>) => void;
}) {
  const p = block.props;

  switch (block.type) {
    case "logo":
      return (
        <div
          className="rounded-md px-4 py-5 text-center"
          style={{ backgroundColor: p.bgColor || "#4F46E5" }}
        >
          {p.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.logoUrl}
              alt={p.companyName || ""}
              className="max-h-10 mx-auto"
            />
          ) : (
            <span className="text-lg font-bold text-white">
              {p.companyName || "Company Name"}
            </span>
          )}
        </div>
      );

    case "heading": {
      const level = p.level || "h1";
      const sizes: Record<string, string> = {
        h1: "text-2xl",
        h2: "text-xl",
        h3: "text-lg",
      };
      const cls = `font-bold ${sizes[level]}`;
      const style = { color: p.color || "#1F2937", textAlign: (p.alignment || "center") as "left" | "center" | "right" };
      const content = p.text || "Heading";
      if (level === "h2") return <h2 className={cls} style={style}>{content}</h2>;
      if (level === "h3") return <h3 className={cls} style={style}>{content}</h3>;
      return <h1 className={cls} style={style}>{content}</h1>;
    }

    case "text":
      return (
        <InlineRichText
          blockId={block.id}
          initialHtml={p.html || ""}
          onChange={(html) => onUpdate({ html })}
        />
      );

    case "button":
      return (
        <div style={{ textAlign: (p.alignment || "center") as "left" | "center" | "right" }}>
          <span
            className="inline-block rounded-md px-6 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: p.buttonColor || "#4F46E5" }}
          >
            {p.buttonText || "Button"}
          </span>
        </div>
      );

    case "image":
      return p.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.src}
          alt={p.alt || ""}
          className="max-w-full rounded mx-auto block"
          style={{ width: p.width || "100%" }}
        />
      ) : (
        <div className="bg-muted rounded-md h-32 flex items-center justify-center text-sm text-muted-foreground">
          Image placeholder — set URL in properties
        </div>
      );

    case "divider":
      return (
        <hr
          style={{
            border: "none",
            borderTop: `1px solid ${p.dividerColor || "#E5E7EB"}`,
          }}
        />
      );

    case "spacer":
      return (
        <div
          className="flex items-center justify-center text-xs text-muted-foreground"
          style={{ height: `${p.height || 24}px` }}
        >
          {p.height || 24}px
        </div>
      );

    default:
      return null;
  }
}
