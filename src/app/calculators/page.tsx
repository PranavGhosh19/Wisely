
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight, Home, Utensils, Users, Percent } from "lucide-react";

const calculators = [
  {
    title: "Split Expense Calculator",
    description: "The simplest way to calculate who owes what for any shared cost.",
    href: "/calculators/split-expense-calculator",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Group Expense Calculator",
    description: "Manage complex shared costs across any number of members with smart splitting.",
    href: "/calculators/group-expense-calculator",
    icon: Calculator,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Rent Split Calculator",
    description: "Fairly divide housing costs based on room size, income, or features.",
    href: "/calculators/rent-split-calculator",
    icon: Home,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    title: "Dinner Bill Split Calculator",
    description: "Handle tax, tip, and drinks at the restaurant table in seconds.",
    href: "/calculators/dinner-bill-split-calculator",
    icon: Utensils,
    color: "text-pink-500",
    bg: "bg-pink-500/10"
  }
];

export default function CalculatorsIndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-headline text-lg font-bold text-primary">Calculators</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Start Splitting</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">Financial Calculators</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Free tools designed to handle the complex math of shared living and social spending.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {calculators.map((calc, i) => (
              <Link key={i} href={calc.href} className="group">
                <div className="p-8 rounded-[2rem] bg-card border border-border shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className={`h-14 w-14 ${calc.bg} ${calc.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <calc.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold font-headline mb-3">{calc.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{calc.description}</p>
                  </div>
                  <div className="pt-6 flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                    Open Calculator <ArrowRight className="h-4 w-4" />
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
