"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Users, CreditCard, PieChart as PieChartIcon, ArrowRight } from "lucide-react";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, orderBy, where, collectionGroup } from "firebase/firestore";
import { getCurrencySymbol } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ['#3D737F', '#CEC7BF', '#07161B', '#5A9BA8', '#8FBABF', '#A89E92'];

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: storeLoading } = useStore();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!storeLoading && !user) {
      router.push("/auth");
    }
  }, [user, router, storeLoading]);

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

  // Calculate Category Data for Donut Chart
  const categoryData = useMemo(() => {
    if (!personalExpenses && !groupExpenses) return [];
    
    const categories: Record<string, number> = {};
    
    // Process Personal
    (personalExpenses || []).forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    
    // Process Group Share
    (groupExpenses || []).forEach(exp => {
      const mySplit = exp.splitBetween?.find((s: any) => s.userId === user?.uid);
      if (mySplit) {
        categories[exp.category] = (categories[exp.category] || 0) + mySplit.amount;
      }
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [personalExpenses, groupExpenses, user?.uid]);

  if (storeLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="font-medium text-muted-foreground animate-pulse">Loading Wisely...</p>
        </div>
      </div>
    );
  }

  const activeExpenses = personalExpenses || [];
  const totalPersonalSpent = activeExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalUserGroupShare = (groupExpenses || [])
    .filter(exp => !exp.isSettled)
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

          <Card className="border-none shadow-sm bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-between h-20 relative overflow-hidden group">
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-tight">Total Outstanding</span>
            </div>
            <div className="text-xl font-bold relative z-10 shrink-0">{symbol}{totalOverallSpent.toFixed(2)}</div>
          </Card>
        </div>

        {/* Analyst & Stats Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Analyst Insights Card */}
          <Card className="border-none shadow-sm bg-card rounded-2xl md:col-span-2 lg:col-span-1">
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
                <p className="text-sm font-medium leading-relaxed">
                  {categoryData.length > 0 ? (
                    <>
                      Your biggest expense category is <span className="text-primary font-bold">"{categoryData[0]?.name}"</span>, 
                      accounting for {((categoryData[0]?.value / totalOverallSpent) * 100).toFixed(1)}% of your total outgoings. 
                      Consider reviewing this area to optimize your monthly budget.
                    </>
                  ) : (
                    "No data available yet. Start tracking your expenses to see detailed automated analysis."
                  )}
                </p>
              </div>
              <Button variant="outline" asChild className="w-full rounded-xl gap-2 font-bold h-11">
                <Link href="/analytics">
                  Full Reports
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Donut Chart Card */}
          <Card className="border-none shadow-sm bg-card rounded-2xl md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-headline">Category Distribution</CardTitle>
                <CardDescription>Combined breakdown of all expenses</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[250px] w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderRadius: '12px', 
                        border: '1px solid hsl(var(--border))',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`${symbol}${value.toFixed(2)}`, 'Spent']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
                  <PieChartIcon className="h-12 w-12 mb-2" />
                  <p className="text-sm">Add data to see distribution</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
