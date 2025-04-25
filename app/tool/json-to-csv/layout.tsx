import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "JSON to CSV | DevGarage",
  description: "Convert JSON data to CSV format",
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout