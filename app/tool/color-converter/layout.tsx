import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Color Converter | Dev Tools",
  description: "Convert colors between different formats (HEX, RGB, HSL)",
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout