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
  Zap
} from "lucide-react";
import { LoadingScreen } from "@/components/layout/loading-screen";

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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-md">W</div>
            <span className="font-headline text-xl font-bold text-primary">Wisely</span>
          </div>
          <div className="hidden md:flex items-center gap-8 px-8">
            <Link href="/features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="/compare" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Why Wisely?</Link>
            <Link href="/how-it-works/split-logic" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Split Logic</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:flex rounded-xl font-bold">
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild className="rounded-xl font-bold h-10 px-6 shadow-lg shadow-primary/20">
              <Link href="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-background">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-8xl font-black font-headline text-primary tracking-tighter leading-[0.9]">
              Wisely – Expense Splitting & Budgeting App <br />
              <span className="text-accent">Personal or Shared.</span>
            </h1>
            <p className="sr-only">
              Wisely is an expense splitting and budgeting app that helps individuals and groups track spending, split bills, and manage finances easily.
            </p>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Consolidate your financial life. Track private expenses, split shared costs, and see the whole picture in one clean vault.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button asChild size="lg" className="h-16 px-12 rounded-3xl font-bold text-xl shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                <Link href="/auth">
                  Start Tracking Free
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-10 rounded-3xl font-bold text-lg border-2 border-primary/20 hover:border-primary/50 transition-colors">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </section>

      {/* Features Preview Section */}
      <section id="features" className="py-24 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black font-headline text-primary tracking-tight">Financial Mastery Suite</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">Powerful tools designed for visibility, speed, and precision.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Wallet,
                title: "Personal Vault",
                desc: "Track every morning coffee and bill. Private, secure, and entirely your own.",
                link: "/features"
              },
              {
                icon: Users,
                title: "Shared Groups",
                desc: "Splitting rent, trips, or groceries has never been this mathematically clean.",
                link: "/how-it-works/split-logic"
              },
              {
                icon: BarChart3,
                title: "Automated Analysis",
                desc: "Our analyst widget surfaces spending patterns and alerts you before you overspend.",
                link: "/how-it-works/analytics"
              }
            ].map((f, i) => (
              <div key={i} className="flex flex-col p-8 rounded-[2.5rem] bg-card border border-border shadow-sm group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold font-headline mb-4">{f.title}</h3>
                <p className="text-muted-foreground mb-8 flex-1">{f.desc}</p>
                <Link href={f.link} className="inline-flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest hover:gap-3 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Comparison Section */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-[3.5rem] p-10 md:p-20 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
               <div className="flex-1 space-y-8">
                 <h2 className="text-4xl md:text-6xl font-black font-headline leading-none">Built different. Built better.</h2>
                 <p className="text-xl opacity-80 leading-relaxed">
                   Why juggle Splitwise for groups and Mint for yourself? Wisely is the first unified financial ledger that handles your entire economic life.
                 </p>
                 <div className="flex flex-wrap gap-4">
                   <Button asChild variant="secondary" size="lg" className="rounded-2xl font-bold h-14">
                     <Link href="/compare">See the Comparison</Link>
                   </Button>
                   <div className="flex items-center gap-2 text-sm font-bold opacity-60 px-4">
                     <ShieldCheck className="h-5 w-5" />
                     No Data Selling. Guaranteed.
                   </div>
                 </div>
               </div>
               <div className="flex-1 w-full max-w-md">
                 <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 space-y-6">
                   <div className="flex items-center justify-between border-b border-white/10 pb-4">
                     <span className="font-bold">Privacy Controls</span>
                     <div className="h-5 w-10 bg-accent rounded-full flex items-center px-1">
                        <div className="h-3 w-3 bg-primary rounded-full translate-x-5" />
                     </div>
                   </div>
                   <div className="flex items-center justify-between border-b border-white/10 pb-4">
                     <span className="font-bold">Offline Sync</span>
                     <div className="h-5 w-10 bg-accent rounded-full flex items-center px-1">
                        <div className="h-3 w-3 bg-primary rounded-full translate-x-5" />
                     </div>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="font-bold">Multi-Member Logic</span>
                     <div className="h-5 w-10 bg-accent rounded-full flex items-center px-1">
                        <div className="h-3 w-3 bg-primary rounded-full translate-x-5" />
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-primary font-headline tracking-tight">
            Stop guessing where your money went.
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Wisely is designed for modern users who want a simple way to split expenses with friends, track personal spending, and manage group finances without confusion. Our automated "Analyst" and smart settlement engine take the stress out of money management.
          </p>
          <div className="flex justify-center gap-12 pt-8 opacity-40 grayscale filter hover:grayscale-0 transition-all duration-700 overflow-hidden">
             <div className="flex items-center gap-2 font-black text-2xl"><ShieldCheck className="h-8 w-8" /> SECURE</div>
             <div className="flex items-center gap-2 font-black text-2xl"><Zap className="h-8 w-8" /> FAST</div>
             <div className="flex items-center gap-2 font-black text-2xl"><Users className="h-8 w-8" /> SHARED</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold">W</div>
                <span className="font-headline font-bold text-2xl text-primary">Wisely</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left">
                The unified financial ledger for your personal and social life.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-4 text-center md:text-left">
                <h4 className="font-black text-xs uppercase tracking-widest text-primary">Product</h4>
                <ul className="space-y-2 text-sm font-bold text-muted-foreground">
                  <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                  <li><Link href="/how-it-works/split-logic" className="hover:text-primary transition-colors">Split Logic</Link></li>
                  <li><Link href="/how-it-works/analytics" className="hover:text-primary transition-colors">Analytics</Link></li>
                </ul>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h4 className="font-black text-xs uppercase tracking-widest text-primary">Compare</h4>
                <ul className="space-y-2 text-sm font-bold text-muted-foreground">
                  <li><Link href="/compare" className="hover:text-primary transition-colors">Why Wisely?</Link></li>
                  <li><Link href="/auth" className="hover:text-primary transition-colors">Switching Guide</Link></li>
                </ul>
              </div>
              <div className="hidden md:block space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-primary">Support</h4>
                <ul className="space-y-2 text-sm font-bold text-muted-foreground">
                  <li><Link href="/help-center" className="hover:text-primary transition-colors">Help Center</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
            <p>© 2026 The Wisely App.</p>
            <div className="flex gap-8">
              <Link href="/help-center">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
