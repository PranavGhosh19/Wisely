"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { 
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useStore();
  const auth = useAuth();
  const db = useFirestore();
  
  const [loading, setLoading] = useState(false);
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (user && !loading) {
      if (user.currency && user.name) {
        router.replace(redirectUrl);
      }
    }
  }, [user, router, redirectUrl, loading]);

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

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 
          className="font-headline text-4xl font-bold text-primary mb-2 cursor-pointer transition-colors hover:text-primary/80" 
          onClick={() => router.push("/")}
        >
          Wisely
        </h1>
        <p className="text-muted-foreground">Master your money, personal or shared.</p>
      </div>

      <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10 py-8">
          <CardTitle className="font-headline text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Access your dashboard securely with your Google account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95" 
            onClick={handleGoogleSignIn} 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
            ) : (
              <svg className="mr-3 h-6 w-6" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="flex items-center justify-center gap-2">
            <div className="h-1 w-1 bg-muted-foreground rounded-full opacity-30" />
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Safe & Secure
            </p>
            <div className="h-1 w-1 bg-muted-foreground rounded-full opacity-30" />
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center text-xs text-muted-foreground">
        Securely powered by Firebase.
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />}>
        <AuthContent />
      </Suspense>
    </div>
  );
}