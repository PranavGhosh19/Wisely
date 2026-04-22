
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, CheckCircle2, Zap } from "lucide-react";

export default function SplitExpenseCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Start Splitting</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-4xl md:text-7xl font-black font-headline text-primary mb-6 leading-tight">
              Split Expense Calculator
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              The simplest way to calculate who owes what. Whether it's a dinner bill or a shared subscription, Wisely handles the math instantly.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="h-16 px-10 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20">
                <Link href="/auth">
                  Try the Calculator Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-headline text-primary">Stop doing mental gymnastics.</h2>
              <p className="text-lg text-muted-foreground">
                Manual splitting leads to errors and awkward conversations. Our split expense calculator logic ensures every cent is accounted for.
              </p>
              <ul className="space-y-4">
                {[
                  "Calculate equal or percentage-based splits",
                  "Include tax and tip with ease",
                  "Simplify complex debts between multiple friends",
                  "Works 100% offline for instant results"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-2xl flex flex-col items-center gap-8">
               <Calculator className="h-32 w-32 text-primary/20" />
               <div className="text-center space-y-2">
                 <p className="font-bold text-xl">Interactive Calculator</p>
                 <p className="text-muted-foreground text-sm">Sign in to sync this calculation with your group vault.</p>
               </div>
               <Button asChild variant="outline" className="w-full h-12 rounded-xl font-bold">
                 <Link href="/auth">Open Dashboard</Link>
               </Button>
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-headline mb-12">Trusted by modern spenders worldwide.</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
               <div className="p-6 bg-card rounded-2xl border">
                 <p className="text-3xl font-black text-primary mb-1">99.9%</p>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Accuracy</p>
               </div>
               <div className="p-6 bg-card rounded-2xl border">
                 <p className="text-3xl font-black text-primary mb-1">0</p>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Late Fees</p>
               </div>
               <div className="p-6 bg-card rounded-2xl border">
                 <p className="text-3xl font-black text-primary mb-1">Secured</p>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Vault</p>
               </div>
               <div className="p-6 bg-card rounded-2xl border">
                 <Zap className="h-8 w-8 text-accent mx-auto mb-2" />
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Real-time</p>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t text-center text-sm text-muted-foreground">
        <p>© 2024 Wisely Finance • The Best Split Expense Calculator.</p>
      </footer>
    </div>
  );
}
