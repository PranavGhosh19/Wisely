"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, collection, query, where, collectionGroup } from "firebase/firestore";
import { ArrowLeft, Target, Loader2, Save, TrendingUp, Zap, ShieldCheck } from "lucide-react";
import { getCurrencySymbol, cn, formatCompactNumber } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";
import { motion } from "framer-motion";

export default function BudgetsPage() {
  const router = useRouter();
  const { user, categories, isLoading: storeLoading } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!storeLoading && !user) router.push("/auth");
  }, [user, router, storeLoading]);

  const now = new Date();
  const monthStart = startOfMonth(now).getTime();
  const monthEnd = endOfMonth(now).getTime();

  const personalExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "personalExpenses"),
      where("isDeleted", "==", false),
      where("date", ">=", monthStart),
      where("date", "<=", monthEnd)
    );
  }, [db, user, monthStart, monthEnd]);

  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collectionGroup(db, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, user]);

  const { data: personalExpenses } = useCollection(personalExpensesQuery);
  const { data: groupExpenses } = useCollection(groupExpensesQuery);

  useEffect(() => {
    if (user && categories.length > 0) {
      const initial: Record<string, string> = {};
      categories.forEach(cat => {
        initial[cat] = user.categoryBudgets?.[cat]?.toString() || "0";
      });
      setCategoryBudgets(initial);
    }
  }, [user, categories]);

  const actualSpending = useMemo(() => {
    const spending: Record<string, number> = {};
    categories.forEach(cat => spending[cat] = 0);

    personalExpenses?.forEach(exp => {
      if (spending[exp.category] !== undefined) spending[exp.category] += exp.amount;
    });

    groupExpenses?.forEach(exp => {
      if (exp.date < monthStart || exp.date > monthEnd) return;
      if (spending[exp.category] !== undefined) {
        const mySplit = exp.splitBetween?.find((s: any) => s.userId === user?.uid);
        if (mySplit) spending[exp.category] += mySplit.amount;
      }
    });

    return spending;
  }, [personalExpenses, groupExpenses, categories, user?.uid, monthStart, monthEnd]);

  const handleSave = async () => {
    if (!user || !db) return;
    const updates: Record<string, number> = {};
    let total = 0;
    for (const [cat, val] of Object.entries(categoryBudgets)) {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        updates[cat] = num;
        total += num;
      }
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        categoryBudgets: updates,
        monthlyBudget: total
      });
      toast({ title: "Protocol Updated", description: "Spending targets synchronized." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      } finally {
      setSaving(false);
    }
  };

  if (!mounted || storeLoading || !user) return null;

  const symbol = getCurrencySymbol(user.currency);
  const totalBudget = Object.values(categoryBudgets).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-4xl mx-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button 
            className="mb-4 -ml-2 text-muted-foreground hover:text-primary gap-2 flex items-center transition-all px-2 py-1 uppercase font-black text-[10px] tracking-widest"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Command
          </button>
          
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black text-glow uppercase tracking-tighter">TARGETS</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Budget Partitioning / Resource Allocation</p>
          </div>
        </motion.header>

        <div className="grid gap-6">
          <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <CardHeader className="bg-white/5 border-b border-white/5 py-8 px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center text-primary glow-primary shadow-inner">
                    <Target className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                       <Zap className="h-3 w-3 text-accent fill-accent" />
                       Allocation HUD
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Adjust categorical load limits</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1 opacity-50">Combined Limit</span>
                  <span className="text-3xl font-black text-primary text-glow tracking-tighter">{symbol}{formatCompactNumber(totalBudget)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {categories.map(cat => (
                  <motion.div 
                    key={cat} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <Label htmlFor={`budget-${cat}`} className="text-[10px] font-black uppercase tracking-widest text-foreground">
                        {cat}
                      </Label>
                      <div className="flex items-center gap-4">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                          Current: {symbol}{formatCompactNumber(actualSpending[cat] || 0)}
                        </span>
                        {user.categoryBudgets?.[cat] !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className={cn("h-1 w-1 rounded-full animate-pulse", (actualSpending[cat] || 0) > (user.categoryBudgets[cat] || 0) ? "bg-destructive" : "bg-primary")} />
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest",
                              (actualSpending[cat] || 0) > (user.categoryBudgets[cat] || 0) ? "text-destructive" : "text-primary"
                            )}>
                              {symbol}{formatCompactNumber(user.categoryBudgets[cat])} MAX
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative group/input">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <span className="text-sm font-black text-primary/40">{symbol}</span>
                      </div>
                      <Input 
                        id={`budget-${cat}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-16 pl-12 rounded-2xl font-black bg-white/5 border-white/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-primary text-xl transition-all group-hover/input:bg-white/10"
                        value={categoryBudgets[cat] || ""}
                        onChange={(e) => setCategoryBudgets(prev => ({ ...prev, [cat]: e.target.value }))}
                      />
                      <TrendingUp className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/10 group-hover/input:text-primary/30 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-8 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row gap-6">
              <div className="flex-1 flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest opacity-60">
                  Data will be indexed by the Analyst HUD to provide real-time heuristic spending alerts.
                </p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full sm:w-auto min-w-[200px] h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-primary glow-primary shadow-xl transition-all active:scale-95"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Syncing...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Synchronize</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
