
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Bell, BellOff, Shield, ShieldCheck, Loader2, Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [settings, setSettings] = useState({
    masterEnabled: user?.notificationSettings?.masterEnabled ?? true,
    expenseAdded: user?.notificationSettings?.expenseAdded ?? true,
    settlementReminders: user?.notificationSettings?.settlementReminders ?? true,
  });

  useEffect(() => {
    setMounted(true);
    if (!user) router.push("/auth");
  }, [user, router]);

  useEffect(() => {
    if (user?.notificationSettings) {
      setSettings({
        masterEnabled: user.notificationSettings.masterEnabled,
        expenseAdded: user.notificationSettings.expenseAdded ?? true,
        settlementReminders: user.notificationSettings.settlementReminders ?? true,
      });
    }
  }, [user?.notificationSettings]);

  if (!mounted || !user) return null;

  const handleToggle = async (key: string, value: boolean) => {
    if (!db || !user) return;
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    setUpdating(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const updateData: any = { [`notificationSettings.${key}`]: value };
      if (key === 'masterEnabled' && !value) updateData.fcmTokens = [];
      await updateDoc(userRef, updateData);
      toast({ title: "Protocol Updated", description: "Signal settings synchronized." });
    } catch (error: any) {
      setSettings(settings);
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-2xl mx-auto w-full">
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 shrink-0 glass border-white/5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-glow">ALERTS</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Signal Monitoring / Comms Protocol</p>
          </div>
        </motion.header>

        <div className="space-y-8">
          <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <CardHeader className={cn(
              "transition-colors duration-700 py-8 px-8",
              settings.masterEnabled ? "bg-primary/5" : "bg-white/5"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                    settings.masterEnabled ? "bg-primary text-primary-foreground glow-primary" : "glass text-muted-foreground"
                  )}>
                    {settings.masterEnabled ? <Bell className="h-7 w-7" /> : <BellOff className="h-7 w-7" />}
                  </div>
                  <div>
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                       Master Switch
                       {updating && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Enable all signal transmissions</CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={settings.masterEnabled} 
                  onCheckedChange={(val) => handleToggle('masterEnabled', val)}
                  disabled={updating}
                  className="data-[state=checked]:bg-primary scale-110"
                />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {settings.masterEnabled ? (
                  <ShieldCheck className="h-5 w-5 text-green-500 shrink-0 mt-0.5 animate-pulse" />
                ) : (
                  <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5 opacity-40" />
                )}
                <div className="space-y-1 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Listening Status</p>
                  <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase tracking-wider">
                    {settings.masterEnabled 
                      ? "High-fidelity listening active. Cross-node synchronization will trigger instant push telemetry." 
                      : "Signal broadcast disabled. Local cache will still update, but push protocols are offline."}
                  </p>
                </div>
              </div>

              {settings.masterEnabled && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary ml-1">Sub-Channel Logic</p>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-6 rounded-2xl glass border-white/5 hover:border-primary/20 transition-all">
                      <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-widest">Inflow Telemetry</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Notify when peers initialize cycles.</p>
                      </div>
                      <Switch 
                        checked={settings.expenseAdded} 
                        onCheckedChange={(val) => handleToggle('expenseAdded', val)}
                        disabled={updating}
                        className="scale-90"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-2xl glass border-white/5 hover:border-primary/20 transition-all">
                      <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-widest">Clearance Alerts</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Notify when node paybacks occur.</p>
                      </div>
                      <Switch 
                        checked={settings.settlementReminders} 
                        onCheckedChange={(val) => handleToggle('settlementReminders', val)}
                        disabled={updating}
                        className="scale-90"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {!settings.masterEnabled && (
                <div className="p-12 rounded-[2rem] border-2 border-dashed border-white/5 text-center opacity-40">
                  <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Enable master node to configure sub-channels</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card rounded-[2.5rem] bg-primary border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-primary-foreground flex items-center gap-3">
                 <Activity className="h-4 w-4" />
                 Registration Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <p className="text-[10px] font-bold text-primary-foreground uppercase tracking-widest leading-relaxed opacity-80">
                Your account node is currently registered with Firebase Cloud Messaging (FCM) for multi-vault synchronization.
              </p>
              <div className="p-4 bg-black/20 rounded-xl flex items-center justify-between border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary-foreground/60">Active node tokens</span>
                <span className="text-xs font-black font-mono text-primary-foreground">{(user.fcmTokens?.length || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
