import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "CSS Layout Generator | DevGarage",
  description:
    "Generate responsive CSS Grid and Flexbox layouts with both CSS and Tailwind code.",
};

function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default Layout; 