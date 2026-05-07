
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Moon, 
  Sun, 
  Monitor, 
  LogOut, 
  ChevronRight,
  Shield,
  Bell,
  Tag,
  Plus,
  Globe,
  Camera,
  Loader2,
  MessageSquare,
  Cpu,
  Zap,
  X,
  Type
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * ProfilePage - High-fidelity "System Configuration" hub.
 */
export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { 
    user, 
    logout, 
    categories, 
    addCategory, 
    removeCategory,
    fontSize,
    setFontSize
  } = useStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) router.push("/auth");
  }, [user, router]);

  if (!mounted || !user) return null;

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    logout();
    router.push("/");
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const catName = newCategory.trim();
    if (!catName || !user || !db) return;
    if (categories.includes(catName)) {
      toast({ variant: "destructive", title: "Duplicate Entry", description: "Sector already exists." });
      return;
    }

    const updatedCategories = [...categories, catName];
    const userRef = doc(db, "users", user.uid);
    updateDocumentNonBlocking(userRef, { categories: updatedCategories });
    addCategory(catName);
    setNewCategory("");
    toast({ title: "Sector Added", description: `"${catName}" protocol enabled.` });
  };

  const handleRemoveCategory = (cat: string) => {
    if (!user || !db) return;
    const updatedCategories = categories.filter(c => c !== cat);
    const userRef = doc(db, "users", user.uid);
    updateDocumentNonBlocking(userRef, { categories: updatedCategories });
    removeCategory(cat);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Memory Overload", description: "Max file size: 5MB." });
        return;
      }
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (user && db) {
          const userRef = doc(db, "users", user.uid);
          updateDocumentNonBlocking(userRef, { photoURL: reader.result as string });
          toast({ title: "Avatar Synced", description: "Identity visual updated." });
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-4xl mx-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center md:text-left space-y-1"
        >
          <h2 className="text-3xl md:text-5xl font-black text-glow uppercase tracking-tighter">System</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">User Terminal / Configuration Hub</p>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Identity Block */}
          <Card className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden h-full">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="h-20 w-20 rounded-[1.5rem] glass border-2 border-primary/20 flex items-center justify-center text-primary text-3xl font-black shadow-inner overflow-hidden relative glow-primary transition-transform active:scale-95">
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt={user.name} fill className="object-cover" />
                    ) : (
                      <span className="relative z-10">{user.name?.[0]}</span>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="font-black uppercase tracking-tight text-xl truncate max-w-[200px]">{user.name}</CardTitle>
                  <CardDescription className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    Identity Authorized
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-tight truncate opacity-80">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-tight opacity-80">Terminal Node: Secured</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sector Classes (Categories) */}
          <Card className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Tag className="h-4 w-4 text-primary" />
                Sector Classes
              </CardTitle>
              <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Manage data categorization nodes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <Input 
                  placeholder="NEW SECTOR..." 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="rounded-xl h-11 glass border-white/5 text-[10px] font-black uppercase tracking-widest focus:ring-primary"
                />
                <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-primary glow-primary transition-all active:scale-90">
                  <Plus className="h-5 w-5" />
                </Button>
              </form>
              <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((cat) => (
                  <div key={cat} className="group flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:border-primary/50 transition-all">
                    <span className="text-[9px] font-black uppercase tracking-widest">{cat}</span>
                    <button 
                      onClick={() => handleRemoveCategory(cat)} 
                      className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* HUD Theme Toggles */}
          <Card className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Monitor className="h-4 w-4 text-primary" />
                HUD Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                {[
                  { id: 'light', icon: Sun, label: 'Standard' },
                  { id: 'dark', icon: Moon, label: 'Dark HUD' },
                  { id: 'system', icon: Monitor, label: 'Neural' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 py-4 rounded-xl transition-all",
                      theme === opt.id ? "bg-primary text-primary-foreground glow-primary" : "text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    <opt.icon className="h-5 w-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{opt.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optical Protocol (Font Size) */}
          <Card className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Type className="h-4 w-4 text-primary" />
                Optical Protocol
              </CardTitle>
              <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Adjust display density</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                {[
                  { id: '10px', label: 'Compact' },
                  { id: '12px', label: 'Standard' },
                  { id: '14px', label: 'Expanded' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFontSize(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-4 rounded-xl transition-all",
                      fontSize === opt.id ? "bg-primary text-primary-foreground glow-primary" : "text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                    <span className="text-[8px] font-mono opacity-50">{opt.id}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Protocols List */}
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground px-4">Protocols</p>
            <div className="glass-card rounded-[2rem] border-white/5 overflow-hidden divide-y divide-white/5">
              {[
                { label: 'Default Currency', value: user.currency || "USD", icon: Globe, color: 'text-emerald-500', href: '/profile/currency' },
                { label: 'Notifications', value: user.notificationSettings?.masterEnabled ? 'ACTIVE' : 'SILENT', icon: Bell, color: 'text-primary', href: '/profile/notifications' },
                { label: 'Feedback Signal', icon: MessageSquare, color: 'text-accent', href: '/profile/feedback' }
              ].map((item, i) => (
                <button 
                  key={i} 
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all group" 
                  onClick={() => router.push(item.href)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("h-10 w-10 rounded-xl glass border-white/5 flex items-center justify-center transition-all group-hover:scale-110", item.color)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                      {item.value && <p className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase">{item.value}</p>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Termination */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="mt-12 flex flex-col items-center gap-8"
        >
          <Button 
            variant="ghost" 
            className="w-full h-14 rounded-[2rem] border-2 border-destructive/20 text-destructive hover:bg-destructive/5 font-black uppercase tracking-widest text-[10px] gap-3 shadow-sm hover:shadow-destructive/10 transition-all" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Terminate Session
          </Button>
          <div className="flex flex-col items-center gap-2">
             <Zap className="h-4 w-4 text-primary opacity-20" />
             <p className="text-[8px] font-black uppercase tracking-[0.6em] text-muted-foreground/30">Wisely Terminal v1.2.0 • Secured Link Established</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
