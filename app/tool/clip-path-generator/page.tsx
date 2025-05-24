"use client";

import ClipPathGenerator from './components/ClipPathGenerator';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ClipPathGeneratorPage() {
  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CSS Clip Path Generator</h1>
        <p className="text-muted-foreground">
          Create and customize CSS clip-path shapes with a visual editor. 
          Drag the points to modify shapes and generate CSS for polygon, circle, 
          and other clip-path shapes.
        </p>
      </div>
      
      <Separator className="mb-8" />
      
      <Card>
        <CardContent className="p-6">
          <ClipPathGenerator />
        </CardContent>
      </Card>
    </div>
  );
} 