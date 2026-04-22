
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Sparkles, Scale } from "lucide-react";

const items = [
  {
    title: "Splitwise Alternative",
    description: "Tired of ads and paying for basic features? See why thousands are switching to Wisely.",
    href: "/alternatives/splitwise-alternative",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  },
  {
    title: "Splitwise vs Wisely",
    description: "A head-to-head comparison of features, pricing, and privacy.",
    href: "/alternatives/splitwise-vs-wisely",
    icon: Scale,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Better than Splitwise",
    description: "Why Wisely's hybrid personal-group ledger is the future of finance apps.",
    href: "/compare",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10"
  }
];

export default function AlternativesIndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-headline text-lg font-bold text-primary">Alternatives</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Import Your Data</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">The Best Alternative</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We built Wisely to fix everything that was broken in traditional expense splitting apps.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Link key={i} href={item.href} className="group">
                <div className="p-8 rounded-[2rem] bg-card border border-border shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className={`h-14 w-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold font-headline mb-3">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                  <div className="pt-6 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                    Learn More <ArrowRight className="h-4 w-4" />
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
