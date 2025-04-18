import { Metadata } from "next";
import FeedbackForm from "./components/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback | Dev Tools",
  description: "Share your feedback or suggest enhancements for our development tools.",
};

export default function FeedbackPage() {
  return <FeedbackForm />;
} 