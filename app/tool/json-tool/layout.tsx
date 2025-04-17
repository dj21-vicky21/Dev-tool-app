import React from 'react'
import { Metadata } from 'next' 

export const metadata: Metadata = {
  title: "JSON Tool | Dev Tools",
  description: "Validate, format, and analyze JSON data",
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout