
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, User as UserIcon, Loader2, Globe } from "lucide-react";
import { useStore } from "@/lib/store";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CURRENCIES = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "INR", label: "Indian Rupee (₹)" },
];

export default function AuthPage() {
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
  
  // Currency selection state
  const [showCurrencyStep, setShowCurrencyStep] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [pendingUserUid, setPendingUserUid] = useState<string | null>(null);

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    // Only redirect if the user is authenticated AND we aren't showing the currency step
    if (user && !showCurrencyStep) {
      router.replace(redirectUrl);
    }
  }, [user, router, redirectUrl, showCurrencyStep]);

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

        await updateProfile(firebaseUser, { displayName: name });

        const userProfile = {
          uid: firebaseUser.uid,
          name: name,
          email: email,
          groupIds: [],
          currency: "USD", // Initial default
        };

        await setDoc(doc(db, "users", firebaseUser.uid), userProfile);
        
        // Show currency selection for new users
        setPendingUserUid(firebaseUser.uid);
        setShowCurrencyStep(true);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome Back", description: "Successfully signed in." });
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: error.message || "An error occurred during sign in." 
      });
    } finally {
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
          name: firebaseUser.displayName || "Google User",
          email: firebaseUser.email || "",
          groupIds: [],
          currency: "USD",
        };
        await setDoc(userDocRef, userProfile);
        
        // Show currency selection for new Google users
        setPendingUserUid(firebaseUser.uid);
        setShowCurrencyStep(true);
      } else {
        toast({ title: "Welcome", description: "Successfully signed in with Google." });
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      toast({ 
        variant: "destructive", 
        title: "Google Sign-In Failed", 
        description: error.message || "An error occurred during Google sign-in." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrency = async () => {
    if (!db || !pendingUserUid) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", pendingUserUid), {
        currency: selectedCurrency
      });
      toast({ title: "Preferences Saved", description: `Default currency set to ${selectedCurrency}.` });
      setShowCurrencyStep(false);
      // The useEffect will now trigger redirect as showCurrencyStep becomes false and user exists
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not save currency preference." });
    } finally {
      setLoading(false);
    }
  };

  if (showCurrencyStep) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8">
          <Card className="border-none shadow-lg rounded-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <CardTitle className="font-headline text-2xl">Choose Your Currency</CardTitle>
              <CardDescription>
                Select the default currency for your personal and shared expenses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger id="currency" className="h-11 rounded-xl">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSetCurrency} className="w-full bg-primary h-11 rounded-xl font-bold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Finish Setup"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 
            className="font-headline text-4xl font-bold text-primary mb-2 cursor-pointer transition-transform hover:scale-95" 
            onClick={() => router.push("/")}
          >
            Wisely
          </h1>
          <p className="text-muted-foreground">Master your money, personal or shared.</p>
        </div>

        <Card className="border-none shadow-lg rounded-2xl">
          <CardHeader>
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
                      className="pl-10 h-11 rounded-xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
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
                    className="pl-10 h-11 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
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
                    className="pl-10 h-11 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button className="w-full bg-primary h-11 rounded-xl font-bold" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  isRegistering ? "Sign Up" : "Sign In"
                )}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl font-bold border-2" 
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

            <div className="text-center mt-4">
              <button 
                type="button"
                className="text-sm text-primary hover:underline font-medium"
                onClick={() => setIsRegistering(!isRegistering)}
                disabled={loading}
              >
                {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Securely powered by Firebase.
        </p>
      </div>
    </div>
  );
}
