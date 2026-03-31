
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Globe, Loader2, Save } from "lucide-react";

const CURRENCIES = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "INR", label: "Indian Rupee (₹)" },
];

export default function CurrencyPage() {
  const router = useRouter();
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || "USD");

  useEffect(() => {
    if (user?.currency) {
      setSelectedCurrency(user.currency);
    }
  }, [user]);

  const handleUpdateCurrency = async () => {
    if (!db || !user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        currency: selectedCurrency
      });
      toast({
        title: "Currency Updated",
        description: `Your default currency is now set to ${selectedCurrency}.`
      });
      router.back();
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
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-2xl mx-auto w-full">
        <header className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-headline text-primary">Default Currency</h1>
            <p className="text-muted-foreground">Select how your amounts are displayed.</p>
          </div>
        </header>

        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader>
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <Globe className="h-6 w-6" />
            </div>
            <CardTitle className="font-headline text-xl text-center">Change Currency</CardTitle>
            <CardDescription className="text-center">
              This will update the currency symbol and preferences used throughout your personal and group expenses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency" className="font-bold">Active Currency</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger id="currency" className="h-12 rounded-xl bg-muted/20 border-none">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleUpdateCurrency} 
              className="w-full bg-primary h-12 rounded-xl font-bold text-lg gap-2" 
              disabled={loading || selectedCurrency === user?.currency}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Preference
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
