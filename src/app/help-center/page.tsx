"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MessageCircle, ShieldQuestion } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function HelpCenterPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely Support</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl font-bold gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-12 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="text-center mb-16 space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <ShieldQuestion className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight">How can we help?</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              We're here to ensure your financial tracking is seamless. Reach out to us through any of the channels below.
            </p>
          </header>

          <div className="grid gap-6">
            <Card className="border-none shadow-xl rounded-[2rem] bg-card overflow-hidden group hover:scale-[1.01] transition-transform">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                    <Mail className="h-10 w-10" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-2xl font-bold font-headline text-foreground">Email Support</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      For technical issues, account queries, or partnership requests, please email us directly. We typically respond within 24 hours.
                    </p>
                    <div className="pt-4">
                      <a 
                        href="mailto:contact@thewiselyapp.com" 
                        className="text-xl md:text-2xl font-black text-primary hover:underline underline-offset-4"
                      >
                        contact@thewiselyapp.com
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <Link href="/terms-of-service" className="block group">
                <div className="p-6 rounded-[1.5rem] bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors h-full">
                  <h3 className="font-bold text-lg mb-2">Terms of Service</h3>
                  <p className="text-sm text-muted-foreground">Understand the legal framework of using our financial tools.</p>
                </div>
              </Link>
              <Link href="/privacy-policy" className="block group">
                <div className="p-6 rounded-[1.5rem] bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors h-full">
                  <h3 className="font-bold text-lg mb-2">Privacy Policy</h3>
                  <p className="text-sm text-muted-foreground">How we safeguard your data and respect your personal vault.</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-24 p-12 rounded-[3rem] bg-primary text-primary-foreground text-center space-y-6 shadow-2xl shadow-primary/20">
            <h3 className="text-2xl font-bold font-headline">Built with care for your clarity.</h3>
            <p className="opacity-80 max-w-md mx-auto font-medium">
              Wisely is an independently operated tool focused on simplicity and privacy.
            </p>
            <Button asChild variant="secondary" className="h-12 px-8 rounded-xl font-bold">
              <Link href="/auth">Open Your Vault</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">© 2024 Wisely Finance • Master your money</p>
        </div>
      </footer>
    </div>
  );
}
