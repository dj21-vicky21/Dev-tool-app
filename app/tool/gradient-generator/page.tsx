import { Metadata } from "next";
import GradientGenerator from "./components/GradientGenerator";

export const metadata: Metadata = {
  title: "Gradient Generator | Dev Tools",
  description: "Create beautiful gradients with our interactive gradient generator tool.",
};

export default function GradientGeneratorPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Gradient Maker</h1>
        <p className="text-muted-foreground mt-2">
          Create and export beautiful gradients.
        </p>
      </div>
      
      <GradientGenerator />
    </div>
  );
} 