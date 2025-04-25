import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Encode/Decode | DevGarage",
  description: "Encode and decode text between different formats",
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout