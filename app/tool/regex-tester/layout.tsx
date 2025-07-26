import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regular Expression Tester - DevTools",
  description: "Test and validate regular expressions with real-time matching and highlighting",
  keywords: ["regex", "regular expression", "regex tester", "regex validator", "regex matcher", "developer tools"]
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
} 