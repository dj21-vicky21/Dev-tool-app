"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Check,
  Download,
  Monitor,
  Smartphone,
  Eye,
  Code2,
  Trash2,
  Plus,
  Puzzle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  type TemplateId,
  type TemplateConfig,
  TEMPLATE_META,
  TEMPLATE_DEFAULTS,
  SHARED_DEFAULTS,
  generateTemplate,
} from "./templates";
import CustomBuilder from "./CustomBuilder";

const COLOR_PRESETS = [
  { label: "Indigo", value: "#4F46E5" },
  { label: "Blue", value: "#2563EB" },
  { label: "Emerald", value: "#059669" },
  { label: "Rose", value: "#E11D48" },
  { label: "Orange", value: "#EA580C" },
  { label: "Violet", value: "#7C3AED" },
  { label: "Teal", value: "#0D9488" },
  { label: "Slate", value: "#475569" },
];

export default function EmailTemplateBuilder() {
  const { toast } = useToast();
  const [templateId, setTemplateId] = useState<TemplateId>("welcome");
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [config, setConfig] = useState<TemplateConfig>(() => ({
    ...SHARED_DEFAULTS,
    ...TEMPLATE_DEFAULTS["welcome"],
  }));

  const switchTemplate = useCallback(
    (id: TemplateId) => {
      setTemplateId(id);
      setConfig((prev) => ({
        ...prev,
        ...TEMPLATE_DEFAULTS[id],
      }));
    },
    []
  );

  const update = useCallback(
    <K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const html = useMemo(
    () => generateTemplate(templateId, config),
    [templateId, config]
  );

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
    a.download = `${templateId}-email-template.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "HTML file saved" });
  };

  const updateInvoiceItem = (
    idx: number,
    field: "description" | "qty" | "price",
    value: string
  ) => {
    const items = [...config.invoiceItems];
    if (field === "description") {
      items[idx] = { ...items[idx], description: value };
    } else {
      items[idx] = { ...items[idx], [field]: parseFloat(value) || 0 };
    }
    update("invoiceItems", items);
  };

  const addInvoiceItem = () => {
    update("invoiceItems", [
      ...config.invoiceItems,
      { description: "New item", qty: 1, price: 0 },
    ]);
  };

  const removeInvoiceItem = (idx: number) => {
    update(
      "invoiceItems",
      config.invoiceItems.filter((_, i) => i !== idx)
    );
  };

  if (isCustomMode) {
    return <CustomBuilder onBack={() => setIsCustomMode(false)} />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* ─── Controls panel ─── */}
      <div className="xl:col-span-4 space-y-5">
        {/* Template picker */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Template Type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_META.map((t) => (
                <button
                  key={t.id}
                  onClick={() => switchTemplate(t.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    templateId === t.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.description}
                  </div>
                </button>
              ))}
              <button
                onClick={() => setIsCustomMode(true)}
                className="rounded-lg border-2 border-dashed border-primary/40 p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
              >
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Puzzle className="h-3.5 w-3.5" />
                  Custom
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Drag &amp; drop block builder
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Label className="text-sm font-medium text-muted-foreground">
              Branding
            </Label>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-xs">
                Company Name
              </Label>
              <Input
                id="companyName"
                value={config.companyName}
                onChange={(e) => update("companyName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-xs">
                Logo URL <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="logoUrl"
                value={config.logoUrl}
                onChange={(e) => update("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Primary Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => update("primaryColor", p.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      config.primaryColor === p.value
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: p.value }}
                    title={p.label}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Background</Label>
                <div className="flex gap-1.5 items-center">
                  <Input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => update("backgroundColor", e.target.value)}
                    className="w-10 h-8 p-0.5 cursor-pointer"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) => update("backgroundColor", e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Text Color</Label>
                <div className="flex gap-1.5 items-center">
                  <Input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => update("textColor", e.target.value)}
                    className="w-10 h-8 p-0.5 cursor-pointer"
                  />
                  <Input
                    value={config.textColor}
                    onChange={(e) => update("textColor", e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Label className="text-sm font-medium text-muted-foreground">
              Content
            </Label>

            <div className="space-y-2">
              <Label className="text-xs">Greeting</Label>
              <div className="grid grid-cols-5 gap-2">
                <Input
                  value={config.greetingPrefix}
                  onChange={(e) => update("greetingPrefix", e.target.value)}
                  placeholder="Hi"
                  className="col-span-2"
                />
                <Input
                  id="recipientName"
                  value={config.recipientName}
                  onChange={(e) => update("recipientName", e.target.value)}
                  placeholder="Name"
                  className="col-span-3"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Preview: &ldquo;{config.greetingPrefix} {config.recipientName},&rdquo;
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heading" className="text-xs">
                Heading
              </Label>
              <Input
                id="heading"
                value={config.heading}
                onChange={(e) => update("heading", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyText" className="text-xs">
                Body Text
              </Label>
              <textarea
                id="bodyText"
                value={config.bodyText}
                onChange={(e) => update("bodyText", e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="buttonText" className="text-xs">
                  Button Text
                </Label>
                <Input
                  id="buttonText"
                  value={config.buttonText}
                  onChange={(e) => update("buttonText", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonUrl" className="text-xs">
                  Button URL
                </Label>
                <Input
                  id="buttonUrl"
                  value={config.buttonUrl}
                  onChange={(e) => update("buttonUrl", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerText" className="text-xs">
                Footer Text
              </Label>
              <Input
                id="footerText"
                value={config.footerText}
                onChange={(e) => update("footerText", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="unsubscribeText" className="text-xs">
                  Unsubscribe Text
                </Label>
                <Input
                  id="unsubscribeText"
                  value={config.unsubscribeText}
                  onChange={(e) => update("unsubscribeText", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unsubscribeUrl" className="text-xs">
                  Unsubscribe URL
                </Label>
                <Input
                  id="unsubscribeUrl"
                  value={config.unsubscribeUrl}
                  onChange={(e) => update("unsubscribeUrl", e.target.value)}
                  placeholder="https://example.com/unsubscribe"
                />
              </div>
            </div>

            {/* Template-specific fields */}
            {templateId === "password-reset" && (
              <>
                <Separator />
                <Label className="text-xs font-medium text-muted-foreground">
                  Password Reset Options
                </Label>
                <div className="space-y-2">
                  <Label className="text-xs">Icon Emoji</Label>
                  <Input
                    value={config.iconEmoji}
                    onChange={(e) => update("iconEmoji", e.target.value)}
                    placeholder="🔒"
                    className="w-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Security Disclaimer</Label>
                  <textarea
                    value={config.securityNote}
                    onChange={(e) => update("securityNote", e.target.value)}
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </>
            )}

            {templateId === "newsletter" && (
              <>
                <Separator />
                <Label className="text-xs font-medium text-muted-foreground">
                  Newsletter Details
                </Label>
                <div className="space-y-2">
                  <Label className="text-xs">Section Label</Label>
                  <Input
                    value={config.sectionLabel}
                    onChange={(e) => update("sectionLabel", e.target.value)}
                    placeholder="Newsletter"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Feature Image Placeholder</Label>
                  <Input
                    value={config.featureImageText}
                    onChange={(e) => update("featureImageText", e.target.value)}
                    placeholder="Featured Image Area"
                  />
                </div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Featured Article
                </Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Article title"
                    value={config.articleTitle}
                    onChange={(e) => update("articleTitle", e.target.value)}
                  />
                  <textarea
                    placeholder="Article summary"
                    value={config.articleSummary}
                    onChange={(e) => update("articleSummary", e.target.value)}
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </>
            )}

            {templateId === "invoice" && (
              <>
                <Separator />
                <Label className="text-xs font-medium text-muted-foreground">
                  Invoice Details
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Invoice #</Label>
                    <Input
                      value={config.invoiceNumber}
                      onChange={(e) => update("invoiceNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input
                      value={config.invoiceDate}
                      onChange={(e) => update("invoiceDate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Item Header</Label>
                    <Input
                      value={config.invoiceItemLabel}
                      onChange={(e) =>
                        update("invoiceItemLabel", e.target.value)
                      }
                      placeholder="Item"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Qty Header</Label>
                    <Input
                      value={config.invoiceQtyLabel}
                      onChange={(e) =>
                        update("invoiceQtyLabel", e.target.value)
                      }
                      placeholder="Qty"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Amount Header</Label>
                    <Input
                      value={config.invoiceAmountLabel}
                      onChange={(e) =>
                        update("invoiceAmountLabel", e.target.value)
                      }
                      placeholder="Amount"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Currency</Label>
                    <Input
                      value={config.currencySymbol}
                      onChange={(e) =>
                        update("currencySymbol", e.target.value)
                      }
                      placeholder="$"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Total Label</Label>
                  <Input
                    value={config.invoiceTotalLabel}
                    onChange={(e) =>
                      update("invoiceTotalLabel", e.target.value)
                    }
                    placeholder="Total"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Line Items</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={addInvoiceItem}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {config.invoiceItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateInvoiceItem(idx, "description", e.target.value)
                        }
                        className="flex-1 text-xs"
                        placeholder="Item"
                      />
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          updateInvoiceItem(idx, "qty", e.target.value)
                        }
                        className="w-16 text-xs"
                        placeholder="Qty"
                      />
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateInvoiceItem(idx, "price", e.target.value)
                        }
                        className="w-20 text-xs"
                        placeholder="Price"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeInvoiceItem(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {templateId === "promotional" && (
              <>
                <Separator />
                <Label className="text-xs font-medium text-muted-foreground">
                  Promotion Details
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Discount Code</Label>
                    <Input
                      value={config.discountCode}
                      onChange={(e) => update("discountCode", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Discount Amount</Label>
                    <Input
                      value={config.discountAmount}
                      onChange={(e) => update("discountAmount", e.target.value)}
                      placeholder="e.g. 30%"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Code Label</Label>
                    <Input
                      value={config.promoPrefix}
                      onChange={(e) => update("promoPrefix", e.target.value)}
                      placeholder="Use code"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Discount Suffix</Label>
                    <Input
                      value={config.promoSuffix}
                      onChange={(e) => update("promoSuffix", e.target.value)}
                      placeholder="off"
                    />
                  </div>
                </div>
              </>
            )}

            {templateId === "notification" && (
              <>
                <Separator />
                <Label className="text-xs font-medium text-muted-foreground">
                  Notification Icon
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Icon Emoji</Label>
                    <Input
                      value={config.iconEmoji}
                      onChange={(e) => update("iconEmoji", e.target.value)}
                      placeholder="🔔"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Icon Background</Label>
                    <div className="flex gap-1.5 items-center">
                      <Input
                        type="color"
                        value={config.iconBgColor}
                        onChange={(e) => update("iconBgColor", e.target.value)}
                        className="w-10 h-8 p-0.5 cursor-pointer"
                      />
                      <Input
                        value={config.iconBgColor}
                        onChange={(e) => update("iconBgColor", e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Preview / Code panel ─── */}
      <div className="xl:col-span-8 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList>
              <TabsTrigger value="preview" className="gap-1.5">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-1.5">
                <Code2 className="h-4 w-4" />
                HTML
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {activeTab === "preview" && (
                <div className="flex border rounded-md overflow-hidden">
                  <button
                    onClick={() => setPreview("desktop")}
                    className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
                      preview === "desktop"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreview("mobile")}
                    className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
                      preview === "mobile"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </button>
                </div>
              )}
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

          <TabsContent value="preview" className="mt-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0 flex justify-center bg-muted/30">
                <div
                  className="transition-all duration-300"
                  style={{
                    width: preview === "mobile" ? "375px" : "100%",
                    maxWidth: "100%",
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    srcDoc={html}
                    title="Email Preview"
                    className="w-full border-0"
                    style={{
                      height: "680px",
                      backgroundColor: config.backgroundColor,
                    }}
                    sandbox="allow-same-origin"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
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
  );
}
