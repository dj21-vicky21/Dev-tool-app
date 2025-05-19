import LayoutGenerator from "./components/LayoutGenerator";

export default function LayoutGeneratorPage() {
  return (
    <div className="container mx-auto">
      <div>
        <p className="text-muted-foreground mb-6">
          Create responsive CSS Grid and Flexbox layouts and export the code in both CSS and Tailwind formats.
        </p>
      </div>
      
      <LayoutGenerator />
    </div>
  );
} 