
"use client";

import { useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  Search, 
  User, 
  Users, 
  ArrowRight, 
  FileText, 
  Loader2 
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, where, collectionGroup, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn, getCurrencySymbol } from "@/lib/utils";

export default function AllTransactionsPage() {
  const { user } = useStore();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const personalQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "personalExpenses"),
      where("isDeleted", "==", false),
      orderBy("date", "desc")
    );
  }, [db, user]);
  const { data: personalExpenses, isLoading: loadingPersonal } = useCollection(personalQuery);

  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collectionGroup(db, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, user]);
  const { data: groupExpenses, isLoading: loadingGroups } = useCollection(groupExpensesQuery);

  const groupsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "groups"), where("members", "array-contains", user.uid));
  }, [db, user]);
  const { data: userGroups } = useCollection(groupsQuery);

  const groupNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    userGroups?.forEach(g => {
      map[g.id] = g.name;
    });
    return map;
  }, [userGroups]);

  const allTransactions = useMemo(() => {
    const merged = [...(personalExpenses || []), ...(groupExpenses || [])];
    return merged
      .filter(exp => 
        exp.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => b.date - a.date);
  }, [personalExpenses, groupExpenses, searchTerm]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, any[]> = {};
    allTransactions.forEach((tx) => {
      const monthYear = format(new Date(tx.date), "MMMM yyyy");
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(tx);
    });
    return Object.entries(groups).map(([monthYear, items]) => ({
      monthYear,
      items
    }));
  }, [allTransactions]);

  if (!mounted) return null;

  const isLoading = loadingPersonal || loadingGroups;
  const symbol = getCurrencySymbol(user?.currency);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold font-headline text-primary">Transaction History</h2>
            <p className="text-muted-foreground">All your private and shared expenses in one place.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search category or notes..." 
              className="pl-9 rounded-xl bg-card border-none h-11 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Loading history...</p>
            </div>
          </div>
        ) : groupedTransactions.length === 0 ? (
          <Card className="border-none shadow-sm bg-card p-16 text-center rounded-2xl">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                <Receipt className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline">No records found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "No results match your search." : "Your expenses will appear here once you start tracking."}
              </p>
              {!searchTerm && (
                <Button asChild variant="outline" className="rounded-xl mt-4">
                  <Link href="/expenses/add">Record first expense</Link>
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupedTransactions.map((group) => (
              <section key={group.monthYear} className="space-y-3">
                <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {group.monthYear}
                </h3>
                <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-muted">
                      {group.items.map((tx) => (
                        <Link 
                          key={tx.id} 
                          href={`/expenses/details?id=${tx.id}&type=${tx.type}${tx.groupId ? `&groupId=${tx.groupId}` : ''}`}
                          className="group flex items-center justify-between px-6 py-5 hover:bg-muted/5 transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={cn(
                              "h-12 w-12 rounded-full flex items-center justify-center text-xl shrink-0",
                              tx.type === 'PERSONAL' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                            )}>
                              {tx.category[0] || "💰"}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-base truncate">{tx.category}</p>
                                {tx.receiptUrl && <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-medium text-muted-foreground uppercase">
                                  {format(tx.date, "MMM dd")}
                                </span>
                                <span className="h-0.5 w-0.5 bg-muted-foreground rounded-full"></span>
                                <span className={cn(
                                  "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider",
                                  tx.type === 'PERSONAL' ? "text-primary" : "text-accent"
                                )}>
                                  {tx.type === 'PERSONAL' ? (
                                    <><User className="h-2.5 w-2.5" /> Personal</>
                                  ) : (
                                    <><Users className="h-2.5 w-2.5" /> {tx.groupId ? (groupNameMap[tx.groupId] || "Shared") : "Shared"}</>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-lg text-foreground">
                                -{symbol}{tx.amount.toFixed(2)}
                              </p>
                              {tx.notes && <p className="text-[11px] text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">{tx.notes}</p>}
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
