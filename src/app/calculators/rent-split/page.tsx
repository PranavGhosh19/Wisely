
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, ShieldCheck, Scale, TrendingUp } from "lucide-react";

export default function RentSplitCalculatorPage() {
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

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-6 mb-20">
             <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
               <Home className="h-6 w-6" />
             </div>
             <h1 className="text-4xl md:text-7xl font-black font-headline text-primary tracking-tight">
               Rent Split Calculator
             </h1>
             <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
               Fair rent splitting isn't always 50/50. Our rent split calculator helps roommates divide housing costs based on room size, income, or features.
             </p>
             <Button asChild size="lg" className="h-16 px-12 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20">
               <Link href="/auth">Calculate Fair Rent</Link>
             </Button>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <div className="p-8 rounded-[2.5rem] bg-card border shadow-sm group hover:shadow-md transition-all">
                <Scale className="h-8 w-8 text-accent mb-6" />
                <h3 className="text-xl font-bold mb-3">Square Footage Splits</h3>
                <p className="text-muted-foreground text-sm">Calculate rent based on individual room sizes compared to total apartment area. The most mathematically fair way to split.</p>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-card border shadow-sm group hover:shadow-md transition-all">
                <TrendingUp className="h-8 w-8 text-accent mb-6" />
                <h3 className="text-xl font-bold mb-3">Income-Adjusted Splits</h3>
                <p className="text-muted-foreground text-sm">Share the burden proportionally based on each roommate's take-home pay. Ideal for long-term partners and mixed-income households.</p>
              </div>
            </div>
            <div className="bg-primary rounded-[3rem] p-12 text-primary-foreground flex flex-col justify-center gap-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full -translate-y-20 -translate-x-20 blur-3xl" />
               <h2 className="text-3xl font-bold font-headline leading-tight relative z-10">Roommate harmony is just a calculation away.</h2>
               <p className="opacity-80 relative z-10">
                 Join 50,000+ roommates who use Wisely to manage their shared vault. 
                 <br /><br />
                 Our rent split calculator logic is built on proven economic principles to ensure no one feels shortchanged.
               </p>
               <Button asChild variant="secondary" className="h-14 rounded-2xl font-black text-lg relative z-10">
                 <Link href="/auth">Start Your Vault</Link>
               </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
