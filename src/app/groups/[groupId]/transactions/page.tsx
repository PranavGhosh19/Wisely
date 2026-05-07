"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Receipt, FileText, Edit2, Search, Zap, Coins } from "lucide-react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { useCollection, useMemoFirebase, useFirestore, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, where } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn, getCurrencySymbol, formatCompactNumber } from "@/lib/utils";
import { motion } from "framer-motion";

export default function GroupTransactionsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { user } = useStore();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const groupRef = useMemoFirebase(() => {
    if (!db || !groupId) return null;
    return doc(db, "groups", groupId);
  }, [db, groupId]);
  const { data: group } = useDoc(groupRef);

  const isMember = group?.members?.includes(user?.uid || "");

  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !groupId || !user || !isMember) return null;
    return query(
      collection(db, "groups", groupId, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false),
      orderBy("date", "desc")
    );
  }, [db, groupId, user, isMember]);
  const { data: groupExpenses, isLoading } = useCollection(groupExpensesQuery);

  const membersQuery = useMemoFirebase(() => {
    if (!db || !group?.members || group.members.length === 0) return null;
    return query(
      collection(db, "users"),
      where("uid", "in", group.members.slice(0, 30))
    );
  }, [db, group?.members]);
  const { data: memberProfiles } = useCollection(membersQuery);

  const filteredExpenses = (groupExpenses || []).filter(exp => 
    exp.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredExpenses.forEach((expense) => {
      const monthYear = format(new Date(expense.date), "MMMM yyyy");
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(expense);
    });
    return Object.entries(groups).map(([monthYear, items]) => ({
      monthYear,
      items
    }));
  }, [filteredExpenses]);

  if (!mounted) return null;

  const symbol = getCurrencySymbol(user?.currency);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button 
            className="mb-4 -ml-2 text-muted-foreground hover:text-primary gap-2 flex items-center transition-all px-2 py-1 uppercase font-black text-[10px] tracking-widest"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-5xl font-black text-glow uppercase tracking-tighter">LEDGER SCAN</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">{group?.name || "Shared History"}</p>
            </div>
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-pulse" />
              <Input 
                placeholder="SCAN TRANSACTIONS..." 
                className="pl-11 h-12 rounded-2xl glass border-white/10 text-xs font-bold uppercase tracking-widest focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </motion.header>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-[1rem] border-4 border-primary border-t-transparent glow-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Indexing Sector Records...</p>
            </div>
          </div>
        ) : groupedExpenses.length === 0 ? (
          <Card className="glass-card p-16 text-center rounded-[2.5rem]">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto glow-primary">
                <Receipt className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline uppercase tracking-tight">Vault Empty</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchTerm ? "No records matching current search parameters." : "Your group activity will appear here once cycles are initialized."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-12">
            {groupedExpenses.map((groupData) => (
              <section key={groupData.monthYear} className="space-y-4">
                <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                  Cycle / {groupData.monthYear}
                </h3>
                <div className="space-y-3">
                  {groupData.items.map((expense) => {
                    const payerName = expense.paidBy === user?.uid 
                      ? "You" 
                      : (memberProfiles?.find(m => m.uid === expense.paidBy)?.name || "Member");

                    const userShare = expense.splitBetween?.find((s: any) => s.userId === user?.uid)?.amount || 0;
                    const isPayer = expense.paidBy === user?.uid;
                    const netImpact = isPayer ? (expense.amount - userShare) : -userShare;
                    const isSettlement = expense.category === 'Settlement';

                    return (
                      <div key={expense.id} className="group relative">
                        <Link 
                          href={`/expenses/details?id=${expense.id}&type=${expense.type}&groupId=${groupId}`}
                          className="block"
                        >
                          <Card className="glass-card rounded-[1.5rem] border-white/5 overflow-hidden group-hover:border-primary/30 transition-all group-hover:translate-x-2">
                            <CardContent className="flex items-center justify-between p-5">
                              <div className="flex items-center gap-5 min-w-0">
                                <div className={cn(
                                  "h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 glass shadow-inner transition-transform group-hover:scale-110",
                                  isSettlement ? "text-accent glow-accent" : "text-primary glow-primary"
                                )}>
                                  {isSettlement ? <Coins className="h-6 w-6" /> : (expense.category[0] || "💰")}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-black text-base uppercase tracking-tight truncate">{expense.category}</p>
                                    {expense.receiptUrl && <Zap className="h-3.5 w-3.5 text-accent fill-accent" />}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                      {format(expense.date, "MMM dd")}
                                    </span>
                                    <div className="h-1 w-1 bg-white/10 rounded-full"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-accent truncate">
                                      {payerName} paid
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0 px-4">
                                <p className="font-black text-xl text-glow tracking-tighter">
                                  {isSettlement ? "" : "-"}{symbol}{formatCompactNumber(expense.amount)}
                                </p>
                                <p className={cn(
                                  "text-[9px] font-black uppercase tracking-widest",
                                  netImpact > 0.01 ? "text-green-500" : netImpact < -0.01 ? "text-destructive" : "text-muted-foreground"
                                )}>
                                  {isSettlement ? (
                                    isPayer ? `Outflow` : `Inflow`
                                  ) : (
                                    netImpact > 0.01 ? `+${symbol}${formatCompactNumber(netImpact)}` : 
                                    netImpact < -0.01 ? `-${symbol}${formatCompactNumber(Math.abs(netImpact))}` : 
                                    "Balanced"
                                  )}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                        {!expense.isSettled && (
                          <Button 
                            asChild
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          >
                            <Link href={`/expenses/edit?id=${expense.id}&type=${expense.type}&groupId=${groupId}`}>
                              <Edit2 className="h-4 w-4 text-primary" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
