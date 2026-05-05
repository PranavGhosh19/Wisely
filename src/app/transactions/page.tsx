
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
  Loader2,
  Zap
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, where, collectionGroup, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn, getCurrencySymbol, formatCompactNumber } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="space-y-1">
            <h2 className="text-3xl md:text-5xl font-black text-glow uppercase tracking-tighter">LEDGER</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Historical Cycles / Unified View</p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-pulse" />
            <Input 
              placeholder="SCAN RECORDS..." 
              className="pl-11 h-12 rounded-2xl glass border-white/10 text-xs font-bold uppercase tracking-widest focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.header>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-[1rem] border-4 border-primary border-t-transparent glow-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Indexing Financial Vault...</p>
            </div>
          </div>
        ) : groupedTransactions.length === 0 ? (
          <Card className="glass-card p-16 text-center rounded-[2.5rem]">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto glow-primary">
                <Receipt className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline uppercase tracking-tight">Vault Empty</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchTerm ? "No records matching current search parameters." : "Initiate a financial cycle to populate your unified ledger."}
              </p>
              {!searchTerm && (
                <Button asChild className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary glow-primary mt-4">
                  <Link href="/expenses/add">Start Tracking</Link>
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-12">
            {groupedTransactions.map((group) => (
              <section key={group.monthYear} className="space-y-4">
                <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                  Cycle / {group.monthYear}
                </h3>
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {group.items.map((tx) => (
                    <motion.div key={tx.id} variants={item}>
                      <Link 
                        href={`/expenses/details?id=${tx.id}&type=${tx.type}${tx.groupId ? `&groupId=${tx.groupId}` : ''}`}
                        className="group relative block"
                      >
                        <Card className="glass-card rounded-[1.5rem] border-white/5 overflow-hidden group-hover:border-primary/30 transition-all group-hover:translate-x-2">
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardContent className="flex items-center justify-between p-5 relative z-10">
                            <div className="flex items-center gap-5 min-w-0">
                              <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 glass shadow-inner transition-transform group-hover:scale-110",
                                tx.type === 'PERSONAL' ? "text-primary glow-primary" : "text-accent glow-accent"
                              )}>
                                {tx.category[0] || "💰"}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-base uppercase tracking-tight truncate">{tx.category}</p>
                                  {tx.receiptUrl && <Zap className="h-3 w-3 text-accent fill-accent" />}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                    {format(tx.date, "MMM dd")}
                                  </span>
                                  <div className="h-1 w-1 bg-white/10 rounded-full" />
                                  <span className={cn(
                                    "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em]",
                                    tx.type === 'PERSONAL' ? "text-primary/70" : "text-accent/70"
                                  )}>
                                    {tx.type === 'PERSONAL' ? (
                                      <><User className="h-2.5 w-2.5" /> PRIVATE</>
                                    ) : (
                                      <><Users className="h-2.5 w-2.5" /> {tx.groupId ? (groupNameMap[tx.groupId] || "SHARED") : "SHARED"}</>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="font-black text-xl text-glow tracking-tighter">
                                  -{symbol}{formatCompactNumber(tx.amount)}
                                </p>
                                {tx.notes && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate max-w-[120px] opacity-60">{tx.notes}</p>}
                              </div>
                              <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
