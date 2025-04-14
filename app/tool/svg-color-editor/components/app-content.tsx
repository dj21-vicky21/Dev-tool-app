"use client";

import { useState } from 'react';
import { SVGUpload } from './svg-upload';
import { SampleSVGButton } from './sample-svg-button';
import { SVGEditor } from './svg-editor';

export default function AppContent() {
  const [svgContent, setSvgContent] = useState<string>('');

  const handleSvgLoaded = (content: string) => {
    setSvgContent(content);
  };

  return (
    <div className="space-y-6">
      {!svgContent && (
        <div className="space-y-4">
          <SVGUpload onSvgLoaded={handleSvgLoaded} />
          <div className="flex justify-center">
            <SampleSVGButton onSampleSvgLoaded={handleSvgLoaded} />
          </div>
        </div>
      )}

      {svgContent && (
        <div className="space-y-6">
          <SVGEditor svgContent={svgContent} />
          <div className="flex justify-end">
            <button
              onClick={() => setSvgContent('')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Upload a different SVG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
