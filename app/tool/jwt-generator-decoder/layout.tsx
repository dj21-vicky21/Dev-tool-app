import React from 'react'
import { Metadata } from 'next'     

export const metadata: Metadata = {
  title: "JWT Decoder | Dev Tools",
  description: "Decode and inspect JSON Web Tokens",
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        {children}
    </div>
  )
}

export default layout