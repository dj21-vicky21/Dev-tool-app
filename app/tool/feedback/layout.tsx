import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback | DevGarage",
  description: "Share your feedback or suggest enhancements for our development tools.",
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Suspense fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="sr-only">Loading...</span>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
}