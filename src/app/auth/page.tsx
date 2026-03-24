"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, User as UserIcon } from "lucide-react";
import { useStore } from "@/lib/store";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setUser, user } = useStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !name)) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all details." });
      return;
    }

    setLoading(true);
    // Simulating "In-Memory" Auth for prototype purposes
    setTimeout(() => {
      const mockUser = {
        uid: Math.random().toString(36).substr(2, 9),
        name: isRegistering ? name : email.split('@')[0],
        email: email,
        groupIds: [],
      };
      
      setUser(mockUser);
      toast({ title: isRegistering ? "Account Created" : "Welcome Back", description: `Signed in as ${mockUser.email}` });
      setLoading(false);
      // Redirection is handled by the useEffect above
    }, 800);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold text-primary mb-2 cursor-pointer" onClick={() => router.push("/")}>Wisely</h1>
          <p className="text-muted-foreground">Master your money, personal or shared.</p>
        </div>

        <Card className="border-none shadow-lg">
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
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full bg-primary" disabled={loading}>
                {loading ? "Please wait..." : (isRegistering ? "Sign Up" : "Sign In")}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <div className="text-center mt-4">
                <button 
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Note: This is an in-memory demo. Data will reset on refresh.
        </p>
      </div>
    </div>
  );
}
