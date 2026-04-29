"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  sendEmailVerification,
  applyActionCode
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Firebase Email Verification (oobCode) from redirects
  useEffect(() => {
    if (mode === "verifyEmail" && oobCode && auth && mounted) {
      setLoading(true);
      applyActionCode(auth, oobCode)
        .then(() => {
          setIsVerified(true);
          setVerificationSent(true);
          toast({
            title: "Email Verified",
            description: "Your account has been confirmed! You can now finish your setup.",
          });
        })
        .catch((error: any) => {
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: error.message || "The verification link may have expired.",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mode, oobCode, auth, mounted, toast]);

  // Regular verification check interval
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
              description: "Account confirmed! You can now finish your setup.",
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
    
    if (isRegistering && !agreed) {
      toast({ variant: "destructive", title: "Action Required", description: "Please agree to the Terms and Privacy Policy." });
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        await sendEmailVerification(firebaseUser, {
          url: window.location.origin + "/auth",
          handleCodeInApp: false,
        });

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
        setLoading(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user.emailVerified) {
          router.replace(redirectUrl);
        } else {
          setVerificationSent(true);
          setLoading(false);
        }
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Auth Error", 
        description: error.message 
      });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    if (isRegistering && !agreed) {
      toast({ variant: "destructive", title: "Action Required", description: "Please agree to the Terms and Privacy Policy." });
      return;
    }

    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          groupIds: [],
          currency: "", 
        });
        router.push("/profile/setup-name");
      } else {
        router.replace(redirectUrl);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign-In Failed", description: error.message });
      setLoading(false);
    }
  };

  const handleManualCheck = async () => {
    if (!auth?.currentUser) return;
    setLoading(true);
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      setIsVerified(true);
      toast({ title: "Success", description: "Email verified." });
    } else {
      toast({ variant: "destructive", title: "Pending", description: "Still waiting for confirmation..." });
    }
    setLoading(false);
  };

  if (!mounted) return null;

  if (verificationSent) {
    return (
      <div className="w-full max-w-md animate-in fade-in duration-500">
        <Card className="border-none shadow-xl rounded-[2.5rem] p-8 text-center bg-card">
          <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
            {isVerified ? (
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            ) : (
              <Mail className="h-10 w-10 animate-pulse" />
            )}
          </div>
          <CardTitle className="font-headline text-2xl mb-2">
            {isVerified ? "Verified!" : "Confirm your email"}
          </CardTitle>
          <CardDescription className="text-base mb-8">
            {isVerified ? (
              "Email confirmed. Let's finish your profile."
            ) : (
              <>We've sent a link to <span className="font-bold text-foreground">{email}</span>. Please click it to continue.</>
            )}
          </CardDescription>
          <div className="space-y-4">
            <Button 
              className={cn(
                "w-full h-14 rounded-2xl font-bold transition-all duration-500",
                isVerified 
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20" 
                  : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
              )}
              disabled={!isVerified}
              onClick={() => router.push("/profile/currency?setup=true")}
            >
              {isVerified ? "Continue to Setup" : "Waiting for Verification..."}
              {isVerified && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
            
            {!isVerified && (
              <button onClick={handleManualCheck} className="text-xs text-primary font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                <RefreshCcw className={cn("h-3 w-3", loading && "animate-spin")} />
                Check Manually
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold text-primary mb-2 cursor-pointer" onClick={() => router.push("/")}>
          Wisely
        </h1>
        <p className="text-muted-foreground">Master your money, personal or shared.</p>
      </div>

      <Card className="border-none shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{isRegistering ? "Create Account" : "Sign In"}</CardTitle>
          <CardDescription>Enter your details to access Wisely.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="name" placeholder="John Doe" className="pl-10 h-11 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="name@example.com" className="pl-10 h-11 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-11 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            {isRegistering && (
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="terms" 
                  checked={agreed} 
                  onCheckedChange={(checked) => setAgreed(checked as boolean)} 
                />
                <label
                  htmlFor="terms"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                >
                  I agree to the{" "}
                  <Link href="/terms-of-service" className="text-primary hover:underline font-bold">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy-policy" className="text-primary hover:underline font-bold">Privacy Policy</Link>.
                </label>
              </div>
            )}

            <Button 
              className="w-full bg-primary h-11 rounded-xl font-bold" 
              disabled={loading || (isRegistering && !agreed)}
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : (isRegistering ? "Sign Up" : "Sign In")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-11 rounded-xl font-bold border-2 gap-2" 
            onClick={handleGoogleSignIn} 
            disabled={loading || (isRegistering && !agreed)}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.75c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="text-center mt-4">
            <button type="button" className="text-sm text-primary hover:underline font-medium" onClick={() => {
              setIsRegistering(!isRegistering);
              setAgreed(false);
            }}>
              {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={<Loader2 className="animate-spin text-primary" />}><AuthContent /></Suspense>
    </div>
  );
}
