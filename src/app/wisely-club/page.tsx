
"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, ShieldCheck, Trophy, Crown, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function WiselyClubPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-4xl mx-auto w-full">
        <header className="mb-12">
          <Button 
            variant="ghost" 
            className="mb-4 -ml-2 text-muted-foreground hover:text-primary gap-2 px-2"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#D4AF37]/10 text-[#D4AF37] mb-2 shadow-2xl shadow-[#D4AF37]/20 border border-[#D4AF37]/20">
              <Crown className="h-10 w-10" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-[#D4AF37]">
              The Wisely Club
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Welcome to the inner circle. Exclusive benefits for our most dedicated financial masters.
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-xl bg-card rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
            <CardHeader className="bg-[#D4AF37]/5 pb-6 border-b border-[#D4AF37]/10">
              <Trophy className="h-8 w-8 text-[#D4AF37] mb-2" />
              <CardTitle className="text-2xl font-bold font-headline">Status: Active</CardTitle>
              <CardDescription>You are a founding member of the club.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-1">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium">Early access to all premium features as they launch.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 mt-1">
                    <Zap className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium">Custom branding and unique "Gold" UI elements.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-[#07161B] text-white rounded-[2.5rem] overflow-hidden relative group">
            <div className="absolute top-0 right-0 h-40 w-40 bg-[#D4AF37]/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
            <CardHeader className="p-8">
              <Sparkles className="h-8 w-8 text-[#D4AF37] mb-2" />
              <CardTitle className="text-2xl font-bold font-headline">Coming Soon</CardTitle>
              <CardDescription className="text-white/60">Advanced club features in development.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
               <ul className="space-y-4 text-sm font-medium">
                 <li className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                   Deep Portfolio Analysis
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                   Custom Category Icons
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                   Unlimited Group Vaults
                 </li>
               </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]/60">
            Est. 2024 • Built for Excellence
          </p>
        </div>
      </main>
    </div>
  );
}
