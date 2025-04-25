import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Glassmorphism Generator | DevGarage',
  description: 'Generate glassmorphism effects for your website',
}

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
       {children}
    </div>
  )
}

export default layout