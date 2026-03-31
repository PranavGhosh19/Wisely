
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Globe, Loader2, Save, Check } from "lucide-react";

const CURRENCIES = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "INR", label: "Indian Rupee (₹)" },
];

function CurrencyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const isSetup = searchParams.get("setup") === "true";
  
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || "");

  useEffect(() => {
    if (user?.currency) {
      setSelectedCurrency(user.currency);
    }
  }, [user]);

  const handleUpdateCurrency = async () => {
    if (!db || !user || !selectedCurrency) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        currency: selectedCurrency
      });
      toast({
        title: isSetup ? "Setup Complete" : "Currency Updated",
        description: `Your default currency is now set to ${selectedCurrency}.`
      });
      
      if (isSetup) {
        router.replace("/dashboard");
      } else {
        router.back();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not save currency preference."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {!isSetup && <Navbar />}
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-2xl mx-auto w-full flex flex-col justify-center">
        {!isSetup && (
          <header className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-headline text-primary">Default Currency</h1>
              <p className="text-muted-foreground">Select how your amounts are displayed.</p>
            </div>
          </header>
        )}

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-card">
          <CardHeader className="text-center pt-10">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
              <Globe className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-2xl">
              {isSetup ? "Welcome to Wisely!" : "Change Currency"}
            </CardTitle>
            <CardDescription className="text-base px-6">
              {isSetup 
                ? "Let's get started by picking your preferred currency for personal and shared tracking."
                : "This updates the symbol and calculations used across all your expenses."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-3">
              <Label htmlFor="currency" className="font-bold text-sm uppercase tracking-widest text-muted-foreground px-1">
                Select Currency
              </Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger id="currency" className="h-14 rounded-2xl bg-muted/30 border-none text-lg font-medium">
                  <SelectValue placeholder="Pick a currency..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-none">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="h-12 rounded-xl">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleUpdateCurrency} 
              className="w-full bg-primary h-14 rounded-2xl font-bold text-lg gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95" 
              disabled={loading || !selectedCurrency || (!isSetup && selectedCurrency === user?.currency)}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isSetup ? (
                <>
                  Complete Setup
                  <Check className="h-6 w-6" />
                </>
              ) : (
                <>
                  Save Preference
                  <Save className="h-6 w-6" />
                </>
              )}
            </Button>
            
            {isSetup && (
              <p className="text-center text-xs text-muted-foreground font-medium italic">
                You can change this anytime in your profile settings.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function CurrencyPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-primary font-bold">Loading setup...</div>}>
      <CurrencyContent />
    </Suspense>
  );
}
