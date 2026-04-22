
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils, Zap, Calculator } from "lucide-react";

export default function DinnerBillSplitPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Split Now</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
            <Utensils className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-7xl font-black font-headline text-primary mb-6 leading-tight">
            Dinner Bill Split Calculator
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Stop the awkward math at the restaurant table. Our specialized dinner bill split calculator handles tax, tip, and drinks in seconds.
          </p>
          <Button asChild size="lg" className="h-16 px-12 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20">
            <Link href="/auth">Get Started Free</Link>
          </Button>
        </div>

        <section className="py-24 container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[2.5rem] bg-card border shadow-sm space-y-4">
            <Zap className="h-8 w-8 text-accent" />
            <h3 className="text-xl font-bold">Instant Splits</h3>
            <p className="text-muted-foreground text-sm">Split by items or just divide the total. Fast enough for the most impatient group.</p>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-card border shadow-sm space-y-4">
            <Calculator className="h-8 w-8 text-accent" />
            <h3 className="text-xl font-bold">Tax & Tip Handling</h3>
            <p className="text-muted-foreground text-sm">Automatically calculate and distribute tax and tips proportionally across the group.</p>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-card border shadow-sm space-y-4">
            <ArrowRight className="h-8 w-8 text-accent" />
            <h3 className="text-xl font-bold">Settlement Friendly</h3>
            <p className="text-muted-foreground text-sm">Integrate with your shared groups to record who paid for the night instantly.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
