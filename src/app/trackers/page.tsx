
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plane, Home, Users, ClipboardList, Briefcase } from "lucide-react";

const trackers = [
  {
    title: "Trip Expense Tracker",
    description: "The ultimate travel companion for splitting costs on road trips and holidays.",
    href: "/trackers/trip-expense-tracker",
    icon: Plane,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Roommate Expense Tracker",
    description: "Keep household peace with a shared digital vault for utilities and groceries.",
    href: "/trackers/roommate-expense-tracker",
    icon: Home,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Household Expense Tracker",
    description: "A professional ledger for long-term partners and families managing a home.",
    href: "/trackers/household-expense-tracker",
    icon: ClipboardList,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Shared Expense Manager",
    description: "Collaborative financial management for projects, events, and communities.",
    href: "/trackers/shared-expense-manager",
    icon: Briefcase,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  }
];

export default function TrackersIndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-headline text-lg font-bold text-primary">Trackers</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Join Your Group</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">Expense Trackers</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time shared ledgers for every type of collaborative spending.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {trackers.map((tracker, i) => (
              <Link key={i} href={tracker.href} className="group">
                <div className="p-8 rounded-[2rem] bg-card border border-border shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className={`h-14 w-14 ${tracker.bg} ${tracker.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <tracker.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold font-headline mb-3">{tracker.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{tracker.description}</p>
                  </div>
                  <div className="pt-6 flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                    Explore Tracker <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
