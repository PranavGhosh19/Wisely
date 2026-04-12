
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { ArrowLeft, MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function FeedbackPage() {
  const router = useRouter();
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) router.push("/auth");
  }, [user, router]);

  if (!mounted || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !db) return;

    setIsSubmitting(true);
    try {
      const feedbackId = `fb-${Date.now()}-${user.uid.slice(0, 5)}`;
      const feedbackRef = doc(db, "feedback", feedbackId);
      
      const feedbackData = {
        id: feedbackId,
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        message: message.trim(),
        createdAt: Date.now()
      };

      setDocumentNonBlocking(feedbackRef, feedbackData, { merge: true });
      
      setIsSubmitted(true);
      toast({
        title: "Feedback Received",
        description: "Thank you for helping us make Wisely better!"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send feedback. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row bg-background">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <Card className="max-w-md w-full border-none shadow-xl text-center p-10 rounded-3xl">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold font-headline text-primary mb-2">
              Thank you so much, {user.name.split(" ")[0]}.
            </h2>
            <p className="text-muted-foreground mb-8">
              This helps us a lot!
            </p>
            <Button onClick={() => router.push("/profile")} className="w-full h-12 rounded-2xl font-bold">
              Back to Settings
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-2xl mx-auto w-full">
        <header className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 -ml-2 text-muted-foreground hover:text-primary gap-2 px-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold font-headline text-primary tracking-tight">Give Feedback</h1>
          <p className="text-muted-foreground">Share your thoughts, report issues, or suggest new features.</p>
        </header>

        <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 py-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline">What's on your mind?</CardTitle>
                <CardDescription>Your input directly shapes the future of Wisely.</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 pt-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Your Message
                  </Label>
                  <Textarea 
                    id="feedback-message"
                    placeholder="Tell us what you like, what's broken, or what we should add next..."
                    className="min-h-[200px] rounded-2xl bg-muted/20 border-none focus-visible:ring-2 focus-visible:ring-primary p-4 text-base leading-relaxed"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium italic px-1">
                  By submitting, you agree that we can use your feedback to improve Wisely. Your identity is shared with us so we can follow up if needed.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="p-6 bg-muted/10 border-t flex flex-col sm:flex-row gap-4">
              <div className="flex-1"></div>
              <Button 
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full sm:w-auto min-w-[180px] h-14 rounded-2xl font-bold text-lg bg-primary shadow-xl shadow-primary/20 transition-all active:scale-95 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Submit Feedback
                    <Send className="h-5 w-5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
