
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Users, CreditCard, PieChart as PieChartIcon, ArrowRight, Target, Loader2 } from "lucide-react";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, orderBy, where, collectionGroup, doc, updateDoc } from "firebase/firestore";
import { getCurrencySymbol } from "@/lib/utils";
import { LoadingScreen } from "@/components/layout/loading-screen";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: storeLoading } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Hidden interaction state
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!storeLoading && !user) {
      router.push("/auth");
    }
  }, [user, router, storeLoading]);

  // Handle hidden triple click
  const handleTotalExpensesClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 500) {
      const nextCount = clickCount + 1;
      if (nextCount === 3) {
        setBudgetInput(user?.monthlyBudget?.toString() || "");
        setIsBudgetDialogOpen(true);
        setClickCount(0);
      } else {
        setClickCount(nextCount);
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
  };

  const handleSaveBudget = async () => {
    if (!user || !db) return;
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount < 0) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Please enter a valid budget." });
      return;
    }

    setSavingBudget(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        monthlyBudget: amount
      });
      toast({ title: "Budget Saved", description: "Your monthly goal has been updated." });
      setIsBudgetDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSavingBudget(false);
    }
  };

  // Personal Expenses Query
  const personalExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "personalExpenses"),
      where("isDeleted", "==", false),
      orderBy("date", "desc")
    );
  }, [db, user]);

  const { data: personalExpenses } = useCollection(personalExpensesQuery);

  // Group Expenses Query
  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collectionGroup(db, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, user]);

  const { data: groupExpenses } = useCollection(groupExpensesQuery);

  // Calculate Category Data for Insights (Excluding Settlements)
  const categoryData = useMemo(() => {
    if (!personalExpenses && !groupExpenses) return [];
    
    const categories: Record<string, number> = {};
    
    // Process Personal
    (personalExpenses || [])
      .filter(exp => exp.category !== 'Settlement')
      .forEach(exp => {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
      });
    
    // Process Group Share
    (groupExpenses || [])
      .filter(exp => exp.category !== 'Settlement')
      .forEach(exp => {
        const mySplit = exp.splitBetween?.find((s: any) => s.userId === user?.uid);
        if (mySplit) {
          categories[exp.category] = (categories[exp.category] || 0) + mySplit.amount;
        }
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [personalExpenses, groupExpenses, user?.uid]);

  if (storeLoading || !user) {
    return <LoadingScreen />;
  }

  // Aggregate stats excluding Settlements
  const activePersonalExpenses = (personalExpenses || []).filter(exp => exp.category !== 'Settlement');
  const totalPersonalSpent = activePersonalExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalUserGroupShare = (groupExpenses || [])
    .filter(exp => !exp.isSettled && exp.category !== 'Settlement')
    .reduce((acc, curr) => {
      const mySplit = curr.splitBetween?.find((s: any) => s.userId === user.uid);
      return acc + (mySplit?.amount || 0);
    }, 0);

  const totalOverallSpent = totalPersonalSpent + totalUserGroupShare;
  const symbol = getCurrencySymbol(user.currency);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-headline text-primary">Overview</h2>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name.split(" ")[0]}</p>
          </div>
          <Button 
            asChild
            className="hidden md:flex bg-primary hover:bg-primary/90 gap-2 h-10 text-sm font-semibold rounded-xl transition-all active:scale-95"
          >
            <Link href="/expenses/add">
              <Plus className="h-5 w-5" />
              Add Expense
            </Link>
          </Button>
        </header>

        {/* Top Summary Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-none shadow-sm bg-card rounded-2xl p-4 flex items-center justify-between h-20 overflow-hidden relative group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-tight">Personal Spent</span>
            </div>
            <div className="text-xl font-bold text-primary shrink-0">{symbol}{totalPersonalSpent.toFixed(2)}</div>
          </Card>

          <Card className="border-none shadow-sm bg-card rounded-2xl p-4 flex items-center justify-between h-20 overflow-hidden relative group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-tight">Active Group Share</span>
            </div>
            <div className="text-xl font-bold text-foreground shrink-0">{symbol}{totalUserGroupShare.toFixed(2)}</div>
          </Card>

          <Card 
            onClick={handleTotalExpensesClick}
            className="border-none shadow-sm bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-between h-20 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-tight">Total Expenses</span>
            </div>
            <div className="text-xl font-bold relative z-10 shrink-0">{symbol}{totalOverallSpent.toFixed(2)}</div>
          </Card>
        </div>

        {/* Analyst & Stats Section */}
        <div className="grid gap-6">
          {/* Analyst Insights Card */}
          <Card className="border-none shadow-sm bg-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <PieChartIcon className="h-4 w-4" />
                </div>
                Analyst
              </CardTitle>
              <CardDescription>Automated insights into your spending habits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="text-sm font-medium leading-relaxed space-y-3">
                  <p>
                    {categoryData.length > 0 ? (
                      <>
                        Your biggest expense category is <span className="text-[#facc15] font-bold">"{categoryData[0]?.name}"</span>, 
                        accounting for {((categoryData[0]?.value / (totalOverallSpent || 1)) * 100).toFixed(1)}% of your total outgoings. 
                      </>
                    ) : (
                      "No data available yet. Start tracking your expenses to see detailed automated analysis."
                    )}
                  </p>
                  
                  {user.monthlyBudget && user.monthlyBudget > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Monthly Budget Progress</span>
                        <span className="text-[10px] font-bold">{Math.min(100, (totalOverallSpent / user.monthlyBudget) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${totalOverallSpent > user.monthlyBudget ? 'bg-destructive' : 'bg-primary'}`}
                          style={{ width: `${Math.min(100, (totalOverallSpent / user.monthlyBudget) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] mt-1 text-muted-foreground">
                        {totalOverallSpent > user.monthlyBudget 
                          ? `You are ${symbol}${(totalOverallSpent - user.monthlyBudget).toFixed(2)} over your goal.` 
                          : `You have ${symbol}${(user.monthlyBudget - totalOverallSpent).toFixed(2)} remaining for the month.`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" asChild className="w-full rounded-xl gap-2 font-bold h-11">
                <Link href="/analytics">
                  Full Reports
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Monthly Budget Dialog (Hidden Feature) */}
      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Monthly Budget
            </DialogTitle>
            <DialogDescription>
              Set a monthly spending limit to track your progress on the dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Target Amount ({symbol})</Label>
              <Input 
                id="budget"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="h-14 rounded-xl text-2xl font-bold bg-muted/30 border-none"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground italic">
                Set to 0 to disable budget tracking.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl h-11" onClick={() => setIsBudgetDialogOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl h-11 font-bold bg-primary shadow-lg shadow-primary/10" onClick={handleSaveBudget} disabled={savingBudget}>
              {savingBudget ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
