
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Users, Bell, Lock } from "lucide-react";

export default function RoommateTrackerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Create Household</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-24 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              Top Rated Roommate App
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-headline text-primary leading-tight">
              Roommate Expense Tracker
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Keep the household peace. Track groceries, utilities, and rent in one shared digital vault. No more awkward WhatsApp messages about toilet paper.
            </p>
            <Button asChild size="lg" className="h-16 px-12 rounded-2xl font-bold text-xl shadow-2xl shadow-primary/20">
              <Link href="/auth">Set Up Your Home</Link>
            </Button>
          </div>
          <div className="flex-1 bg-muted/30 rounded-[3rem] p-10 border-2 border-dashed border-primary/20 space-y-6">
             {[
               { icon: Bell, text: "Rent Reminder: Due Friday" },
               { icon: Users, text: "Alex added Groceries ($45.00)" },
               { icon: Lock, text: "Privacy: Personal bills hidden" }
             ].map((item, i) => (
               <div key={i} className="bg-card p-5 rounded-2xl border shadow-sm flex items-center gap-4">
                 <item.icon className="h-5 w-5 text-primary" />
                 <span className="font-bold text-sm">{item.text}</span>
               </div>
             ))}
          </div>
        </div>
      </main>
    </div>
  );
}
