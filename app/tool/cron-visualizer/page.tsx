"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  Check,
  Clock,
  CalendarDays,
  Info,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ─── Cron parsing utilities ────────────────────────────────────────────────────

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_MAP: Record<string, string> = {
  JAN: "1",  FEB: "2",  MAR: "3",  APR: "4",  MAY: "5",  JUN: "6",
  JUL: "7",  AUG: "8",  SEP: "9",  OCT: "10", NOV: "11", DEC: "12",
};

const DOW_MAP: Record<string, string> = {
  SUN: "0", MON: "1", TUE: "2", WED: "3", THU: "4", FRI: "5", SAT: "6",
};

type FieldDef = {
  name: string;
  min: number;
  max: number;
  label: string;
  aliases?: Record<string, string>;
};

const FIELDS: FieldDef[] = [
  { name: "minute", min: 0, max: 59, label: "Minute" },
  { name: "hour", min: 0, max: 23, label: "Hour" },
  { name: "dayOfMonth", min: 1, max: 31, label: "Day of Month" },
  { name: "month", min: 1, max: 12, label: "Month", aliases: MONTH_MAP },
  { name: "dayOfWeek", min: 0, max: 6, label: "Day of Week", aliases: DOW_MAP },
];

function normaliseAliases(token: string, aliases?: Record<string, string>): string {
  if (!aliases) return token;
  return token.replace(/[A-Z]{3}/gi, (m) => aliases[m.toUpperCase()] ?? m);
}

function expandField(raw: string, field: FieldDef): number[] | null {
  const token = normaliseAliases(raw.trim(), field.aliases);
  const values = new Set<number>();

  for (const part of token.split(",")) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    let range: string;
    let step = 1;

    if (stepMatch) {
      range = stepMatch[1];
      step = parseInt(stepMatch[2], 10);
      if (step < 1) return null;
    } else {
      range = part;
    }

    let start: number;
    let end: number;

    if (range === "*") {
      start = field.min;
      end = field.max;
    } else if (range.includes("-")) {
      const [a, b] = range.split("-");
      start = parseInt(a, 10);
      end = parseInt(b, 10);
      if (isNaN(start) || isNaN(end)) return null;
    } else {
      const v = parseInt(range, 10);
      if (isNaN(v)) return null;
      start = v;
      end = stepMatch ? field.max : v;
    }

    if (field.name === "dayOfWeek") {
      if (start === 7) start = 0;
      if (end === 7) end = 0;
    }

    if (start < field.min || start > field.max) return null;
    if (end < field.min || end > field.max) return null;

    if (start <= end) {
      for (let i = start; i <= end; i += step) values.add(i);
    } else {
      for (let i = start; i <= field.max; i += step) values.add(i);
      for (let i = field.min; i <= end; i += step) values.add(i);
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}

type ParsedCron = {
  minutes: number[];
  hours: number[];
  daysOfMonth: number[];
  months: number[];
  daysOfWeek: number[];
  raw: string[];
};

function parseCron(expression: string): ParsedCron | string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return `Expected 5 fields, got ${parts.length}. Format: minute hour day-of-month month day-of-week`;
  }

  const results: number[][] = [];
  for (let i = 0; i < 5; i++) {
    const expanded = expandField(parts[i], FIELDS[i]);
    if (!expanded) return `Invalid value "${parts[i]}" for ${FIELDS[i].label}`;
    results.push(expanded);
  }

  return {
    minutes: results[0],
    hours: results[1],
    daysOfMonth: results[2],
    months: results[3],
    daysOfWeek: results[4],
    raw: parts,
  };
}

// ─── Human-readable description builder ────────────────────────────────────────

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatTime12(h: number, m: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${pad2(m)} ${ampm}`;
}

function describeMinutes(raw: string, minutes: number[]): string {
  if (raw === "*") return "every minute";
  if (raw.startsWith("*/")) return `every ${raw.slice(2)} minutes`;
  if (minutes.length === 1) return `at minute ${minutes[0]}`;
  return `at minutes ${minutes.join(", ")}`;
}

function describeHours(raw: string, hours: number[]): string {
  if (raw === "*") return "";
  if (raw.startsWith("*/")) return `every ${raw.slice(2)} hours`;
  if (hours.length === 1) {
    const ampm = hours[0] >= 12 ? "PM" : "AM";
    const h12 = hours[0] % 12 || 12;
    return `at ${h12}:00 ${ampm}`;
  }
  if (raw.includes("-")) {
    const [a, b] = raw.split("-").map(Number);
    const aAmpm = a >= 12 ? "PM" : "AM";
    const bAmpm = b >= 12 ? "PM" : "AM";
    const a12 = a % 12 || 12;
    const b12 = b % 12 || 12;
    return `between ${a12}:00 ${aAmpm} and ${b12}:59 ${bAmpm}`;
  }
  return `during hours ${hours.map((h) => { const ampm = h >= 12 ? "PM" : "AM"; return `${h % 12 || 12} ${ampm}`; }).join(", ")}`;
}

function describeDaysOfMonth(raw: string, days: number[]): string {
  if (raw === "*") return "";
  if (days.length === 1) return `on day ${days[0]} of the month`;
  return `on days ${days.join(", ")} of the month`;
}

function describeMonths(raw: string, months: number[]): string {
  if (raw === "*") return "";
  if (months.length === 1) return `in ${MONTH_NAMES[months[0]]}`;
  return `in ${months.map((m) => MONTH_NAMES[m]).join(", ")}`;
}

function describeDaysOfWeek(raw: string, days: number[]): string {
  if (raw === "*") return "";
  if (days.length === 7) return "";
  if (days.length === 1) return `on ${DAY_NAMES[days[0]]}`;

  const isConsecutive =
    days.length > 1 &&
    days.every((d, i) => i === 0 || d === days[i - 1] + 1);

  if (isConsecutive) {
    return `${DAY_NAMES[days[0]]} through ${DAY_NAMES[days[days.length - 1]]}`;
  }
  return `on ${days.map((d) => DAY_NAMES[d]).join(", ")}`;
}

function buildDescription(parsed: ParsedCron): string {
  const parts = [
    describeMinutes(parsed.raw[0], parsed.minutes),
    describeHours(parsed.raw[1], parsed.hours),
    describeDaysOfMonth(parsed.raw[2], parsed.daysOfMonth),
    describeMonths(parsed.raw[3], parsed.months),
    describeDaysOfWeek(parsed.raw[4], parsed.daysOfWeek),
  ].filter(Boolean);

  const sentence = parts.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

// ─── Next execution calculator ─────────────────────────────────────────────────

function getNextExecutions(parsed: ParsedCron, count: number): Date[] {
  const results: Date[] = [];
  const now = new Date();
  const cursor = new Date(now);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const maxIterations = 525600; // 1 year of minutes
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    iterations++;
    const month = cursor.getMonth() + 1;
    const dom = cursor.getDate();
    const dow = cursor.getDay();
    const hour = cursor.getHours();
    const minute = cursor.getMinutes();

    if (
      parsed.months.includes(month) &&
      parsed.daysOfMonth.includes(dom) &&
      parsed.daysOfWeek.includes(dow) &&
      parsed.hours.includes(hour) &&
      parsed.minutes.includes(minute)
    ) {
      results.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  return results;
}

// ─── Presets ───────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  { label: "Weekdays at 8:30 AM", value: "30 8 * * 1-5" },
  { label: "Every 5 min, 10-12, Mon-Fri", value: "*/5 10-12 * * 1-5" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "1st of every month at noon", value: "0 12 1 * *" },
  { label: "Every Sunday at 3 PM", value: "0 15 * * 0" },
  { label: "Twice daily (9 AM & 5 PM)", value: "0 9,17 * * *" },
];

// ─── Field breakdown label helpers ─────────────────────────────────────────────

function fieldSummary(field: FieldDef, raw: string, values: number[]): string {
  if (raw === "*") return "every";
  if (raw.startsWith("*/")) return `every ${raw.slice(2)}`;

  if (field.name === "month") return values.map((v) => MONTH_NAMES[v]?.slice(0, 3)).join(", ");
  if (field.name === "dayOfWeek") return values.map((v) => DAY_NAMES[v]?.slice(0, 3)).join(", ");

  return values.join(", ");
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CronVisualizer() {
  const [expression, setExpression] = useState("*/5 10-12 * * 1-5");
  const [parsed, setParsed] = useState<ParsedCron | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [nextRuns, setNextRuns] = useState<Date[]>([]);
  const [copied, setCopied] = useState(false);

  const evaluate = useCallback((expr: string) => {
    const result = parseCron(expr);
    if (typeof result === "string") {
      setError(result);
      setParsed(null);
      setDescription("");
      setNextRuns([]);
    } else {
      setError(null);
      setParsed(result);
      setDescription(buildDescription(result));
      setNextRuns(getNextExecutions(result, 5));
    }
  }, []);

  useEffect(() => {
    evaluate(expression);
  }, [expression, evaluate]);

  const copyDescription = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Parse cron expressions into plain English and preview upcoming
          execution times
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Cron Expression
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-mono text-xs">
                      ┌───────────── minute (0-59)
                      <br />│ ┌───────────── hour (0-23)
                      <br />│ │ ┌───────────── day of month (1-31)
                      <br />│ │ │ ┌───────────── month (1-12)
                      <br />│ │ │ │ ┌───────────── day of week (0-6)
                      <br />* * * * *
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="*/5 10-12 * * 1-5"
              className="font-mono text-lg tracking-wider"
              spellCheck={false}
            />
          </div>

          {/* Field breakdown */}
          {parsed && (
            <div className="grid grid-cols-5 gap-2 text-center">
              {FIELDS.map((field, idx) => {
                const values = [
                  parsed.minutes,
                  parsed.hours,
                  parsed.daysOfMonth,
                  parsed.months,
                  parsed.daysOfWeek,
                ][idx];
                return (
                  <div
                    key={field.name}
                    className="rounded-lg border bg-muted/40 p-3 space-y-1"
                  >
                    <div className="font-mono text-base font-semibold">
                      {parsed.raw[idx]}
                    </div>
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      {field.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fieldSummary(field, parsed.raw[idx], values)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {parsed && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Human-Readable Schedule
                </div>
                <p className="text-xl font-semibold leading-relaxed">
                  {description}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyDescription}
                className="shrink-0 mt-4"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next executions */}
      {nextRuns.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Next {nextRuns.length} Executions
            </div>
            <div className="divide-y rounded-md border">
              {nextRuns.map((date, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="font-mono">
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Badge variant="secondary" className="font-mono">
                    {formatTime12(date.getHours(), date.getMinutes())}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Presets */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            Common Presets
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={expression === preset.value ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setExpression(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reference */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="text-sm font-medium text-muted-foreground">
            Quick Reference
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Special Characters</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    *
                  </code>{" "}
                  any value
                </div>
                <div>
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    ,
                  </code>{" "}
                  list separator (e.g. 1,3,5)
                </div>
                <div>
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    -
                  </code>{" "}
                  range (e.g. 1-5)
                </div>
                <div>
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    /
                  </code>{" "}
                  step (e.g. */5)
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Field Ranges</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>Minute: 0 – 59</div>
                <div>Hour: 0 – 23</div>
                <div>Day of Month: 1 – 31</div>
                <div>Month: 1 – 12 (or JAN–DEC)</div>
                <div>Day of Week: 0 – 6 (or SUN–SAT, 0 = Sunday)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
