import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Expression Visualizer | stacktools",
  description:
    "Parse and visualize cron expressions as human-readable schedules with next execution times",
};

function layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default layout;
