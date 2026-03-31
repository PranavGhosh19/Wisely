"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Wallet, 
  Users, 
  PieChart, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const { user, isLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="font-medium text-muted-foreground animate-pulse">Loading Wisely...</p>
        </div>
      </div>
    );
  }

  const heroImage = PlaceHolderImages.find(img => img.id === "landing-hero");
  const personalImage = PlaceHolderImages.find(img => img.id === "feature-personal");
  const groupImage = PlaceHolderImages.find(img => img.id === "feature-group");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-md">W</div>
            <span className="font-headline text-xl font-bold text-primary">Wisely</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:flex rounded-xl font-bold">
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild className="rounded-xl font-bold h-10 px-6">
              <Link href="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-background">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Smartphone className="h-4 w-4" />
              Now Available as a PWA
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-headline text-primary tracking-tight leading-tight">
              Master Your Money, <br />
              <span className="text-accent">Personal or Shared.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tracking expenses shouldn't be a chore. Whether you're budgeting for yourself or splitting rent with friends, Wisely makes it seamless.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="h-14 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105">
                <Link href="/auth">
                  Start Tracking Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-10 rounded-2xl font-bold text-lg border-2">
                <Link href="#features">See How it Works</Link>
              </Button>
            </div>
          </div>

          <div className="mt-20 relative max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl border-8 border-card">
            {heroImage && (
              <Image 
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={1200}
                height={800}
                data-ai-hint={heroImage.imageHint}
                className="w-full object-cover"
              />
            )}
          </div>
        </div>
        
        <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Everything you need to stay on track</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Powerful features designed to give you complete visibility over your financial life.</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold font-headline">Smart Personal Budgeting</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Categorize your spending automatically and see where your money goes. Set custom categories and track your daily habits with ease.
              </p>
              <ul className="space-y-3">
                {["Unlimited personal categories", "Real-time spending alerts", "Monthly budget goals", "Secure receipt storage"].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-medium text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5">
              {personalImage && (
                <Image 
                  src={personalImage.imageUrl}
                  alt={personalImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={personalImage.imageHint}
                  className="w-full hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 items-center mt-32">
            <div className="lg:order-2 space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold font-headline">Seamless Group Splits</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Perfect for roommates, trips, and dinners. No more awkward "who owes who" conversations. Just add the bill and let Wisely handle the math.
              </p>
              <ul className="space-y-3">
                {["Instant QR code invites", "Multiple split methods", "Settlement tracking", "Group balance summaries"].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-medium text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-1 rounded-3xl overflow-hidden shadow-xl border border-white/5">
              {groupImage && (
                <Image 
                  src={groupImage.imageUrl}
                  alt={groupImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={groupImage.imageHint}
                  className="w-full hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Analytics CTA */}
      <section className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <PieChart className="h-16 w-16 mx-auto opacity-50" />
            <h2 className="text-4xl md:text-5xl font-bold font-headline">Insights that actually matter</h2>
            <p className="text-lg opacity-80 max-w-xl mx-auto">
              Visual analytics help you identify patterns and optimize your spending. It's not just data, it's your financial freedom.
            </p>
            <Button asChild size="lg" variant="secondary" className="h-14 px-10 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-transform">
              <Link href="/auth">Get Started Today</Link>
            </Button>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: ShieldCheck, 
                title: "Bank-Level Security", 
                desc: "Your data is encrypted and protected with industry-standard protocols." 
              },
              { 
                icon: Smartphone, 
                title: "Works Offline", 
                desc: "Tracking expenses on the go even without an internet connection." 
              },
              { 
                icon: Users, 
                title: "Built for Privacy", 
                desc: "We don't sell your data. Your financial life is your business." 
              }
            ].map((feature, i) => (
              <div key={i} className="space-y-4 p-8 rounded-3xl bg-card border border-white/5 shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold font-headline">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center text-white text-[11px] font-bold">W</div>
              <span className="font-headline font-bold text-primary">Wisely</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 Wisely Finance. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
              <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">Privacy</Link>
              <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
