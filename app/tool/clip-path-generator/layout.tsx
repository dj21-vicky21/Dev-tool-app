import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Clip Path Generator | Free Developer Tool",
  description: "Interactive CSS clip-path generator with visual editor. Create polygon, circle, ellipse and inset shapes for your web design projects.",
};

export default function ClipPathGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 