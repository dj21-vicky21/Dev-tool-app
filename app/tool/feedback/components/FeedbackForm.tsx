"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, SendIcon } from "lucide-react";
import { tools } from "@/lib/tools";
import { sendEmail } from "@/app/actions/sendmail";

export default function FeedbackForm() {
  const searchParams = useSearchParams();
  const toolParam = searchParams.get("tool");

  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("feedback");
  const [toolName, setToolName] = useState(toolParam || "general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setIsSubmitting(true);
      
      const response = await sendEmail(email, feedbackType, toolName, message);

      if (response.success) {
        // Simulate API call
        setTimeout(() => {
          setIsSubmitting(false);
          setIsSubmitted(true);

          // Reset form after 2 seconds
          setTimeout(() => {
            setEmail("");
            setFeedbackType("feedback");
            setToolName("");
            setMessage("");
            setIsSubmitted(false);
          }, 2500);
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again later.",
      });
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Feedback & Enhancement Requests
          </CardTitle>
          <CardDescription>
            Share your feedback or suggest enhancements for our development
            tools. We value your input to help us improve!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="feedbackType">Feedback Type</Label>
                  <Select value={feedbackType} onValueChange={setFeedbackType}>
                    <SelectTrigger id="feedbackType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feedback">General Feedback</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="enhancement">
                        Enhancement Suggestion
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toolName">Related Tool</Label>
                  <Select value={toolName} onValueChange={setToolName}>
                    <SelectTrigger id="toolName">
                      <SelectValue placeholder="Select a tool (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        General / All Tools
                      </SelectItem>
                      {tools?.map((tool) => (
                        <SelectItem key={tool.name} value={tool.name}>
                          {tool.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  Your Feedback <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your feedback, issue, or enhancement suggestion in detail. Include steps to reproduce if reporting a bug."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="min-h-32 max-h-52"
                />
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <SendIcon className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Thank You for Your Feedback!
              </h3>
              <p className="text-muted-foreground max-w-md">
                We appreciate your input and will use it to improve our tools.
                Your feedback has been submitted successfully.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
