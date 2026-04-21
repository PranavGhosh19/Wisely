"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl md:text-5xl font-black font-headline text-primary mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Last Updated: October 2024</p>
          </header>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-foreground/80 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">1. Introduction</h2>
              <p>This Privacy Policy explains how Wisely collects, uses, and protects your data. By using the Service, you agree to this policy.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">2. Data Controller</h2>
              <p>The data controller is the independent Operator of Wisely.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">3. Information We Collect</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-foreground mb-2">3.1 Information You Provide</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Name and email address</li>
                    <li>Expense data (amounts, categories, dates)</li>
                    <li>Group data and participant identifiers</li>
                    <li>User inputs and optional notes</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-foreground mb-2">3.2 Automatically Collected</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Device and browser information</li>
                    <li>IP address</li>
                    <li>Usage logs and activity patterns</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-foreground mb-2">3.3 Derived Data</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Spending insights and trends</li>
                    <li>Aggregated, anonymized analytics</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">4. How We Use Data</h2>
              <p>We use your data to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide and improve the Service features</li>
                <li>Enable seamless expense tracking and group collaboration</li>
                <li>Generate personalized financial analytics and insights</li>
                <li>Maintain platform security and prevent fraudulent abuse</li>
              </ul>
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <p className="font-bold text-primary">Zero-Ads Policy: We do not sell your personal data to advertisers or third parties.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">5. Third-Party Services</h2>
              <p>Wisely relies on trusted third-party providers (like Google/Firebase) for Hosting, Authentication, Analytics, and Notifications. Your data may be processed by these providers only to the extent necessary to enable the Service.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">6. Data Sharing</h2>
              <p>We may share data:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>With members of groups you join (limited to your activity within those groups)</li>
                <li>With essential service providers</li>
                <li>If explicitly required by legal authorities or law</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">7. Data Retention</h2>
              <p>We retain your data as long as your account is active or as needed for operational purposes. You may request data deletion at any time through the profile settings or via email contact.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">8. Data Security</h2>
              <p>We use industry-standard protections, including TLS/SSL encryption in transit and secure database infrastructure. While we strive for maximum protection, no digital system is completely impenetrable.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">9. Your Rights</h2>
              <p>You have the right to access your data, request corrections, request deletion, or withdraw your consent for processing.</p>
              <p>Contact: <strong>contact@thewiselyapp.com</strong></p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">10. Children’s Privacy</h2>
              <p>The Service is not intended for or marketed to individuals under the age of 18.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">11. Cookies & Tracking</h2>
              <p>We use essential cookies for session management and analytics to improve performance. You can manage cookie preferences through your browser settings.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">12. International Data Transfers</h2>
              <p>Your data may be stored or processed in regions outside your home country (specifically on Google Cloud/Firebase servers) with rigorous technical safeguards.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">13. Compliance</h2>
              <p>This policy is designed to align with the <strong>Indian Digital Personal Data Protection Act (DPDP Act, 2023)</strong> and recognized global privacy standards.</p>
            </section>

            <section className="border-t pt-8 mt-12">
              <h2 className="text-xl font-bold text-primary mb-2">14. Contact</h2>
              <p>
                <strong>Operator:</strong> Pranav Ghosh<br />
                <strong>Email:</strong> contact@thewiselyapp.com
              </p>
            </section>

            <div className="pt-8 border-t">
              <p className="text-sm font-bold text-primary">Final Acknowledgment</p>
              <p className="text-xs text-muted-foreground mt-2">By using Wisely, you confirm that you have read, understood, and agreed to both the Terms of Service and Privacy Policy.</p>
            </div>
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
