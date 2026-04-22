
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plane, Globe, Wallet } from "lucide-react";

export default function TripExpenseTrackerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Start Trip</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-5xl md:text-8xl font-black font-headline mb-6 tracking-tighter">
              Trip Expense Splitter
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-10 font-medium leading-relaxed">
              Travel further, worry less. The ultimate companion for international trips, road trips, and digital nomad hubs.
            </p>
            <Button asChild size="lg" variant="secondary" className="h-16 px-12 rounded-2xl font-bold text-xl shadow-2xl">
              <Link href="/auth">Plan Your Adventure</Link>
            </Button>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div className="flex gap-4">
              <Globe className="h-10 w-10 text-primary shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">150+ Currencies</h3>
                <p className="text-muted-foreground">Perfect for global travel. Automatically handles exchange rate headaches so you don't have to.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Wallet className="h-10 w-10 text-primary shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Offline Sync</h3>
                <p className="text-muted-foreground">In a remote cabin or on a plane? Wisely works offline and syncs your trip data the moment you're back online.</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-[3rem] p-12 border shadow-2xl relative overflow-hidden">
             <Plane className="h-40 w-40 text-primary/10 absolute -bottom-10 -right-10 rotate-45" />
             <h2 className="text-3xl font-black mb-6">Built for Explorers.</h2>
             <p className="text-muted-foreground leading-relaxed mb-8">
               Most expense apps fail when the signal drops. Wisely's PWA architecture ensures your trip ledger is always accessible, ensuring harmony from departure to landing.
             </p>
             <Button asChild className="w-full h-14 rounded-2xl font-bold text-lg">
               <Link href="/auth">Open Your Vault</Link>
             </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
