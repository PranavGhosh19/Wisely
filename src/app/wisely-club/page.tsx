"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, ShieldCheck, Trophy, Crown, Zap, TrendingUp, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Wisely Club Page - Immersive high-end performance interface for the elite 1%.
 */
export default function WiselyClubPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden relative">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[120px] -z-10 rounded-full" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full" />

      {/* Top Left Navigation - HUD Style */}
      <div className="fixed top-6 left-6 z-[60]">
        <Button 
          variant="ghost" 
          className="text-muted-foreground hover:text-primary gap-2 px-4 h-12 rounded-full glass border-white/10 shadow-xl transition-all hover:scale-105"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Command Center</span>
        </Button>
      </div>

      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-5xl mx-auto w-full relative">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center space-y-6 pt-24 md:pt-12"
        >
          <div className="relative inline-block group">
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-10 border border-[#D4AF37]/20 rounded-full border-dashed" 
            />
            <div className="h-28 w-24 glass rounded-[2.5rem] flex items-center justify-center text-[#D4AF37] relative z-10 shadow-[0_0_60px_rgba(212,175,55,0.25)] border-[#D4AF37]/40 animate-morph">
              <Crown className="h-12 w-12" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-[#D4AF37] leading-none drop-shadow-2xl">
              THE CLUB
            </h1>
            <div className="flex flex-col items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-[1.2em] text-[#D4AF37]/80">
                The 1% Protocol
              </p>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
              <p className="text-sm font-bold text-muted-foreground max-w-lg mx-auto italic mt-4 px-6">
                "For those who refuse to follow the average. Built to outsmart the market and master every transaction."
              </p>
            </div>
          </div>
        </motion.header>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-[#D4AF37]/20 overflow-hidden group hover:scale-[1.02] transition-all duration-700 h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40" />
              <CardHeader className="pb-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black uppercase tracking-widest text-[#D4AF37]">Outsmart</CardTitle>
                    <CardDescription className="font-bold text-[#D4AF37]/60 text-[10px] tracking-[0.2em] uppercase">Status: Elite Authorized</CardDescription>
                  </div>
                  <Trophy className="h-8 w-8 text-[#D4AF37] animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  {[
                    { icon: Target, text: "Strategic Capital HUD: High-velocity decision metrics.", color: "text-emerald-500" },
                    { icon: Zap, text: "Zero-latency synchronization across global vaults.", color: "text-blue-500" },
                    { icon: TrendingUp, text: "Predictive spend-pathing to maintain 1% net worth.", color: "text-[#D4AF37]" }
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-4 group/item">
                      <div className={cn("h-8 w-8 rounded-xl glass flex items-center justify-center shrink-0 mt-0.5 border-white/5", benefit.color)}>
                        <benefit.icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold opacity-90 group-hover/item:text-[#D4AF37] transition-colors">{benefit.text}</p>
                        <div className="h-0.5 w-0 bg-[#D4AF37]/20 group-hover/item:w-full transition-all duration-500" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <div className="p-4 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Membership Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card border-white/5 bg-black/40 overflow-hidden relative h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent pointer-events-none" />
              <CardHeader className="p-8">
                <Sparkles className="h-8 w-8 text-[#D4AF37] mb-2 opacity-50" />
                <CardTitle className="text-2xl font-black uppercase tracking-widest opacity-50">Future Protocol</CardTitle>
                <CardDescription className="font-bold opacity-50 text-[10px] uppercase tracking-widest">Intelligence Staging</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                 <ul className="space-y-6">
                   {[
                     "Neural Decision Engines",
                     "Multi-Vault Biometric Lock",
                     "Algorithmic Debt Minimization+",
                     "Global Arbitrage Intelligence"
                   ].map((f, i) => (
                     <li key={i} className="flex items-center gap-4 opacity-30 group/f">
                       <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] group-hover/f:scale-150 transition-transform" />
                       <span className="text-xs font-black uppercase tracking-[0.2em]">{f}</span>
                     </li>
                   ))}
                 </ul>
                 <div className="pt-12">
                   <div className="p-6 rounded-3xl glass border-white/5 text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-[#D4AF37]/5 animate-pulse" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 relative z-10">Optimizing Performance</p>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-24 text-center space-y-4"
        >
          <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full glass border-[#D4AF37]/20">
            <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#D4AF37]/60">
              Validated Elite Tier
            </span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-muted-foreground/30">
            EST. 2024 • THE INNER CIRCLE
          </p>
        </motion.div>
      </main>
    </div>
  );
}
