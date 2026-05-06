
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Edit2, 
  Tag, 
  Users,
  Wallet,
  Receipt,
  Trash2,
  Loader2,
  Calendar,
  Zap,
  ShieldAlert
} from "lucide-react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { useDoc, useFirestore, useMemoFirebase, useCollection, deleteDocumentNonBlocking } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { ExpenseType } from "@/types";
import Image from "next/image";
import { cn, getCurrencySymbol, formatCompactNumber } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

function ExpenseDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const type = searchParams.get("type") as ExpenseType;
  const groupId = searchParams.get("groupId");
  const { user, deleteExpense: deleteExpenseFromStore } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const docRef = useMemoFirebase(() => {
    if (!db || !user || !id || !type) return null;
    if (type === "PERSONAL") return doc(db, "users", user.uid, "personalExpenses", id);
    if (type === "GROUP" && groupId) return doc(db, "groups", groupId, "expenses", id);
    return null;
  }, [db, user, id, type, groupId]);

  const { data: expense, isLoading } = useDoc(docRef);

  const membersQuery = useMemoFirebase(() => {
    if (!db || !expense?.groupMemberIds || expense.groupMemberIds.length === 0) return null;
    return query(collection(db, "users"), where("uid", "in", expense.groupMemberIds));
  }, [db, expense?.groupMemberIds]);
  const { data: memberProfiles } = useCollection(membersQuery);

  const handleDelete = () => {
    if (!docRef || !user || !id) return;
    deleteDocumentNonBlocking(docRef, user.uid, user.name);
    deleteExpenseFromStore(id);
    toast({ title: "Cycle Deleted", description: "Record removed from unified ledger." });
    router.back();
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary glow-primary" /></div>;

  if (!expense || expense.isDeleted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <Card className="glass-card p-12 text-center rounded-[3rem] border-dashed border-white/10 max-w-md">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-6 opacity-40" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-glow">Signal Lost</h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-4 mb-8">This transaction cycle no longer exists in the vault.</p>
          <Button onClick={() => router.back()} className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary glow-primary">Return to Command</Button>
        </Card>
      </div>
    );
  }

  const payer = memberProfiles?.find(m => m.uid === expense.paidBy);
  const payerName = expense.paidBy === user?.uid ? "YOU" : (payer?.name || "PEER").toUpperCase();
  const symbol = getCurrencySymbol(user?.currency);

  return (
    <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-3xl mx-auto w-full">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center justify-between"
      >
        <button 
          className="text-muted-foreground hover:text-primary gap-2 flex items-center transition-all px-2 py-1 uppercase font-black text-[10px] tracking-widest"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl glass border-white/5 hover:bg-destructive/10 hover:text-destructive transition-all">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-card rounded-[2rem] border-none shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter text-glow">Purge Record?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs uppercase font-bold tracking-widest opacity-60">
                  This action will permanently delist this cycle from the ledger.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 gap-3">
                <AlertDialogCancel className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">Abort</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 glow-destructive h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">
                  Confirm Purge
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button asChild className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 h-10 px-4 bg-primary glow-primary">
            <Link href={`/expenses/edit?id=${expense.id}&type=${expense.type}${groupId ? `&groupId=${groupId}` : ''}`}>
              <Edit2 className="h-3.5 w-3.5" />
              Edit Cycle
            </Link>
          </Button>
        </div>
      </motion.header>

      <div className="space-y-10">
        <motion.section 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <div className="inline-flex h-20 w-20 glass rounded-[2.5rem] items-center justify-center text-primary mb-6 glow-primary">
            <Receipt className="h-10 w-10" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-glow">
            {symbol}{formatCompactNumber(expense.amount)}
          </h1>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{expense.category}</span>
            <div className="h-1 w-1 bg-white/20 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">{format(expense.date, "MMM dd, yyyy")}</span>
          </div>
        </motion.section>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card rounded-[2rem] border-white/5 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
              <CardHeader className="pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                  <Wallet className="h-3.5 w-3.5 text-primary" />
                  Source Node
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Paid By</p>
                  <p className="text-lg font-black text-primary uppercase tracking-tight">{payerName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Vault Status</p>
                  <p className="text-xs font-black uppercase tracking-widest text-foreground">
                    {expense.type === 'GROUP' ? 'SHARED NETWORK' : 'PRIVATE VAULT'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card rounded-[2rem] border-white/5 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-30" />
              <CardHeader className="pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                  <Tag className="h-3.5 w-3.5 text-accent" />
                  Meta Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Recorded By</p>
                  <p className="text-sm font-black uppercase tracking-tight">{expense.createdBy}</p>
                </div>
                {expense.notes && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Signal Notes</p>
                    <p className="text-xs font-bold italic leading-relaxed text-muted-foreground">"{expense.notes}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {expense.type === 'GROUP' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2">
              <Card className="glass-card rounded-[2rem] border-white/5 relative overflow-hidden">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Peer Distribution ({expense.splitType})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {expense.splitBetween?.map((split: any) => {
                      const member = memberProfiles?.find(m => m.uid === split.userId);
                      return (
                        <div key={split.userId} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl glass border-white/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                              {member?.name?.[0] || "?"}
                            </div>
                            <span className="text-xs font-black uppercase tracking-tight">{member?.uid === user?.uid ? "YOU" : (member?.name || "PEER")}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black tracking-tight text-glow">{symbol}{formatCompactNumber(split.amount)}</p>
                            {split.percentage && <p className="text-[9px] font-black text-primary uppercase tracking-widest">{split.percentage}% LOAD</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {expense.receiptUrl && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="md:col-span-2">
              <Card className="glass-card rounded-[2rem] border-white/5 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                    <Receipt className="h-3.5 w-3.5 text-accent" />
                    Record capture
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 flex justify-center bg-black/20">
                  <div className="relative w-full max-w-sm aspect-[3/4] shadow-2xl rounded-2xl overflow-hidden border border-white/10 group">
                    <Image src={expense.receiptUrl} alt="Receipt Capture" fill className="object-contain transition-transform group-hover:scale-105 duration-700" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function TransactionDetailPage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar">
      <Navbar />
      <Suspense fallback={null}>
        <ExpenseDetailContent />
      </Suspense>
    </div>
  );
}
