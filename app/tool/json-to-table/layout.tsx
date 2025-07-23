import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Table Converter - DevTools",
  description: "Convert JSON data into a readable table format. Support for objects and arrays.",
  keywords: ["json", "table", "converter", "json to table", "data conversion", "developer tools"]
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
} 