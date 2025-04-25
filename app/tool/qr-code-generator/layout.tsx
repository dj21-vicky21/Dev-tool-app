import React from 'react'
import { Metadata } from 'next' 

export const metadata: Metadata = {
  title: "QR Code Generator | DevGarage",
  description: "Generate QR codes for URLs, text, or any data",
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout