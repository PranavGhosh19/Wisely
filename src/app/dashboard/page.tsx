"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Users, AlertCircle } from "lucide-react";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: storeLoading } = useStore();
  const db = useFirestore();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!storeLoading && !user) {
      router.push("/auth");
    }
  }, [user, router, storeLoading]);

  // UseCollection for personal expenses based on hierarchical rules
  const personalExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "personalExpenses"),
      orderBy("date", "desc")
    );
  }, [db, user]);

  const { data: expenses, isLoading: expensesLoading } = useCollection(personalExpensesQuery);

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

  const activeExpenses = expenses?.filter(e => !e.isDeleted) || [];
  const totalSpent = activeExpenses.reduce((acc, curr) => acc + curr.amount, 0);

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
            className="bg-primary hover:bg-primary/90 gap-2 h-11 md:h-10 text-base md:text-sm font-semibold rounded-xl"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Add Expense
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden relative rounded-2xl">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Wallet className="h-16 w-16 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${totalSpent.toFixed(2)}</div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">Tracking from private records</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{user.groupIds?.length || 0}</div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">Shared spaces</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm bg-white h-full rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="font-headline text-lg font-bold">Recent Personal Activity</CardTitle>
                <Button variant="link" className="text-accent text-sm font-bold p-0">View All</Button>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="divide-y divide-muted">
                  {expensesLoading ? (
                    <div className="py-12 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
                  ) : activeExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-bold">No private expenses</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mt-1">Your personal activity will appear here.</p>
                    </div>
                  ) : (
                    activeExpenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-4 sm:p-0 sm:py-6 first:pt-0 last:pb-0 group transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                            {expense.category[0] || "💰"}
                          </div>
                          <div>
                            <p className="font-bold text-sm sm:text-base">{expense.category}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-medium text-muted-foreground uppercase">
                                {mounted ? format(expense.date, "MMM dd") : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-base sm:text-lg text-foreground">-${expense.amount.toFixed(2)}</p>
                          {expense.notes && <p className="text-[11px] text-muted-foreground truncate max-w-[100px] sm:max-w-[150px]">{expense.notes}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary text-primary-foreground rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
                  <span className="bg-white/20 p-1.5 rounded-lg"><Users className="h-4 w-4" /></span>
                  Shared Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm opacity-90 leading-relaxed">Collaborate on shared costs with your groups.</p>
                  <Button variant="secondary" className="w-full font-bold h-10 rounded-xl" asChild>
                    <Link href="/groups">Manage Groups</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AddExpenseDialog 
          open={isAddExpenseOpen} 
          onOpenChange={setIsAddExpenseOpen} 
        />
      </main>
    </div>
  );
}