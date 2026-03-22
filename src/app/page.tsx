
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, Users, AlertCircle } from "lucide-react";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { Expense } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const router = useRouter();
  const { user, setUser, expenses, setExpenses, setLoading, isLoading } = useStore();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/auth");
        return;
      }

      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser({
          uid: firebaseUser.uid,
          name: userData.name,
          phone: userData.phone,
          groupIds: userData.groupIds || [],
        });
      } else {
        setUser({
          uid: firebaseUser.uid,
          name: "User",
          phone: firebaseUser.phoneNumber || "",
          groupIds: [],
        });
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [router, setUser, setLoading]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "expenses"),
      where("createdBy", "==", user.uid),
      orderBy("date", "desc"),
      limit(20)
    );

    const unsubscribeExpenses = onSnapshot(q, (snapshot) => {
      const expenseList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expenseList);
    });

    return () => unsubscribeExpenses();
  }, [user, setExpenses]);

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const youAreOwed = 125.50;
  const youOwe = 45.00;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="font-medium text-muted-foreground">Loading SpenseFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold font-headline text-primary">Overview</h2>
            <p className="text-muted-foreground">Welcome back, {user?.name.split(" ")[0]}</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 gap-2"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Add Expense
          </Button>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="h-24 w-24 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <ArrowDownLeft className="h-3 w-3" />
                8.2% less than last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">You are owed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">${youAreOwed.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">From 3 people</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">You owe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">${youOwe.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">To 2 people</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm bg-white h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-lg">Recent Transactions</CardTitle>
                <Button variant="link" className="text-accent text-sm font-medium">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {expenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No expenses yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">Start tracking your spending by adding your first expense.</p>
                    </div>
                  ) : (
                    expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center text-lg",
                            expense.type === 'PERSONAL' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                          )}>
                            {expense.category[0] || "💰"}
                          </div>
                          <div>
                            <p className="font-medium">{expense.category}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{format(expense.date, "MMM dd, yyyy")}</span>
                              <span className="h-1 w-1 bg-muted-foreground rounded-full"></span>
                              <span className={cn(
                                "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded",
                                expense.type === 'PERSONAL' ? "bg-primary/5 text-primary" : "bg-accent/5 text-accent"
                              )}>
                                {expense.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">-${expense.amount.toFixed(2)}</p>
                          {expense.notes && <p className="text-xs text-muted-foreground truncate max-w-[120px]">{expense.notes}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm opacity-90">Keep track of shared costs with friends, roommates, and travel buddies.</p>
                  <Button variant="secondary" className="w-full font-bold" asChild>
                    <Link href="/groups">Manage Groups</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Quick Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Food & Drinks</span>
                    <span className="font-bold">35%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[35%]"></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rent & Bills</span>
                    <span className="font-bold">42%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-accent h-full w-[42%]"></div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link href="/analytics">Full Report</Link>
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
