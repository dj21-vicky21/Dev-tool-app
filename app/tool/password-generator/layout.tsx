import React from 'react'
import { Metadata } from 'next' 

export const metadata: Metadata = {
  title: "Password Generator | Dev Tools",
  description: "Generate secure, random passwords",
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout