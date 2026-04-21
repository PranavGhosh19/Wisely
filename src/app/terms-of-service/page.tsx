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
            <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Last Updated: October 2024</p>
          </header>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-foreground/80 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">1. Agreement to Terms</h2>
              <p>By accessing or using Wisely (“Service”), you agree to be legally bound by these Terms of Service (“Terms”). If you do not agree, you must not use the Service.</p>
              <p>These Terms form a binding agreement between you (“User”, “you”) and the independent operator of Wisely (“Operator”, “we”, “us”).</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">2. Operator Identity</h2>
              <p>Wisely is operated by an independent individual developer and is not currently incorporated as a legal entity.</p>
              <div className="bg-muted/50 p-6 rounded-2xl border border-border/50">
                <p className="font-bold mb-2">By using the Service, you acknowledge that:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You are interacting with an independently operated product</li>
                  <li>No company, partnership, or corporation currently exists behind Wisely</li>
                </ul>
                <p className="mt-4 text-sm">
                  <strong>Operator:</strong> Pranav Ghosh<br />
                  <strong>Contact Email:</strong> contact@thewiselyapp.com
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">3. Eligibility</h2>
              <p>You must be at least 18 years old or the age of majority in your jurisdiction to use Wisely.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">4. Description of Service</h2>
              <p>Wisely is a financial tracking tool that allows users to record personal expenses, manage shared/group expenses, and view analytics and insights. Wisely does not provide financial, legal, or investment advice.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">5. User Accounts</h2>
              <p>You agree to provide accurate information, maintain the confidentiality of your account, and be responsible for all activity under your account. We reserve the right to suspend or terminate accounts for violations of these Terms.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">6. User Responsibilities</h2>
              <p>You agree NOT to use the Service for illegal purposes; attempt to hack, disrupt, or reverse engineer the platform; upload malicious code; or misuse group features or manipulate financial records. You are solely responsible for all data you input.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">7. Financial Disclaimer</h2>
              <p>Wisely is a self-service tool. All data is user-provided, and insights are algorithmic and may not be accurate. No financial decisions should rely solely on the Service. You use Wisely at your own risk.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">8. Group Features & Disputes</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Group expenses are created and managed by users.</li>
                <li>Wisely does not mediate or enforce payments.</li>
                <li>We are not responsible for disputes between users.</li>
              </ul>
              <p>All financial interactions are voluntary and user-driven.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">9. Intellectual Property</h2>
              <p>All rights to the Service—including code, design, branding, and features—are owned by the Operator. You are granted a limited, non-transferable license to use the Service.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">10. Service Availability</h2>
              <p>We do not guarantee continuous uptime, error-free operation, or permanent data storage. The Service may be modified, suspended, or discontinued at any time.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">11. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, the Operator shall not be personally liable for financial losses, data loss, incorrect analytics, user disputes, or indirect damages. The Service is provided “as is” without warranties of any kind.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">12. Indemnification</h2>
              <p>You agree to indemnify and hold harmless the Operator from any claims, damages, or disputes arising from your use of the Service, your violation of these Terms, or your interactions with other users.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">13. Termination</h2>
              <p>We may suspend or terminate access at any time if you violate these Terms, if required by law, or if necessary to protect the Service or other users.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">14. Governing Law</h2>
              <p>These Terms are governed by the laws of India. Jurisdiction: Courts of Gurgaon, Haryana.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">15. Changes to Terms</h2>
              <p>We may update these Terms at any time. Continued use of the Service constitutes acceptance of the updated Terms.</p>
            </section>

            <section className="border-t pt-8 mt-12">
              <h2 className="text-xl font-bold text-primary mb-2">16. Contact</h2>
              <p>
                <strong>Operator:</strong> Pranav Ghosh<br />
                <strong>Email:</strong> contact@thewiselyapp.com
              </p>
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
