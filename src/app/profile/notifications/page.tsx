
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
import { ArrowLeft, Bell, BellOff, Shield, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Initialize state from user profile
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
      const updateData: any = {
        [`notificationSettings.${key}`]: value
      };

      // If turning master OFF, we should clear tokens to stop server pushes
      if (key === 'masterEnabled' && !value) {
        updateData.fcmTokens = [];
      }

      await updateDoc(userRef, updateData);
      
      toast({
        title: "Preference Saved",
        description: `Notification setting updated successfully.`
      });
    } catch (error: any) {
      // Revert local state on error
      setSettings(settings);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not save your preference."
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-2xl mx-auto w-full">
        <header className="mb-8 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="rounded-full h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-headline text-primary">Notification Settings</h1>
            <p className="text-muted-foreground">Manage how Wisely reaches you.</p>
          </div>
        </header>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className={cn(
              "transition-colors duration-500",
              settings.masterEnabled ? "bg-primary/5" : "bg-muted/30"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                    settings.masterEnabled ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                  )}>
                    {settings.masterEnabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline">Master Switch</CardTitle>
                    <CardDescription>Enable or disable all alerts instantly</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {updating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  <Switch 
                    checked={settings.masterEnabled} 
                    onCheckedChange={(val) => handleToggle('masterEnabled', val)}
                    disabled={updating}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/50">
                  {settings.masterEnabled ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Smart Listening</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {settings.masterEnabled 
                        ? "Wisely is listening for activity. You will receive push notifications when relevant events occur in your groups." 
                        : "All background and foreground alerts have been disabled. Your device tokens have been cleared for privacy."}
                    </p>
                  </div>
                </div>

                {settings.masterEnabled && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Detailed Preferences</p>
                    
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/10">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold">New Expense Added</p>
                          <p className="text-[10px] text-muted-foreground">Get notified when someone adds a bill to a group.</p>
                        </div>
                        <Switch 
                          checked={settings.expenseAdded} 
                          onCheckedChange={(val) => handleToggle('expenseAdded', val)}
                          disabled={updating}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/10">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold">Settlement Reminders</p>
                          <p className="text-[10px] text-muted-foreground">Alerts when debts are settled or reminders are sent.</p>
                        </div>
                        <Switch 
                          checked={settings.settlementReminders} 
                          onCheckedChange={(val) => handleToggle('settlementReminders', val)}
                          disabled={updating}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!settings.masterEnabled && (
                  <div className="p-8 rounded-2xl border-2 border-dashed border-muted text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      Enable the master switch to configure individual alert types.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Sync Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm opacity-80 leading-relaxed">
                Your account is currently synced with Firebase Cloud Messaging. This allows real-time updates across all your logged-in devices.
              </p>
              <div className="p-3 bg-white/10 rounded-lg flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest">Active Device Registrations</span>
                <span className="text-xs font-mono font-bold">{(user.fcmTokens?.length || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
