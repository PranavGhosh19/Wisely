
"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, ShieldCheck, Trophy, Crown, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function WiselyClubPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-5xl mx-auto w-full relative">
        {/* Background Ambient Glow */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] -z-10 rounded-full" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 rounded-full" />

        <motion.header 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 text-center space-y-6 pt-12"
        >
          <Button 
            variant="ghost" 
            className="mb-8 text-muted-foreground hover:text-primary gap-2 px-4 rounded-full glass"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Control Center
          </Button>
          
          <div className="relative inline-block group">
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border border-[#D4AF37]/20 rounded-full border-dashed" 
            />
            <div className="h-24 w-24 glass rounded-[2.5rem] flex items-center justify-center text-[#D4AF37] relative z-10 shadow-[0_0_50px_rgba(212,175,55,0.2)] border-[#D4AF37]/30">
              <Crown className="h-12 w-12" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#D4AF37] leading-none">
              THE CLUB
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[1em] text-[#D4AF37]/60">
              Exclusive High-End Performance
            </p>
          </div>
        </motion.header>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-[#D4AF37]/20 overflow-hidden group hover:scale-[1.02] transition-all duration-700">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
              <CardHeader className="pb-6 border-b border-white/5">
                <Trophy className="h-8 w-8 text-[#D4AF37] mb-2 animate-bounce" />
                <CardTitle className="text-2xl font-black uppercase tracking-widest">Founding Tier</CardTitle>
                <CardDescription className="font-bold">STATUS: AUTHORIZED</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  {[
                    { icon: ShieldCheck, text: "Zero-latency priority updates.", color: "text-emerald-500" },
                    { icon: Zap, text: "Exclusive high-contrast HUD themes.", color: "text-blue-500" },
                    { icon: Sparkles, text: "Advanced algorithmic spending alerts.", color: "text-[#D4AF37]" }
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={cn("h-6 w-6 rounded-full glass flex items-center justify-center shrink-0 mt-1", benefit.color)}>
                        <benefit.icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-bold opacity-80">{benefit.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-white/5 bg-black/40 overflow-hidden relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              <CardHeader className="p-8">
                <Sparkles className="h-8 w-8 text-[#D4AF37] mb-2 opacity-50" />
                <CardTitle className="text-2xl font-black uppercase tracking-widest opacity-50">Future Protocol</CardTitle>
                <CardDescription className="font-bold opacity-50">STAGING / BETA</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                 <ul className="space-y-4">
                   {["Neural Network Analysis", "Biometric Vault Access", "Universal Currency Swaps"].map((f, i) => (
                     <li key={i} className="flex items-center gap-3 opacity-40">
                       <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                       <span className="text-xs font-black uppercase tracking-widest">{f}</span>
                     </li>
                   ))}
                 </ul>
                 <div className="pt-8">
                   <div className="p-4 rounded-2xl glass border-white/5 text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">In Development</p>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#D4AF37]/40">
            EST. 2024 • THE INNER CIRCLE
          </p>
        </motion.div>
      </main>
    </div>
  );
}
