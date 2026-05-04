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
  LayoutDashboard
} from "lucide-react";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, orderBy, where, collectionGroup } from "firebase/firestore";
import { getCurrencySymbol, cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { BudgetRolloverPrompt } from "@/components/budgets/BudgetRolloverPrompt";
import { startOfMonth, endOfMonth } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: storeLoading, categories: storeCategories } = useStore();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  // Gesture handling
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
    if (touchStart - touchEnd < -70) router.push('/wisely-club');
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

  const monthlyPersonalExpenses = useMemo(() => (personalExpenses || []).filter(exp => exp.date >= currentMonthStart && exp.date <= currentMonthEnd), [personalExpenses, currentMonthStart, currentMonthEnd]);
  const monthlyGroupExpenses = useMemo(() => (groupExpenses || []).filter(exp => exp.date >= currentMonthStart && exp.date <= currentMonthEnd), [groupExpenses, currentMonthStart, currentMonthEnd]);

  const categorySpending = useMemo(() => {
    const categories: Record<string, number> = {};
    monthlyPersonalExpenses.filter(e => e.category !== 'Settlement').forEach(e => categories[e.category] = (categories[e.category] || 0) + e.amount);
    monthlyGroupExpenses.filter(e => e.category !== 'Settlement').forEach(e => {
      const mySplit = e.splitBetween?.find((s: any) => s.userId === user?.uid);
      if (mySplit) categories[e.category] = (categories[e.category] || 0) + mySplit.amount;
    });
    return categories;
  }, [monthlyPersonalExpenses, monthlyGroupExpenses, user?.uid]);

  const categoryData = useMemo(() => Object.entries(categorySpending).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value), [categorySpending]);

  const activePersonalSpent = monthlyPersonalExpenses.filter(e => e.category !== 'Settlement').reduce((acc, curr) => acc + curr.amount, 0);
  const activeUserGroupShare = monthlyGroupExpenses.filter(e => !e.isSettled && e.category !== 'Settlement').reduce((acc, curr) => acc + (curr.splitBetween?.find((s: any) => s.userId === user?.uid)?.amount || 0), 0);
  const totalOverallMonthlySpent = activePersonalSpent + activeUserGroupShare;

  const totalBudget = useMemo(() => {
    if (!user?.categoryBudgets) return user?.monthlyBudget || 0;
    return Object.values(user.categoryBudgets).reduce((a, b) => a + b, 0);
  }, [user?.categoryBudgets, user?.monthlyBudget]);

  const budgetPercentage = totalBudget <= 0 ? null : (totalOverallMonthlySpent / totalBudget) * 100;

  const budgetTheme = useMemo(() => {
    if (budgetPercentage === null) return { color: "bg-primary", icon: CreditCard, label: "Monthly Output", glow: "glow-primary" };
    if (budgetPercentage < 60) return { color: "bg-emerald-600", icon: CheckCircle2, label: "Secure Mode", glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]" };
    if (budgetPercentage < 90) return { color: "bg-orange-500", icon: AlertTriangle, label: "Alert Threshold", glow: "glow-accent" };
    return { color: "bg-destructive", icon: Target, label: "Critical Limit", glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]" };
  }, [budgetPercentage]);

  if (storeLoading || !user) return <LoadingScreen />;

  const symbol = getCurrencySymbol(user.currency);

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
          className="mb-8 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-5xl font-black text-glow uppercase tracking-tighter">COMMAND</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                Cycles / {now.toLocaleString('default', { month: 'long' })} {now.getFullYear()}
              </p>
            </div>

            <Button 
              asChild
              variant="outline"
              className="h-12 px-6 text-xs font-black uppercase tracking-widest rounded-2xl border-accent/30 text-accent hover:bg-accent/5 glow-accent"
            >
              <Link href="/wisely-club">
                <Crown className="h-4 w-4 mr-2" />
                The Club
              </Link>
            </Button>
          </div>
        </motion.header>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10"
        >
          <motion.div variants={item}>
            <Card className="glass-card h-28 relative group cursor-default">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="h-full flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center text-primary glow-primary">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personal</span>
                    <span className="text-2xl font-black">{symbol}{activePersonalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card h-28 relative group cursor-default">
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="h-full flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center text-accent glow-accent">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Shared</span>
                    <span className="text-2xl font-black">{symbol}{activeUserGroupShare.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/budgets">
              <Card className={cn("h-28 relative overflow-hidden transition-all duration-500 active:scale-95 group", budgetTheme.color, budgetTheme.glow)}>
                <div className="absolute top-0 right-0 h-32 w-32 bg-white/20 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                <CardContent className="h-full flex items-center justify-between p-6 relative z-10 text-white">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <budgetTheme.icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{budgetTheme.label}</span>
                      <span className="text-2xl font-black">{symbol}{totalOverallMonthlySpent.toFixed(2)}</span>
                    </div>
                  </div>
                  {budgetPercentage !== null && (
                    <div className="text-right">
                      <span className="text-[10px] font-black opacity-80">{budgetPercentage.toFixed(0)}%</span>
                      <div className="w-12 h-1 bg-white/30 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-white transition-all" style={{ width: `${Math.min(100, budgetPercentage)}%` }} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={item}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="grid gap-6"
        >
          <Card className="glass-card border-none overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Zap className="h-4 w-4 text-primary fill-primary animate-pulse" />
                Analyst HUD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-6">
                <div className="text-sm font-medium leading-relaxed space-y-4">
                  <p className="text-lg font-bold">
                    {categoryData.length > 0 ? (
                      <>
                        Highest activity detected in <span className="text-primary">"{categoryData[0]?.name}"</span>. 
                        Impact level: {((categoryData[0]?.value / (totalOverallMonthlySpent || 1)) * 100).toFixed(1)}%.
                      </>
                    ) : (
                      "Initializing data streams. Record a cycle to begin analysis."
                    )}
                  </p>
                  
                  {totalBudget > 0 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Month Cycle Progress</span>
                          <span>{Math.min(100, (totalOverallMonthlySpent / totalBudget) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (totalOverallMonthlySpent / totalBudget) * 100)}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              totalOverallMonthlySpent > totalBudget ? 'bg-destructive glow-destructive' : 'bg-primary glow-primary'
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-2 sm:grid-cols-2">
                        {storeCategories.map(cat => {
                          const budget = user.categoryBudgets?.[cat] || 0;
                          const spent = categorySpending[cat] || 0;
                          if (budget > 0 && spent > budget * 0.7) {
                            return (
                              <motion.div 
                                key={cat} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5"
                              >
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{cat}</span>
                                <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full", spent > budget ? "bg-destructive/20 text-destructive border border-destructive/30" : "bg-orange-500/20 text-orange-500 border border-orange-500/30")}>
                                  {spent > budget ? "OVER LIMIT" : "APPROACHING"}
                                </span>
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
              <Button variant="outline" asChild className="w-full rounded-2xl gap-2 font-black uppercase tracking-widest h-14 border-white/10 hover:bg-white/5 group">
                <Link href="/analytics">
                  Access Deep Metrics
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}