
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Moon, 
  Sun, 
  Monitor, 
  LogOut, 
  ChevronRight,
  Shield,
  Bell,
  Tag,
  Plus,
  Trash2,
  Smartphone,
  Share2,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, logout, categories, addCategory, removeCategory, installPrompt, setInstallPrompt } = useStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    setMounted(true);
    if (!user) router.push("/auth");
  }, [user, router]);

  if (!mounted || !user) return null;

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    logout();
    router.push("/auth");
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    if (categories.includes(newCategory.trim())) {
      toast({
        variant: "destructive",
        title: "Already exists",
        description: "This category is already in your list."
      });
      return;
    }

    addCategory(newCategory.trim());
    setNewCategory("");
    toast({
      title: "Category added",
      description: `"${newCategory.trim()}" is now available for your expenses.`
    });
  };

  const handleAddToHomeScreen = async () => {
    if (!installPrompt) {
      toast({
        title: "App Installation",
        description: "To install Wisely on your device, use your browser's 'Add to Home Screen' option in the menu.",
      });
      return;
    }

    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      toast({
        title: "Welcome Home!",
        description: "Wisely has been added to your home screen.",
      });
    }
  };

  const handleIosInstall = () => {
    toast({
      title: "Install on iOS",
      description: "Tap the 'Share' icon in Safari (the square with an up arrow) and then select 'Add to Home Screen'.",
    });
  };

  const appearanceOptions = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-2xl mx-auto w-full">
        <header className="mb-8 text-center md:text-left">
          <h2 className="text-3xl font-bold font-headline text-primary">Settings</h2>
          <p className="text-muted-foreground">Manage your profile, categories, and preferences.</p>
        </header>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-4 border-background shadow-sm">
                  {user.name?.[0] || "?"}
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">{user.name}</CardTitle>
                  <CardDescription className="text-sm">Personal Account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Email</p>
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Phone Number</p>
                    <p className="text-sm font-medium truncate">{user.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Categories Section */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Expense Categories
              </CardTitle>
              <CardDescription>Customize the categories you use for tracking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <Input 
                  placeholder="New category name..." 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="rounded-xl h-11"
                />
                <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-primary">
                  <Plus className="h-5 w-5" />
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {categories.map((cat) => (
                  <div 
                    key={cat} 
                    className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 group hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium">{cat}</span>
                    <button 
                      onClick={() => removeCategory(cat)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appearance Selection */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how Wisely looks on your device.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 p-1 bg-muted/50 rounded-xl border border-border/50">
                {appearanceOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = theme === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 py-3 rounded-lg transition-all",
                        isActive 
                          ? "bg-background text-primary shadow-sm" 
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{option.name}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 tracking-widest">Preferences</p>
            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border-none">
              <button 
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50"
                onClick={() => router.push("/profile/currency")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Default Currency</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">{user.currency || "USD"}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button 
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50"
                onClick={handleAddToHomeScreen}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Add to Android Home Screen</span>
                </div>
                <div className="flex items-center gap-2">
                  {!installPrompt && <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">Native</span>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>

              <button 
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50"
                onClick={handleIosInstall}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Add to iOS Home Screen</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Bell className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Security & Privacy</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-2xl border-2 text-destructive hover:text-destructive hover:bg-destructive/5 font-bold gap-2 mt-4"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out of Wisely
          </Button>
          
          <p className="text-center text-[10px] text-muted-foreground uppercase font-medium tracking-[0.2em] py-4">
            Wisely Version 1.0.0
          </p>
        </div>
      </main>
    </div>
  );
}
