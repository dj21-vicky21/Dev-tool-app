import { Metadata } from "next";
import GradientGenerator from "./components/GradientGenerator";

export const metadata: Metadata = {
  title: "Gradient Generator | Dev Tools",
  description: "Create beautiful gradients with our interactive gradient generator tool.",
};

export default function GradientGeneratorPage() {
  return (
    <div className="container mx-auto">
      <div>
        <p className="text-muted-foreground">Convert CSV data to JSON format</p>
      </div>
      
      <GradientGenerator />
    </div>
  );
} 