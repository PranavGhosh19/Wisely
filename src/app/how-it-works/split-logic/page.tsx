"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Percent, 
  Scale, 
  Coins, 
  ArrowRight,
  Calculator,
  Zap,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SplitLogicPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely Logic</span>
          </Link>
          <Button variant="ghost" asChild className="rounded-xl font-bold">
            <Link href="/features">Features</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="text-center mb-20 space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
              <Calculator className="h-6 w-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">The math of sharing.</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether it's a simple dinner or a complex month-long road trip, Wisely handles the splits so you don't have to.
            </p>
          </header>

          <div className="grid gap-12">
            {/* Split Types */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: "Equal Split",
                  desc: "The classic. Divide the bill evenly among everyone or a selected subset of the group."
                },
                {
                  icon: Percent,
                  title: "Percentage",
                  desc: "Perfect for unequal contributions. Assign 60% to one person and 40% to another."
                },
                {
                  icon: Scale,
                  title: "Weighted Shares",
                  desc: "Ideal for family plans or varying stays. Person A gets 2 shares, Person B gets 1 share."
                }
              ].map((s, i) => (
                <Card key={i} className="border-none shadow-sm rounded-3xl bg-card overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <s.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline pt-2">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Smart Settle Deep Dive */}
            <section className="bg-primary text-primary-foreground rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                    <Zap className="h-3 w-3 fill-accent text-accent" />
                    Smart Settle Tech
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold font-headline">Zero out with fewer transfers.</h2>
                  <p className="text-lg opacity-80 leading-relaxed">
                    Wisely uses a <strong>Greedy Flow Algorithm</strong>. If John owes Jane $10, and Jane owes Bob $10, our system tells John to pay Bob directly.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Reduces awkward transactional friction",
                      "Eliminates redundant bank transfers",
                      "Simplified net balances for everyone"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-accent rounded-full flex items-center justify-center text-primary font-bold">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 aspect-square flex flex-col justify-center gap-6">
                   <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                     <span className="text-xs font-bold">Traditional: 5 Payments</span>
                     <span className="text-xs opacity-50">Messy</span>
                   </div>
                   <div className="flex items-center justify-center">
                      <ArrowRight className="h-12 w-12 text-accent rotate-90 md:rotate-0" />
                   </div>
                   <div className="flex items-center justify-between p-6 bg-accent text-primary rounded-2xl shadow-xl shadow-accent/20">
                     <span className="text-sm font-black">Wisely: 2 Payments</span>
                     <Zap className="h-5 w-5 fill-primary" />
                   </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold font-headline mb-6 text-primary">Stop doing mental gymnastics.</h3>
              <Button asChild size="lg" className="h-14 px-10 rounded-2xl font-bold text-lg">
                <Link href="/auth">Start Splitting for Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
