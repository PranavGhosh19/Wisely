
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClipboardList, Home, Heart, ShieldCheck, ArrowRight } from "lucide-react";

export default function HouseholdExpenseTrackerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Start Your Ledger</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-6 mb-20">
             <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
               <Home className="h-6 w-6" />
             </div>
             <h1 className="text-4xl md:text-7xl font-black font-headline text-primary tracking-tight">
               Household Expense Tracker
             </h1>
             <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
               A professional financial ledger for long-term partners, families, and couples. Manage your home budget together with absolute clarity.
             </p>
             <Button asChild size="lg" className="h-16 px-12 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20">
               <Link href="/auth">Manage Your Home</Link>
             </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Heart, title: "Couples Splitting", desc: "Share costs proportionally based on income or 50/50. Perfect for mixed-income households." },
              { icon: ClipboardList, title: "Permanent Records", desc: "Cloud-synced vault stores every receipt and transaction for years. Ideal for tax and planning." },
              { icon: ShieldCheck, title: "Privacy First", desc: "Your personal coffee is private. Your shared rent is collaborative. The best of both worlds." }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-card border border-border shadow-sm">
                <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
