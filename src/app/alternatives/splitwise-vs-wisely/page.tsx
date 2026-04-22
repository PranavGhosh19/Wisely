
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Scale, ArrowRight, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SplitwiseVsWiselyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-headline text-lg font-bold text-primary">Comparison</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16 space-y-4">
             <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-4">
               <Scale className="h-6 w-6" />
             </div>
             <h1 className="text-4xl md:text-7xl font-black font-headline text-primary tracking-tight">
               Splitwise vs Wisely
             </h1>
             <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
               Don't get trapped in a subscription for basic features. See how the world's most modern finance app stacks up against the legacy leader.
             </p>
          </div>

          <div className="rounded-[2.5rem] border border-border bg-card shadow-2xl overflow-hidden mb-24">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-none">
                  <TableHead className="w-[250px] font-bold text-foreground py-6 pl-8">Capability</TableHead>
                  <TableHead className="font-black text-primary text-center">Wisely</TableHead>
                  <TableHead className="text-muted-foreground text-center">Splitwise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "No Ads Ever", wisely: true, splitwise: false },
                  { name: "Unlimited Groups", wisely: true, splitwise: true },
                  { name: "Private Ledger", wisely: true, splitwise: false },
                  { name: "Offline Sync", wisely: true, splitwise: "Limited" },
                  { name: "Modern AI Analyst", wisely: true, splitwise: false },
                  { name: "Multi-Currency", wisely: true, splitwise: "Paid" }
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
                      {row.splitwise === true ? <Check className="h-5 w-5 mx-auto text-green-500" /> : 
                       row.splitwise === false ? <X className="h-5 w-5 mx-auto text-muted-foreground/30" /> : row.splitwise}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Shield className="h-12 w-12 text-primary" />
              <h2 className="text-3xl font-bold font-headline">Built for Privacy.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Wisely doesn't sell your transaction data to advertisers. We use bank-grade security to ensure your personal and shared vaults remain entirely your own.
              </p>
            </div>
            <div className="space-y-6">
              <Zap className="h-12 w-12 text-accent" />
              <h2 className="text-3xl font-bold font-headline">Built for Speed.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our PWA-first architecture means the app loads instantly, works on a plane, and never requires a slow update from the App Store.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
