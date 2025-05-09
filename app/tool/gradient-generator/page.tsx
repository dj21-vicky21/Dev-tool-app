import { Metadata } from "next";
import GradientGenerator from "./components/GradientGenerator";

export const metadata: Metadata = {
  title: "Gradient Generator | DevGarage",
  description: "Create beautiful CSS gradients with our interactive gradient generator tool.",
};

export default function GradientGeneratorPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <p className="text-muted-foreground">Create beautiful CSS gradients with our interactive gradient generator tool</p>
      </div>
      
      <GradientGenerator />
    </div>
  );
} 