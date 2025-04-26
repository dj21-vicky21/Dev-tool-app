import { Metadata } from "next";
import ShadowGenerator from "./components/ShadowGenerator";

export const metadata: Metadata = {
  title: "Shadow Generator | DevGarage",
  description: "Create beautiful CSS box and text shadows with our interactive shadow generator tool.",
};

export default function ShadowGeneratorPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <p className="text-muted-foreground">Create beautiful CSS box and text shadows with our interactive shadow generator tool</p>
      </div>
      
      <ShadowGenerator />
    </div>
  );
} 