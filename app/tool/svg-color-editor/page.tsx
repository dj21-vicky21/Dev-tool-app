import AppContent from "./components/app-content";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">SVG Color Editor</h1>
      <p className="text-muted-foreground mb-8">
        Upload an SVG file, select elements, and modify their colors using the color palette.
      </p>
      <AppContent />
    </main>
  );
}
