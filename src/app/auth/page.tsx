
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, User as UserIcon, Loader2, CheckCircle2, RefreshCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { cn } from "@/lib/utils";
import Image from "next/image";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useStore();
  const auth = useAuth();
  const db = useFirestore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  // Standard background check for already logged-in users
  useEffect(() => {
    if (user && !loading && !verificationSent) {
      if (user.currency && user.name) {
        router.replace(redirectUrl);
      }
    }
  }, [user, router, redirectUrl, loading, verificationSent]);

  // Polling for email verification status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (verificationSent && auth?.currentUser && !isVerified) {
      interval = setInterval(async () => {
        try {
          await auth.currentUser?.reload();
          if (auth.currentUser?.emailVerified) {
            setIsVerified(true);
            toast({
              title: "Email Verified",
              description: "Thank you! You can now proceed with your account setup.",
            });
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error reloading user status:", error);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [verificationSent, auth, isVerified, toast]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    if (!email || !password || (isRegistering && !name)) {
      toast({ 
        variant: "destructive", 
        title: "Missing Fields", 
        description: "Please fill in all details." 
      });
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // 📧 Send Email Verification Link
        await sendEmailVerification(firebaseUser);

        await updateProfile(firebaseUser, { displayName: name });

        const userProfile = {
          uid: firebaseUser.uid,
          name: name,
          email: email,
          groupIds: [],
          currency: "", 
          notificationSettings: {
            masterEnabled: true,
            expenseAdded: true,
            settlementReminders: true
          }
        };

        await setDoc(doc(db, "users", firebaseUser.uid), userProfile);
        
        setVerificationSent(true);
        toast({ 
          title: "Verification Sent", 
          description: "Please check your inbox to verify your email address." 
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Check if email is verified on login
        if (!userCredential.user.emailVerified) {
          toast({
            variant: "default",
            title: "Check your email",
            description: "Your email isn't verified yet. Please check your inbox."
          });
        }

        toast({ title: "Welcome Back", description: "Successfully signed in." });
        router.replace(redirectUrl);
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: error.message || "An error occurred during sign in." 
      });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const userProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          groupIds: [],
          currency: "", 
        };
        await setDoc(userDocRef, userProfile);
        router.push("/profile/setup-name");
      } else {
        const data = userDoc.data();
        if (!data?.name) {
          router.push("/profile/setup-name");
        } else if (!data?.currency) {
          router.push("/profile/currency?setup=true");
        } else {
          toast({ title: "Welcome", description: "Successfully signed in with Google." });
          router.replace(redirectUrl);
        }
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      toast({ 
        variant: "destructive", 
        title: "Google Sign-In Failed", 
        description: error.message || "An error occurred during Google sign-in." 
      });
      setLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    toast({
      title: "Notice",
      description: "Apple sign-in is currently under maintenance. Please use Google or Email.",
    });
  };

  const handleManualCheck = async () => {
    if (!auth?.currentUser) return;
    setLoading(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setIsVerified(true);
        toast({ title: "Verified", description: "Email successfully verified." });
      } else {
        toast({ variant: "destructive", title: "Not verified yet", description: "Please check your email and click the link." });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500 px-4">
        <Card className="border-none shadow-2xl rounded-3xl p-8 text-center bg-card">
          <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-6">
            {isVerified ? (
              <CheckCircle2 className="h-10 w-10 text-green-500 animate-in zoom-in duration-500" />
            ) : (
              <Mail className="h-10 w-10 animate-pulse" />
            )}
          </div>
          <CardTitle className="font-headline text-2xl mb-2">
            {isVerified ? "Verification Complete" : "Verify your email"}
          </CardTitle>
          <CardDescription className="text-base mb-8">
            {isVerified ? (
              "Your email has been confirmed. You're all set to finish your profile!"
            ) : (
              <>We've sent a verification link to <span className="font-bold text-foreground">{email}</span>. Click the link in your email to enable the button below.</>
            )}
          </CardDescription>
          <div className="space-y-4">
            <Button 
              className={cn(
                "w-full h-14 rounded-2xl font-bold transition-all duration-500 shadow-lg",
                isVerified 
                  ? "bg-green-600 hover:bg-green-700 shadow-green-500/20 text-white" 
                  : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
              )}
              disabled={!isVerified}
              onClick={() => router.push("/profile/currency?setup=true")}
            >
              {isVerified ? "Continue to Setup" : "Waiting for Verification..."}
              {isVerified && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
            
            {!isVerified && (
              <button 
                onClick={handleManualCheck}
                disabled={loading}
                className="text-xs text-primary font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:opacity-80 disabled:opacity-50"
              >
                <RefreshCcw className={cn("h-3 w-3", loading && "animate-spin")} />
                Check Status Manually
              </button>
            )}

            <p className="text-xs text-muted-foreground pt-4">
              Check your spam folder if you don't see it in a few minutes.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 px-4">
      <div className="text-center">
        <div 
          className="inline-flex h-14 w-14 relative rounded-2xl overflow-hidden shadow-lg shadow-primary/20 bg-[#3D747F] mb-4 cursor-pointer transition-transform hover:scale-95"
          onClick={() => router.push("/")}
        >
          <Image src="/Logo.png" alt="Wisely Logo" fill className="object-cover" />
        </div>
        <h1 
          className="font-headline text-4xl font-bold text-primary mb-2 cursor-pointer transition-colors hover:text-primary/80" 
          onClick={() => router.push("/")}
        >
          Wisely
        </h1>
        <p className="text-muted-foreground">Master your money, personal or shared.</p>
      </div>

      <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="font-headline text-2xl">
            {isRegistering ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription>
            {isRegistering 
              ? "Join Wisely to start tracking your expenses." 
              : "Enter your credentials to access your dashboard."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className="pl-10 h-11 rounded-xl bg-muted/20 border-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email"
                  placeholder="name@example.com" 
                  className="pl-10 h-11 rounded-xl bg-muted/20 border-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••" 
                  className="pl-10 h-11 rounded-xl bg-muted/20 border-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button className="w-full bg-primary h-12 rounded-xl font-bold text-lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                isRegistering ? "Sign Up" : "Sign In"
              )}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-card px-2 text-muted-foreground/60">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl font-bold border-2 bg-transparent" 
              onClick={handleGoogleSignIn} 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
              )}
              Google
            </Button>

            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl font-bold border-2 bg-transparent" 
              onClick={handleAppleSignIn} 
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              Apple
            </Button>
          </div>

          <div className="text-center mt-4 pb-2">
            <button 
              type="button"
              className="text-sm text-primary hover:underline font-bold"
              onClick={() => setIsRegistering(!isRegistering)}
              disabled={loading}
            >
              {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
        Securely powered by Firebase.
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Suspense fallback={<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
