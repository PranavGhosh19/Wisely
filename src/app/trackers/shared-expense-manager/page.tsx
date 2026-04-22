
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Zap, BarChart3, ArrowRight } from "lucide-react";

export default function SharedExpenseManagerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Start Managing</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-16 mb-24">
            <div className="flex-1 space-y-8">
              <h1 className="text-5xl md:text-7xl font-black font-headline text-primary tracking-tighter leading-none">
                Shared Expense Manager.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Professional tools for collaborative financial management. Perfect for events, group projects, and shared community funds.
              </p>
              <Button asChild size="lg" className="h-16 px-10 rounded-2xl font-bold text-xl shadow-xl shadow-primary/30">
                <Link href="/auth">Create Shared Vault</Link>
              </Button>
            </div>
            <div className="flex-1 bg-primary text-primary-foreground rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
               <Briefcase className="h-40 w-40 absolute -top-10 -left-10 opacity-10" />
               <div className="space-y-6 relative z-10">
                 <h2 className="text-3xl font-bold font-headline leading-tight">Beyond Simple Splitting.</h2>
                 <p className="opacity-80">
                   Our manager provides deep insights into group spending velocity and member contributions, ensuring every project stays on budget.
                 </p>
                 <div className="pt-4 grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Accuracy</p>
                     <p className="text-xl font-bold">100%</p>
                   </div>
                   <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Sync</p>
                     <p className="text-xl font-bold">Real-time</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
