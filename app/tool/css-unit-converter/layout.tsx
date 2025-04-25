import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "CSS Unit Converter | DevGarage",
  description:
    "Convert between different CSS units like px, em, rem, vh, vw, and more.",
};

function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default Layout;
