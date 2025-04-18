import AppContent from "./components/app-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SVG Color Editor | Dev Tools",
  description: "Edit SVG colors with ease",
};

export default function Home() {
  return (
    <main className="container mx-auto">
      {/* <h1 className="text-3xl font-bold mb-6">SVG Color Editor <Badge variant="outline">Beta</Badge></h1> */}
      <p className="text-muted-foreground mb-8">
        Upload an SVG file, select elements, and modify their colors using the color palette.
      </p>
      <AppContent />
    </main>
  );
}
