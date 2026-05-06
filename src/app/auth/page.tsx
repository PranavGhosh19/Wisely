
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, User as UserIcon, Loader2, CheckCircle2, RefreshCcw, ShieldCheck } from "lucide-react";
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
import { motion } from "framer-motion";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    if (isRegistering && !agreed) {
      toast({ variant: "destructive", title: "Action Required", description: "Agree to protocol terms." });
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user, { url: window.location.origin + "/auth" });
        await updateProfile(userCredential.user, { displayName: name });
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: name,
          email: email,
          groupIds: [],
          notificationSettings: { masterEnabled: true }
        });
        setVerificationSent(true);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user.emailVerified) router.replace(redirectUrl);
        else setVerificationSent(true);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Access Denied", description: error.message });
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
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          name: result.user.displayName || "Peer",
          email: result.user.email || "",
          groupIds: [],
        });
        router.push("/profile/setup-name");
      } else {
        router.replace(redirectUrl);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md space-y-8"
    >
      <div className="text-center space-y-2">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl mx-auto glow-primary mb-6"
        >
          W
        </motion.div>
        <h1 className="text-4xl font-black text-glow tracking-tighter uppercase">Entrance Portal</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Secure Vault Handshake</p>
      </div>

      <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-lg font-black uppercase tracking-[0.2em]">{isRegistering ? "Initialize identity" : "Authorized login"}</CardTitle>
          <CardDescription className="text-[9px] uppercase font-bold tracking-widest">Provide credentials for ledger access</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Identity name</Label>
                <Input placeholder="JOHN DOE" className="h-12 rounded-xl glass border-white/5 text-xs font-black uppercase" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Comms channel</Label>
              <Input type="email" placeholder="NAME@NETWORK.COM" className="h-12 rounded-xl glass border-white/5 text-xs font-black uppercase" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Access token</Label>
              <Input type="password" placeholder="••••••••" className="h-12 rounded-xl glass border-white/5" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {isRegistering && (
              <div className="flex items-center gap-2 py-2">
                <Checkbox id="terms" checked={agreed} onCheckedChange={(c) => setAgreed(c as boolean)} className="border-white/20" />
                <label htmlFor="terms" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Accept protocol terms</label>
              </div>
            )}

            <Button className="w-full h-12 rounded-2xl bg-primary glow-primary font-black uppercase tracking-widest text-[10px]" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (isRegistering ? "Register identity" : "Establish session")}
            </Button>
          </form>

          <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div><div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.5em]"><span className="bg-background px-4 text-muted-foreground">Cross-Sync</span></div></div>

          <Button variant="ghost" className="w-full h-12 rounded-2xl glass border-white/5 font-black uppercase tracking-widest text-[10px] gap-3" onClick={handleGoogleSignIn} disabled={loading}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.75c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google OAuth
          </Button>

          <div className="text-center mt-4">
            <button type="button" className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-glow" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Existing node? Sign in" : "New node? Initialize identity"}
            </button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center gap-6 opacity-20">
         <ShieldCheck className="h-6 w-6" />
         <Zap className="h-6 w-6" />
      </div>
    </motion.div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background px-4 no-scrollbar">
      <Suspense fallback={null}><AuthContent /></Suspense>
    </div>
  );
}
