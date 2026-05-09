"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Wallet, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  Zap,
  Activity,
  Target
} from "lucide-react";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { user, isLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background no-scrollbar">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white font-black shadow-md glow-primary">W</div>
              <span className="font-headline text-xl font-black text-primary uppercase tracking-tighter text-glow">Wisely</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Features</Link>
              <Link href="/compare" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Why Wisely?</Link>
              <Link href="/how-it-works/split-logic" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Protocol</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:flex rounded-xl font-black uppercase tracking-widest text-[10px]">
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-10 px-6 bg-primary glow-primary shadow-lg active:scale-95 transition-all">
              <Link href="/auth">Access Vault</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden bg-background px-4">
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-headline text-primary tracking-tighter leading-[0.85] text-glow uppercase">
                COMMAND YOUR <br />
                <span className="text-accent text-glow-accent">CAPITAL.</span>
              </h1>
              <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-tight opacity-60">
                The high-performance unified ledger for your personal vault and shared network sectors.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Button asChild size="lg" className="h-16 px-12 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs bg-primary glow-primary shadow-2xl transition-all hover:scale-105 active:scale-95">
                <Link href="/auth">
                  Initialize First Cycle
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-10 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] border-2 border-white/5 glass hover:border-primary/50 transition-all">
                <Link href="/features">Scan Protocols</Link>
              </Button>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
      </section>

      {/* Features Preview */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-30 border-y border-white/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-2">
            <h2 className="text-4xl md:text-5xl font-black font-headline text-glow uppercase tracking-tighter">System Standards</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Hardened Infrastructure / Zero Latency</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Wallet,
                title: "Private Vault",
                desc: "Record internal flows with total persistence. Shielded, secure, and entirely your own node.",
                link: "/features",
                color: "text-primary",
                glow: "glow-primary"
              },
              {
                icon: Users,
                title: "Network Nodes",
                desc: "Multi-peer splitting for household rent, group travel, and social payloads.",
                link: "/how-it-works/split-logic",
                color: "text-accent",
                glow: "glow-accent"
              },
              {
                icon: BarChart3,
                title: "Analyst HUD",
                desc: "Heuristic data metrics surfacing spend-patterns before thresholds are breached.",
                link: "/how-it-works/analytics",
                color: "text-emerald-500",
                glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10 }}
                className="flex flex-col p-8 rounded-[3rem] glass-card border-white/5 shadow-2xl group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Zap className={cn("h-4 w-4", f.color)} />
                </div>
                <div className={cn("h-16 w-16 rounded-2xl glass flex items-center justify-center mb-8 transition-all shadow-inner", f.color, f.glow)}>
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{f.title}</h3>
                <p className="text-xs font-bold text-muted-foreground mb-8 flex-1 leading-relaxed uppercase tracking-wider opacity-60">{f.desc}</p>
                <Link href={f.link} className={cn("inline-flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] hover:gap-5 transition-all", f.color)}>
                  SYNC DETAILS <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & CTA */}
      <section className="py-24 bg-background overflow-hidden px-4">
        <div className="container mx-auto">
          <div className="bg-primary text-primary-foreground rounded-[4rem] p-10 md:p-24 relative overflow-hidden shadow-[0_0_80px_rgba(var(--primary),0.2)]">
            <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 rounded-full blur-[100px] -translate-y-32 translate-x-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-20">
               <div className="flex-1 space-y-10">
                 <h2 className="text-5xl md:text-7xl font-black font-headline leading-[0.9] tracking-tighter uppercase">Protocol <br /> Upgrade.</h2>
                 <p className="text-xl font-bold opacity-80 leading-relaxed uppercase tracking-tight">
                   Consolidate legacy apps into one high-performance HUD. Zero ads, zero tracking, total financial clarity.
                 </p>
                 <div className="flex flex-wrap gap-6 items-center">
                   <Button asChild variant="secondary" size="lg" className="rounded-2xl font-black uppercase tracking-widest text-[11px] h-16 px-10 shadow-2xl active:scale-95 transition-all">
                     <Link href="/compare">Compare Performance</Link>
                   </Button>
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                     <ShieldCheck className="h-5 w-5" />
                     Encrypted Vault
                   </div>
                 </div>
               </div>
               <div className="flex-1 w-full max-w-md hidden lg:block">
                 <div className="glass backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/10 space-y-8 shadow-inner">
                   <div className="flex items-center justify-between pb-4 border-b border-white/10">
                     <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Latency</span>
                     </div>
                     <span className="text-[10px] font-black text-accent">0.02ms</span>
                   </div>
                   <div className="flex items-center justify-between pb-4 border-b border-white/10">
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Security</span>
                     </div>
                     <span className="text-[10px] font-black text-accent">HARDENED</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Accuracy</span>
                     </div>
                     <span className="text-[10px] font-black text-accent">100.00%</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-background px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white font-black shadow-lg">W</div>
                <span className="font-headline font-black text-2xl text-primary tracking-tighter uppercase text-glow">Wisely</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 max-w-xs text-center md:text-left leading-relaxed">
                The High-Performance Unified Ledger v1.2.0
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="space-y-6">
                <h4 className="font-black text-[9px] uppercase tracking-[0.4em] text-primary">Calculators</h4>
                <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  <li><Link href="/calculators/split-expense-calculator" className="hover:text-primary transition-colors">Split</Link></li>
                  <li><Link href="/calculators/group-expense-calculator" className="hover:text-primary transition-colors">Group</Link></li>
                  <li><Link href="/calculators/rent-split-calculator" className="hover:text-primary transition-colors">Rent</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-black text-[9px] uppercase tracking-[0.4em] text-primary">System</h4>
                <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  <li><Link href="/help-center" className="hover:text-primary transition-colors">Support</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link></li>
                  <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.8em]">
            <p>© 2026 THE WISELY TERMINAL.</p>
            <div className="flex gap-10">
              <Link href="/help-center" className="hover:text-primary transition-colors">LINKEDIN</Link>
              <Link href="/help-center" className="hover:text-primary transition-colors">GITHUB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
