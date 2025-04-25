import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "CSV to JSON | DevGarage",
  description: "Convert CSV data to JSON format",
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout