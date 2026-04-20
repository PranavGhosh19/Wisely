"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { 
  CheckCircle2, 
  Smartphone, 
  Wifi, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Target, 
  ArrowRight,
  Globe
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Public Header */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold">W</div>
            <span className="font-headline text-xl font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold h-10 px-6">
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black font-headline mb-6">Built for the modern spender.</h1>
            <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Wisely isn't just another tracker. It's a financial engine designed to balance your private life and your shared commitments in one vault.
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: "Smart Budgeting",
                  desc: "Set monthly goals for specific categories. Our analyst tracks your progress and alerts you before you overspend."
                },
                {
                  icon: Smartphone,
                  title: "PWA Native Feel",
                  desc: "Install Wisely on your home screen. No App Store needed. Fast, lightweight, and always up to date."
                },
                {
                  icon: Wifi,
                  title: "Works Offline",
                  desc: "Add expenses on a plane or in a remote cabin. Wisely syncs your data automatically when you're back online."
                },
                {
                  icon: Globe,
                  title: "Multi-Currency",
                  desc: "Over 150 currencies supported. Perfect for international trips and digital nomads splitting costs abroad."
                },
                {
                  icon: Zap,
                  title: "Greedy Settlement",
                  desc: "Our algorithm minimizes the number of transfers needed to zero out a group, saving everyone time."
                },
                {
                  icon: ShieldCheck,
                  title: "Privacy First",
                  desc: "Your data is yours. We use Firebase's high-security rules to ensure only you and your group members see your costs."
                }
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all group">
                  <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold font-headline mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deep Dive */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold font-headline text-primary">Hybrid Ledger Technology.</h2>
                <p className="text-lg text-muted-foreground">
                  The biggest problem with expense apps today is that they are either 100% private or 100% shared. 
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
                    <p className="font-medium text-foreground">Record your morning coffee in your private personal ledger.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
                    <p className="font-medium text-foreground">Split the group dinner in a shared group ledger.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
                    <p className="font-medium text-foreground">See your total net worth and spending across both in one unified dashboard.</p>
                  </div>
                </div>
                <Button asChild size="lg" className="rounded-2xl font-bold h-14 px-8 mt-4">
                  <Link href="/auth">Experience the hybrid vault</Link>
                </Button>
              </div>
              <div className="flex-1 bg-primary/5 rounded-[3rem] p-12 border-2 border-dashed border-primary/20 flex items-center justify-center">
                <CreditCard className="h-32 w-32 text-primary/40 animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2024 Wisely Finance. <Link href="/auth" className="underline hover:text-primary">Sign In</Link> • <Link href="/" className="underline hover:text-primary">Home</Link></p>
        </div>
      </footer>
    </div>
  );
}
