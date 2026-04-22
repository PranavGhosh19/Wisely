
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles, Scale } from "lucide-react";

export default function GroupExpenseCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Start Calculating</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <header className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-4xl md:text-7xl font-black font-headline mb-6 leading-tight">
              Group Expense Calculator
            </h1>
            <p className="text-xl opacity-80 mb-10 leading-relaxed">
              Managing finances for a team, household, or community? Our group expense calculator simplifies complex shared costs in one powerful dashboard.
            </p>
            <Button asChild size="lg" variant="secondary" className="h-16 px-10 rounded-2xl font-bold text-xl">
              <Link href="/auth">
                Create Your Group
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="py-24 container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl bg-card border shadow-sm">
              <Users className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">Multi-Member Logic</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Whether you have 2 members or 20, our calculator scales instantly. Add members and watch balances update in real-time.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-card border shadow-sm">
              <Scale className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">Weighted Calculations</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Split by shares, weights, or custom percentages. Perfect for roommates sharing rent or groups with varying contributions.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-card border shadow-sm">
              <Sparkles className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">Smart Settle Algorithm</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our calculator doesn't just show debts—it minimizes them. Zero out your group with the fewest number of bank transfers.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t text-center text-sm text-muted-foreground">
        <p>© 2026 Wisely Finance • Pro Group Expense Calculator.</p>
      </footer>
    </div>
  );
}
