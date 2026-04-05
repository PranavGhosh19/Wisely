"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Users, CreditCard } from "lucide-react";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, orderBy, where, collectionGroup } from "firebase/firestore";
import { getCurrencySymbol } from "@/lib/utils";

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

  // Personal Expenses Query - used for summary
  const personalExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "personalExpenses"),
      where("isDeleted", "==", false),
      orderBy("date", "desc")
    );
  }, [db, user]);

  const { data: expenses } = useCollection(personalExpensesQuery);

  // Group Expenses Query - used for summary
  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collectionGroup(db, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, user]);

  const { data: groupExpenses } = useCollection(groupExpensesQuery);

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

  const activeExpenses = expenses || [];
  const totalPersonalSpent = activeExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  /**
   * Logic for Group Spents:
   * We sum the user's specific share from every UNSETTLED group transaction.
   */
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
      </main>
    </div>
  );
}
