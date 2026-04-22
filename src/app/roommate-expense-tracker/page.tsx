
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Bell, ClipboardList, Lock } from "lucide-react";

export default function RoommateExpenseTrackerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Start Tracking</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <section className="py-24 container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h1 className="text-5xl md:text-7xl font-black font-headline text-primary tracking-tighter leading-[0.9]">
                Roommate Expense Tracker
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                The ultimate app for shared living. Track groceries, utilities, and household supplies without the stress of "who paid for what."
              </p>
              <div className="flex flex-wrap gap-4">
                 <Button asChild size="lg" className="h-16 px-10 rounded-2xl font-bold text-xl">
                   <Link href="/auth">Create Household</Link>
                 </Button>
              </div>
            </div>
            <div className="flex-1 bg-muted/50 rounded-[3rem] p-12 border-2 border-dashed border-primary/20 flex flex-col gap-6">
               <div className="h-14 w-full bg-card rounded-2xl border shadow-sm flex items-center px-6 gap-4">
                 <Bell className="h-5 w-5 text-primary" />
                 <span className="text-sm font-bold truncate">Rent Reminder: Due in 3 days</span>
               </div>
               <div className="h-14 w-full bg-card rounded-2xl border shadow-sm flex items-center px-6 gap-4">
                 <Bell className="h-5 w-5 text-primary" />
                 <span className="text-sm font-bold truncate">Groceries: Paid by Alex</span>
               </div>
               <div className="h-14 w-full bg-card rounded-2xl border shadow-sm flex items-center px-6 gap-4">
                 <Bell className="h-5 w-5 text-primary" />
                 <span className="text-sm font-bold truncate">Electricity: Split equally</span>
               </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-16 text-center">Built for Roommate Harmony.</h2>
            <div className="grid md:grid-cols-3 gap-8">
               <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 space-y-4">
                 <ClipboardList className="h-8 w-8 text-accent" />
                 <h3 className="text-xl font-bold">Ledger Persistence</h3>
                 <p className="text-sm opacity-70">Never lose a receipt again. Our roommate expense tracker stores every transaction in a permanent, cloud-synced vault.</p>
               </div>
               <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 space-y-4">
                 <Lock className="h-8 w-8 text-accent" />
                 <h3 className="text-xl font-bold">Privacy Controls</h3>
                 <p className="text-sm opacity-70">Control who sees what. Track your personal bills privately while sharing household costs with your group.</p>
               </div>
               <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 space-y-4">
                 <Users className="h-8 w-8 text-accent" />
                 <h3 className="text-xl font-bold">Instant Settlements</h3>
                 <p className="text-sm opacity-70">Send payment requests instantly when someone owes you. Integrates with your favorite mobile payment platforms.</p>
               </div>
            </div>
          </div>
        </section>

        <section className="py-24 text-center container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline text-primary mb-8 leading-tight">
            The world's most advanced roommate expense tracker.
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Stop arguing over chores and start focusing on living. Join thousands of happy households already using Wisely.
          </p>
          <Button asChild size="lg" className="h-16 px-12 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20">
            <Link href="/auth">Set Up Your Home</Link>
          </Button>
        </section>
      </main>

      <footer className="py-12 border-t text-center text-sm text-muted-foreground">
        <p>© 2024 Wisely Finance • The Leading Roommate Expense Tracker.</p>
      </footer>
    </div>
  );
}
