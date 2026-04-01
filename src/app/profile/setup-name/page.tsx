
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { User as UserIcon, Loader2, ArrowRight } from "lucide-react";

function SetupNameContent() {
  const router = useRouter();
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !name.trim()) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim()
      });
      toast({
        title: "Name Saved",
        description: "Now, let's pick your default currency."
      });
      router.push("/profile/currency?setup=true");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not save your name."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="w-full max-w-md">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-card">
          <CardHeader className="text-center pt-10">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
              <UserIcon className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-xl">What's your name?</CardTitle>
            <CardDescription className="text-sm px-6">
              Please enter your full name so your friends can identify you in shared groups.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleUpdateName} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="font-bold text-sm uppercase tracking-widest text-muted-foreground px-1">
                  Full Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="name"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-14 pl-12 rounded-2xl bg-muted/30 border-none text-base font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full bg-primary h-14 rounded-2xl font-bold text-base gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95" 
                disabled={loading || !name.trim()}
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-6 w-6" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function SetupNamePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-primary font-bold">Preparing setup...</div>}>
      <SetupNameContent />
    </Suspense>
  );
}
