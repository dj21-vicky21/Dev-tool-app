import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Template Builder | Stacktools",
  description:
    "Build responsive HTML email templates with live preview, customization, and one-click export",
};

function layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default layout;
