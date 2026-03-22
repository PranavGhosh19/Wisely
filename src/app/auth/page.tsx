"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  onAuthStateChanged 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, ShieldCheck, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phone, setPhone] = useState("+1");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) return;
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast({ variant: "destructive", title: "Invalid Phone", description: "Please enter a valid phone number with country code." });
      return;
    }

    setLoading(true);
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(result);
      setStep("otp");
      toast({ title: "OTP Sent", description: "Verification code sent to your phone." });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send OTP." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          phone: user.phoneNumber,
          name: "New SpenseFlow User",
          groupIds: [],
          createdAt: Date.now()
        });
      }
      
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Verification Failed", description: "Invalid OTP code." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div id="recaptcha-container"></div>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold text-primary mb-2">SpenseFlow</h1>
          <p className="text-muted-foreground">Master your money, personal or shared.</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">
              {step === "phone" ? "Welcome" : "Verify code"}
            </CardTitle>
            <CardDescription>
              {step === "phone" 
                ? "Enter your phone number to sign in or create an account." 
                : `We've sent a 6-digit code to ${phone}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      placeholder="+1 (555) 000-0000" 
                      className="pl-10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full bg-primary" disabled={loading}>
                  {loading ? "Sending..." : "Send Verification Code"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="otp" 
                      placeholder="Enter 6-digit code" 
                      className="pl-10 tracking-[0.5em] text-center font-bold text-lg"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full bg-primary" disabled={loading}>
                  {loading ? "Verifying..." : "Confirm Code"}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => setStep("phone")}
                  type="button"
                >
                  Change phone number
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}