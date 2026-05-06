"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Users, 
  CreditCard, 
  ArrowRight, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Crown, 
  Zap,
  Activity,
  ShieldCheck
} from "lucide-react";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, orderBy, where, collectionGroup } from "firebase/firestore";
import { getCurrencySymbol, cn, formatCompactNumber } from "@/lib/utils";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { BudgetRolloverPrompt } from "@/components/budgets/BudgetRolloverPrompt";
import { startOfMonth, endOfMonth } from "date-fns";
import { motion } from "framer-motion";

/**
 * Dashboard UI Definition - High-Performance Command HUD
 */
export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: storeLoading, categories: storeCategories } = useStore();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  // Gesture handling for immersive HUD navigation
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!storeLoading && !user) router.push("/auth");
  }, [user, router, storeLoading]);

  const now = new Date();
  const currentMonthStart = startOfMonth(now).getTime();
  const currentMonthEnd = endOfMonth(now).getTime();

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    // Swipe left-to-right (Inward motion) to enter the Club sector
    if (touchStart - touchEnd < -100) router.push('/wisely-club');
  };

  const personalExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "personalExpenses"),
      where("isDeleted", "==", false),
      orderBy("date", "desc")
    );
  }, [db, user]);

  const { data: personalExpenses } = useCollection(personalExpensesQuery);

  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collectionGroup(db, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, user]);

  const { data: groupExpenses } = useCollection(groupExpensesQuery);

  // Filter cycles for active telemetry period
  const monthlyPersonalExpenses = useMemo(() => 
    (personalExpenses || []).filter(exp => exp.date >= currentMonthStart && exp.date <= currentMonthEnd), 
  [personalExpenses, currentMonthStart, currentMonthEnd]);

  const monthlyGroupExpenses = useMemo(() => 
    (groupExpenses || []).filter(exp => exp.date >= currentMonthStart && exp.date <= currentMonthEnd), 
  [groupExpenses, currentMonthStart, currentMonthEnd]);

  // Aggregate high-load categorical data
  const categorySpending = useMemo(() => {
    const categories: Record<string, number> = {};
    monthlyPersonalExpenses.filter(e => e.category !== 'Settlement').forEach(e => categories[e.category] = (categories[e.category] || 0) + e.amount);
    monthlyGroupExpenses.filter(e => e.category !== 'Settlement').forEach(e => {
      const mySplit = e.splitBetween?.find((s: any) => s.userId === user?.uid);
      if (mySplit) categories[e.category] = (categories[e.category] || 0) + mySplit.amount;
    });
    return categories;
  }, [monthlyPersonalExpenses, monthlyGroupExpenses, user?.uid]);

  const categoryData = useMemo(() => 
    Object.entries(categorySpending).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value), 
  [categorySpending]);

  const activePersonalSpent = monthlyPersonalExpenses.filter(e => e.category !== 'Settlement').reduce((acc, curr) => acc + curr.amount, 0);
  const activeUserGroupShare = monthlyGroupExpenses.filter(e => !e.isSettled && e.category !== 'Settlement').reduce((acc, curr) => acc + (curr.splitBetween?.find((s: any) => s.userId === user?.uid)?.amount || 0), 0);
  const totalOverallMonthlySpent = activePersonalSpent + activeUserGroupShare;

  const totalBudget = useMemo(() => {
    if (!user?.categoryBudgets) return user?.monthlyBudget || 0;
    return Object.values(user.categoryBudgets).reduce((a, b) => a + b, 0);
  }, [user?.categoryBudgets, user?.monthlyBudget]);

  const budgetPercentage = totalBudget <= 0 ? null : (totalOverallMonthlySpent / totalBudget) * 100;

  // HUD Theme Logic for status indicators
  const budgetTheme = useMemo(() => {
    if (budgetPercentage === null) return { color: "bg-primary", icon: CreditCard, label: "Monthly Output", glow: "glow-primary" };
    if (budgetPercentage < 60) return { color: "bg-emerald-600", icon: CheckCircle2, label: "Secure Mode", glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]" };
    if (budgetPercentage < 90) return { color: "bg-orange-500", icon: AlertTriangle, label: "Alert Threshold", glow: "glow-accent" };
    return { color: "bg-destructive", icon: Target, label: "Critical Limit", glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]" };
  }, [budgetPercentage]);

  if (storeLoading || !user) return <LoadingScreen />;

  const symbol = getCurrencySymbol(user.currency);

  // Framer motion variants for HUD synchronization
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div 
      className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Navbar />
      <BudgetRolloverPrompt />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-6xl font-black text-glow uppercase tracking-tighter leading-none">COMMAND</h2>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                  Cycles / {now.toLocaleString('default', { month: 'long' })} {now.getFullYear()}
                </p>
              </div>
            </div>

            <Button asChild variant="outline" className="h-12 px-6 text-[10px] font-black uppercase tracking-widest rounded-2xl border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5 hover:text-white shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all active:scale-95"><Link href="/wisely-club"><Crown className="h-4 w-4 mr-2" />The Club</Link></Button>
          </div>
        </motion.header>

        {/* Telemetry Metrics */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10"
        >
          <motion.div variants={item}>
            <Card className="glass-card h-32 relative group cursor-default overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <CardContent className="h-full flex items-center justify-between p-6">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center text-primary glow-primary shadow-inner">
                    <Wallet className="h-7 w-7" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Private Vault</span>
                    <span className="text-3xl font-black tracking-tighter text-glow">
                      {symbol}{formatCompactNumber(activePersonalSpent)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card h-32 relative group cursor-default overflow-hidden">
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <Users className="h-4 w-4 text-accent" />
              </div>
              <CardContent className="h-full flex items-center justify-between p-6">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center text-accent glow-accent shadow-inner">
                    <Activity className="h-7 w-7" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Shared Network</span>
                    <span className="text-3xl font-black tracking-tighter text-glow">
                      {symbol}{formatCompactNumber(activeUserGroupShare)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/budgets">
              <Card className={cn("h-32 relative overflow-hidden transition-all duration-700 active:scale-95 group", budgetTheme.color, budgetTheme.glow)}>
                <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-[80px] -translate-y-20 translate-x-20" />
                <CardContent className="h-full flex items-center justify-between p-6 relative z-10 text-white">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner border border-white/10">
                      <budgetTheme.icon className="h-7 w-7" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">{budgetTheme.label}</span>
                      <span className="text-3xl font-black tracking-tighter">
                        {symbol}{formatCompactNumber(totalOverallMonthlySpent)}
                      </span>
                    </div>
                  </div>
                  {budgetPercentage !== null && (
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[11px] font-black opacity-90">{budgetPercentage.toFixed(0)}% LOAD</span>
                      <div className="w-16 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, budgetPercentage)}%` }}
                          className="h-full bg-white rounded-full transition-all shadow-[0_0_8px_#fff]" 
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </motion.div>

        {/* Analyst Intelligence */}
        <motion.div 
          variants={item}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="grid gap-6"
        >
          <Card className="glass-card border-none overflow-hidden relative min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <CardHeader className="pb-4 pt-8">
              <CardTitle className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 text-glow">
                <Zap className="h-4 w-4 text-primary fill-primary animate-pulse" />
                Analyst HUD Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-8 relative overflow-hidden group/hud">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/hud:opacity-100 transition-opacity" />
                <div className="text-sm font-medium leading-relaxed space-y-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl glass flex items-center justify-center shrink-0 border-white/5">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xl font-black tracking-tight uppercase">
                      {categoryData.length > 0 ? (
                        <>
                          Highest activity in <span className="text-primary text-glow">"{categoryData[0]?.name}"</span>. 
                          Protocol Impact: {((categoryData[0]?.value / (totalOverallMonthlySpent || 1)) * 100).toFixed(1)}%.
                        </>
                      ) : (
                        "Initializing ledger streams. Record a cycle to begin heuristic analysis."
                      )}
                    </p>
                  </div>
                  
                  {totalBudget > 0 && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Month Cycle Efficiency</span>
                          <span className="text-xs font-black text-primary text-glow">{Math.min(100, (totalOverallMonthlySpent / totalBudget) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (totalOverallMonthlySpent / totalBudget) * 100)}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-1500",
                              totalOverallMonthlySpent > totalBudget ? 'bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-primary glow-primary'
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-3 sm:grid-cols-2">
                        {storeCategories.map(cat => {
                          const budget = user.categoryBudgets?.[cat] || 0;
                          const spent = categorySpending[cat] || 0;
                          if (budget > 0 && spent > budget * 0.7) {
                            return (
                              <motion.div 
                                key={cat} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 shadow-inner"
                              >
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{cat}</span>
                                <div className="flex items-center gap-2">
                                  <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", spent > budget ? "bg-destructive" : "bg-orange-500")} />
                                  <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg border", spent > budget ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20")}>
                                    {spent > budget ? "OVER LIMIT" : "APPROACHING"}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button variant="ghost" asChild className="w-full rounded-[2rem] gap-3 font-black uppercase tracking-[0.3em] h-16 border border-white/10 hover:bg-white/5 transition-all group overflow-hidden relative"><Link href="/analytics" className="relative z-10 flex items-center justify-center gap-3"><div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform -z-10" />Access Deep Data Metrics<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" /></Link></Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}