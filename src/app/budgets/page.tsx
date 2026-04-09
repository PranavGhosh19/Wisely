
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
  Legend,
  Cell
} from "recharts";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * Dedicated page for managing category-level budgets.
 * Includes a comparison chart between Budget and Actual Spends.
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

  // Fetch Expenses for spending comparison
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
      where("isDeleted", "==", false),
      where("date", ">=", monthStart),
      where("date", "<=", monthEnd)
    );
  }, [db, user, monthStart, monthEnd]);

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

  // Calculate actual spending per category
  const actualSpending = useMemo(() => {
    const spending: Record<string, number> = {};
    categories.forEach(cat => spending[cat] = 0);

    personalExpenses?.forEach(exp => {
      if (spending[exp.category] !== undefined) {
        spending[exp.category] += exp.amount;
      }
    });

    groupExpenses?.forEach(exp => {
      if (spending[exp.category] !== undefined) {
        const mySplit = exp.splitBetween?.find((s: any) => s.userId === user?.uid);
        if (mySplit) {
          spending[exp.category] += mySplit.amount;
        }
      }
    });

    return spending;
  }, [personalExpenses, groupExpenses, categories, user?.uid]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return categories.map(cat => ({
      name: cat,
      Budget: parseFloat(categoryBudgets[cat] || "0"),
      Spent: actualSpending[cat] || 0
    })).filter(item => item.Budget > 0 || item.Spent > 0);
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
            <p className="text-muted-foreground">Compare your targets with actual monthly spending.</p>
          </div>
        </header>

        <div className="grid gap-6">
          {chartData.length > 0 && (
            <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Budget vs. Spends
                </CardTitle>
                <CardDescription>Visual comparison for the current month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] sm:h-[400px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${symbol}${value}`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      formatter={(val: number) => [`${symbol}${val.toFixed(2)}`]}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                    <Bar 
                      dataKey="Budget" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      barSize={30}
                      opacity={0.3}
                    />
                    <Bar 
                      dataKey="Spent" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      barSize={30}
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
                          <span className="text-[9px] font-bold text-primary uppercase">
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
