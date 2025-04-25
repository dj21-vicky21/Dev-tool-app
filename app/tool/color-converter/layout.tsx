import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { Loader2 } from 'lucide-react'
import './color-converter.css'

export const metadata: Metadata = {
  title: "Color Converter | DevGarage",
  description: "Convert colors between different formats (HEX, RGB, HSL)",
};

function ColorConverterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="color-converter-tool">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <p>Loading color converter...</p>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  )
}

export default ColorConverterLayout