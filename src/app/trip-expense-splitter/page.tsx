
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plane, Map, Globe, Wallet } from "lucide-react";

export default function TripExpenseSplitterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Plan Your Trip</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-primary">
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-6 grid-rows-6 h-full">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border border-white/10 flex items-center justify-center">
                  <Plane className="h-4 w-4 text-white rotate-45" />
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground max-w-4xl">
            <h1 className="text-5xl md:text-8xl font-black font-headline mb-6 tracking-tighter">
              Trip Expense Splitter
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-10 font-medium">
              Focus on the journey, not the receipts. The world's most travel-friendly trip expense splitter.
            </p>
            <Button asChild size="lg" variant="secondary" className="h-16 px-12 rounded-2xl font-bold text-xl shadow-2xl">
              <Link href="/auth">Get Started Free</Link>
            </Button>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
             <div className="space-y-8">
               <div className="flex gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Globe className="h-6 w-6" /></div>
                 <div>
                   <h3 className="text-xl font-bold mb-2">Multi-Currency Ready</h3>
                   <p className="text-muted-foreground text-sm">Calculate splits in over 150 currencies. Perfect for international road trips and digital nomad groups.</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Map className="h-6 w-6" /></div>
                 <div>
                   <h3 className="text-xl font-bold mb-2">Categorized Tracking</h3>
                   <p className="text-muted-foreground text-sm">Split flights, hotels, and dining into separate categories to see exactly where your holiday budget is going.</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Wallet className="h-6 w-6" /></div>
                 <div>
                   <h3 className="text-xl font-bold mb-2">Offline Sync</h3>
                   <p className="text-muted-foreground text-sm">Add expenses in remote areas with no signal. Wisely syncs your trip data once you're back at the hotel.</p>
                 </div>
               </div>
             </div>
             <div className="bg-card rounded-[3rem] p-12 border border-border shadow-xl transform rotate-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Live Balance Preview</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <span className="font-bold">Flights (Shared)</span>
                    <span className="font-black text-primary">$1,200.00</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <span className="font-bold">Hotel (Split 4 ways)</span>
                    <span className="font-black text-primary">$800.00</span>
                  </div>
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-sm font-medium">Your Share</span>
                    <span className="text-2xl font-black text-accent">$500.00</span>
                  </div>
                </div>
             </div>
          </div>
        </section>

        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-headline mb-8">Ready for your next adventure?</h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of travelers who use Wisely as their primary trip expense splitter. Less math, more memories.
            </p>
            <Button asChild className="h-14 px-10 rounded-2xl font-bold">
              <Link href="/auth">Download the App</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t text-center text-sm text-muted-foreground">
        <p>© 2024 Wisely Finance • The World's Best Trip Expense Splitter.</p>
      </footer>
    </div>
  );
}
