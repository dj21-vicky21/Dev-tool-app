"use client";

import { useRef, useState } from "react";
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
export default function FeedbackForm() {
  const searchParams = useSearchParams();
  const toolParam = searchParams.get("tool");

  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("feedback");
  const [toolName, setToolName] = useState(toolParam || "general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);

  const resetForm = () => {
    setEmail("");
    setFeedbackType("feedback");
    setToolName(toolParam || "general");
    setMessage("");
    formRef.current?.reset();
    setTimeout(() => {
      setIsSubmitted(false)
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const accessKey = process.env.NEXT_PUBLIC_WEB3FORM;
      if (!accessKey) {
        throw new Error("Web3Forms access key is not configured.");
      }

      const payload = {
        access_key: accessKey,
        email,
        feedbackType,
        toolName,
        message,
        site: "Stacktools",
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        resetForm();
        setIsSubmitted(true);
      } else {
        throw new Error(result.message || "Form submission failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit feedback. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
      });
      console.error("Error submitting feedback:", error);
    } finally {
      setLoading(false);
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
          {isSubmitted ? (
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
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="email"
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="feedbackType">Feedback Type</Label>
                  <Select 
                    value={feedbackType} 
                    name="feedbackType" 
                    onValueChange={setFeedbackType}
                    disabled={loading}
                  >
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
                  <Select 
                    value={toolName} 
                    name="toolName" 
                    onValueChange={setToolName}
                    disabled={loading}
                  >
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
                  name="message"
                  placeholder="Please describe your feedback, issue, or enhancement suggestion in detail. Include steps to reproduce if reporting a bug."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="min-h-32 max-h-52"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <SendIcon className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
