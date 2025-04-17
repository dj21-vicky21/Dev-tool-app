import React from 'react'
import { Metadata } from 'next' 

export const metadata: Metadata = {
  title: "Text Analyzer | Dev Tools",
  description: "Analyze text and get detailed statistics",
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout