import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "UUID Generator | Dev Tools",
  description: "Generate UUIDs in various formats",
};  

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout