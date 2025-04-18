import UnitConverter from "./components/UnitConverter";

export default function CssUnitConverterPage() {
  return (
    <div className="container mx-auto">
      <div>
        <p className="text-muted-foreground mb-6">
          Convert between different CSS units like pixels, ems, rems, viewport units, and more
        </p>
      </div>
      
      <UnitConverter />
    </div>
  );
} 