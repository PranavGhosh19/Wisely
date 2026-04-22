
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Zap, Lock, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SplitwiseAlternativePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Switch to Wisely</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-24 space-y-6">
            <h1 className="text-5xl md:text-8xl font-black font-headline text-primary tracking-tight">
              The Best Splitwise Alternative.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Tired of ads and paying for basic features? Wisely is the modern, private, and free-first alternative to Splitwise.
            </p>
          </div>

          <div className="rounded-[2.5rem] border border-border bg-card shadow-2xl overflow-hidden mb-24">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-none">
                  <TableHead className="w-[250px] font-bold text-foreground py-6 pl-8">Feature</TableHead>
                  <TableHead className="font-black text-primary text-center">Wisely</TableHead>
                  <TableHead className="text-muted-foreground text-center">Splitwise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Zero Ads", wisely: true, competitor: false },
                  { name: "Unlimited Groups", wisely: true, competitor: true },
                  { name: "Personal Budgeting", wisely: true, competitor: false },
                  { name: "Offline Mode", wisely: true, competitor: "Limited" },
                  { name: "Privacy First", wisely: true, competitor: false },
                  { name: "Smart Settlement", wisely: true, competitor: true }
                ].map((row, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell className="font-bold py-6 pl-8">{row.name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground font-medium">
                      {row.competitor === true ? <Check className="h-5 w-5 mx-auto text-green-500" /> : 
                       row.competitor === false ? <X className="h-5 w-5 mx-auto text-muted-foreground/30" /> : row.competitor}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-primary text-primary-foreground rounded-[3rem] p-12 md:p-20 text-center space-y-8 shadow-2xl relative overflow-hidden">
             <Sparkles className="h-40 w-40 absolute -top-10 -left-10 opacity-10" />
             <h2 className="text-4xl md:text-6xl font-black">Ready for a better experience?</h2>
             <p className="text-xl opacity-80 max-w-2xl mx-auto">
               Import your life into Wisely. The first unified financial ledger that handles your personal spending and group costs in one clean app.
             </p>
             <Button asChild variant="secondary" size="lg" className="h-16 px-12 rounded-2xl font-black text-xl hover:scale-105 transition-transform">
               <Link href="/auth">Open Your Vault Free</Link>
             </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
