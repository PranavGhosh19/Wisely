
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
import { ArrowLeft, Target, Loader2, Save, TrendingUp, BarChart3 } from "lucide-react";
import { getCurrencySymbol, cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from "recharts";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * Dedicated page for managing category-level budgets.
 * Includes a stacked bar chart comparing Budget vs. Actual Spends.
 */
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
    if (!storeLoading && !user) {
      router.push("/auth");
    }
  }, [user, router, storeLoading]);

  // Fetch range for current month
  const now = new Date();
  const monthStart = startOfMonth(now).getTime();
  const monthEnd = endOfMonth(now).getTime();

  // Fetch Personal Expenses
  const personalExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "personalExpenses"),
      where("isDeleted", "==", false),
      where("date", ">=", monthStart),
      where("date", "<=", monthEnd)
    );
  }, [db, user, monthStart, monthEnd]);

  // Fetch Group Expenses - Simplified query to avoid index complexity
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

  // Initialize form state from user profile data
  useEffect(() => {
    if (user && categories.length > 0) {
      const initial: Record<string, string> = {};
      categories.forEach(cat => {
        initial[cat] = user.categoryBudgets?.[cat]?.toString() || "0";
      });
      setCategoryBudgets(initial);
    }
  }, [user, categories]);

  // Calculate actual spending per category with client-side date filtering
  const actualSpending = useMemo(() => {
    const spending: Record<string, number> = {};
    categories.forEach(cat => spending[cat] = 0);

    personalExpenses?.forEach(exp => {
      if (spending[exp.category] !== undefined) {
        spending[exp.category] += exp.amount;
      }
    });

    groupExpenses?.forEach(exp => {
      // Client-side date filter to satisfy complex logic without needing composite indexes
      if (exp.date < monthStart || exp.date > monthEnd) return;

      if (spending[exp.category] !== undefined) {
        const mySplit = exp.splitBetween?.find((s: any) => s.userId === user?.uid);
        if (mySplit) {
          spending[exp.category] += mySplit.amount;
        }
      }
    });

    return spending;
  }, [personalExpenses, groupExpenses, categories, user?.uid, monthStart, monthEnd]);

  // Prepare chart data for STACKED visualization
  const chartData = useMemo(() => {
    return categories.map(cat => {
      const budget = parseFloat(categoryBudgets[cat] || "0");
      const spent = actualSpending[cat] || 0;
      
      return {
        name: cat,
        "Current Spend": Math.min(spent, budget),
        "Remaining": Math.max(0, budget - spent),
        "Over Budget": Math.max(0, spent - budget),
        originalBudget: budget,
        originalSpent: spent
      };
    }).filter(item => item.originalBudget > 0 || item.originalSpent > 0);
  }, [categories, categoryBudgets, actualSpending]);

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
      toast({ title: "Budgets Saved", description: "Your spending targets have been updated." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || storeLoading || !user) return null;

  const symbol = getCurrencySymbol(user.currency);
  const totalBudget = Object.values(categoryBudgets).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-4xl mx-auto w-full">
        <header className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 -ml-2 text-muted-foreground hover:text-primary gap-2 px-2"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold font-headline text-primary tracking-tight">Category Budgets</h1>
            <p className="text-muted-foreground">Monitor and adjust your monthly spending targets.</p>
          </div>
        </header>

        <div className="grid gap-6">
          {chartData.length > 0 && (
            <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Budget Distribution
                </CardTitle>
                <CardDescription>Stacked view of spent vs. remaining capacity</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] sm:h-[450px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${symbol}${value}`}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--foreground))' }}
                      width={80}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card border border-border p-3 rounded-xl shadow-xl space-y-1 animate-in fade-in zoom-in-95 duration-200">
                              <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2">{data.name}</p>
                              <div className="flex justify-between gap-8 items-center">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Budget:</span>
                                <span className="text-xs font-bold">{symbol}{data.originalBudget.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between gap-8 items-center">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Spent:</span>
                                <span className="text-xs font-bold text-primary">{symbol}{data.originalSpent.toFixed(2)}</span>
                              </div>
                              {data.originalSpent > data.originalBudget && (
                                <div className="pt-1 mt-1 border-t border-border flex justify-between gap-8 items-center">
                                  <span className="text-[10px] font-black text-destructive uppercase">Overlimit:</span>
                                  <span className="text-xs font-black text-destructive">{symbol}{(data.originalSpent - data.originalBudget).toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: '20px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                    <Bar 
                      dataKey="Current Spend" 
                      stackId="a" 
                      fill="hsl(var(--primary))" 
                      barSize={24}
                    />
                    <Bar 
                      dataKey="Remaining" 
                      stackId="a" 
                      fill="hsl(var(--primary))" 
                      opacity={0.15}
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                    />
                    <Bar 
                      dataKey="Over Budget" 
                      stackId="a" 
                      fill="hsl(var(--destructive))" 
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-6 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline">Monthly Targets</CardTitle>
                    <CardDescription>Adjust limits for each category</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Total Goal</span>
                  <span className="text-2xl font-black text-primary">{symbol}{totalBudget.toFixed(2)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {categories.map(cat => (
                  <div key={cat} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor={`budget-${cat}`} className="text-sm font-bold text-foreground">
                        {cat}
                      </Label>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                          Spent: {symbol}{(actualSpending[cat] || 0).toFixed(2)}
                        </span>
                        {user.categoryBudgets?.[cat] !== undefined && (
                          <span className={cn(
                            "text-[9px] font-bold uppercase",
                            (actualSpending[cat] || 0) > (user.categoryBudgets[cat] || 0) ? "text-destructive" : "text-primary"
                          )}>
                            Limit: {symbol}{user.categoryBudgets[cat]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative group/input">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <span className="text-lg font-bold text-primary">{symbol}</span>
                      </div>
                      <Input 
                        id={`budget-${cat}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-14 pl-12 rounded-2xl font-bold bg-muted/20 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-2 focus-visible:ring-primary text-lg transition-all"
                        value={categoryBudgets[cat] || ""}
                        onChange={(e) => setCategoryBudgets(prev => ({ ...prev, [cat]: e.target.value }))}
                      />
                      <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/20 group-hover/input:text-primary/40 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-muted/10 border-t flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  Your "Analyst" on the dashboard uses these targets to alert you when you're nearing limits or overspending.
                </p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full sm:w-auto min-w-[180px] h-14 rounded-2xl font-bold text-lg bg-primary shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Targets
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
