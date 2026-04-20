"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Zap, TrendingUp, Lock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ComparisonPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-headline text-lg font-bold text-primary">Compare Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold h-10 px-6">
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black font-headline text-primary mb-6">Why Wisely wins.</h1>
            <p className="text-lg text-muted-foreground">We looked at every finance app on the market and fixed what was broken.</p>
          </header>

          <div className="rounded-[2.5rem] border border-border bg-card shadow-2xl overflow-hidden mb-20">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-none">
                  <TableHead className="w-[250px] font-bold text-foreground py-6 pl-8">Feature</TableHead>
                  <TableHead className="font-black text-primary text-center">Wisely</TableHead>
                  <TableHead className="text-muted-foreground text-center">Splitwise</TableHead>
                  <TableHead className="text-muted-foreground text-center">Mint / YNAB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Group Splitting", wisely: true, splitwise: true, others: false },
                  { name: "Personal Budgeting", wisely: true, splitwise: false, others: true },
                  { name: "Unified Dashboard", wisely: true, splitwise: false, others: false },
                  { name: "Offline Mode", wisely: true, splitwise: "Limited", others: true },
                  { name: "Privacy (No Ad Data)", wisely: true, splitwise: "Ads", others: "Ads" },
                  { name: "Real-time PWA", wisely: true, splitwise: false, others: false },
                  { name: "Weighted Splits", wisely: true, splitwise: true, others: false }
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
                    <TableCell className="text-center text-muted-foreground font-medium">
                      {row.others === true ? <Check className="h-5 w-5 mx-auto text-green-500" /> : 
                       row.others === false ? <X className="h-5 w-5 mx-auto text-muted-foreground/30" /> : row.others}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <Zap className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold font-headline">Fast as a native app, flexible as a web app.</h2>
              <p className="text-muted-foreground leading-relaxed">
                By building Wisely as a <strong>Progressive Web App</strong>, we bypass slow app store updates. When we fix a bug or add a feature, you get it instantly. 
              </p>
            </div>
            <div className="space-y-6">
              <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <Lock className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold font-headline">Your data isn't a product.</h2>
              <p className="text-muted-foreground leading-relaxed">
                Most "free" budgeting apps sell your transaction data to advertisers. Wisely is built on a clean business model: we prioritize your privacy and vault security above everything else.
              </p>
            </div>
          </div>

          <div className="mt-24 p-12 rounded-[3rem] bg-accent text-primary text-center">
            <h2 className="text-3xl font-black font-headline mb-4">Ready to switch?</h2>
            <p className="font-bold opacity-70 mb-8 max-w-xl mx-auto">Join thousands of users who have consolidated their financial lives into Wisely.</p>
            <Button asChild size="lg" className="h-14 px-12 rounded-2xl bg-primary text-white font-bold hover:scale-105 transition-transform">
              <Link href="/auth">Import Your Life</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
