"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl font-bold gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </nav>

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black font-headline text-primary mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Effective Date: October 24, 2024</p>
          </header>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">1. Agreement to Terms</h2>
              <p>By accessing or using Wisely (“the Service”), you agree to be legally bound by these Terms of Service (“Terms”). If you do not agree, you must not use the Service.</p>
              <p>These Terms constitute a binding agreement between you (“User,” “you”) and Wisely (“Company,” “we,” “us,” or “our”).</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">2. Eligibility</h2>
              <p>You must be at least 18 years old or the age of majority in your jurisdiction to use Wisely. By using the Service, you represent and warrant that you meet this requirement.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">3. Description of Service</h2>
              <p>Wisely is a financial management platform designed to track personal and group expenses, provide financial insights and analytics, and facilitate shared expense management and settlements.</p>
              <p>We do not provide financial, legal, or investment advice. Any insights generated are informational only.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">4. User Accounts</h2>
              <p>You agree to provide accurate information, maintain confidentiality of credentials, and accept responsibility for all activities under your account. We reserve the right to suspend accounts for violations or fraudulent activity.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">5. Data & Privacy</h2>
              <p>Your use of Wisely is governed by our Privacy Policy. You retain ownership of your data but grant us a limited license to process it to provide the Service. We implement industry-standard security measures.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">6. Financial Disclaimer</h2>
              <p>Wisely does not store bank credentials unless explicitly stated and does not execute financial transactions. Financial decisions based on Wisely are made at your own risk.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">7. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts located in India.</p>
            </section>

            <section className="border-t pt-8 mt-12">
              <h2 className="text-xl font-bold text-primary mb-2">Contact Us</h2>
              <p>For questions regarding these Terms, contact:<br />
              <strong>Email:</strong> contact@thewiselyapp.com<br />
              <strong>Company:</strong> Wisely</p>
            </section>
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
