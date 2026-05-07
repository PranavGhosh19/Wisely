"use client";

import { use, useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Coins, 
  Zap, 
  Check, 
  User as UserIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Cpu
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useCollection, useMemoFirebase, useFirestore, useDoc } from "@/firebase";
import { collection, query, doc, where } from "firebase/firestore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { cn, getCurrencySymbol, formatCompactNumber } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, Expense, Group, SimplifiedDebt } from "@/types";
import { motion } from "framer-motion";

interface SettlementTarget {
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
}

function SettlementsContent() {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const groupId = searchParams?.get('groupId');
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isGreedyActive, setIsGreedyActive] = useState(true);
  const [hasSetInitial, setHasSetInitial] = useState(false);
  const [settlementTarget, setSettlementTarget] = useState<SettlementTarget | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const groupRef = useMemoFirebase(() => {
    if (!db || !groupId) return null;
    return doc(db, "groups", groupId);
  }, [db, groupId]);
  const { data: group, isLoading: groupLoading } = useDoc<Group>(groupRef);

  useEffect(() => {
    if (group && !hasSetInitial && group.isSmartSettleEnabled !== undefined) {
      setIsGreedyActive(group.isSmartSettleEnabled);
      setHasSetInitial(true);
    }
  }, [group, hasSetInitial]);

  const handleToggleSmartSettle = (checked: boolean) => {
    setIsGreedyActive(checked);
    if (groupId && db) {
      const gRef = doc(db, "groups", groupId);
      updateDocumentNonBlocking(gRef, { isSmartSettleEnabled: checked });
    }
  };

  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !groupId || !user) return null;
    return query(
      collection(db, "groups", groupId, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, groupId, user]);
  const { data: groupExpenses, isLoading: expensesLoading } = useCollection<Expense>(groupExpensesQuery);

  const membersQuery = useMemoFirebase(() => {
    if (!db || !group?.members || group.members.length === 0) return null;
    return query(
      collection(db, "users"),
      where("uid", "in", group.members.slice(0, 30))
    );
  }, [db, group?.members]);
  const { data: memberProfiles, isLoading: membersLoading } = useCollection<User>(membersQuery);

  const settlementInfo = useMemo(() => {
    if (!group?.members || !groupExpenses) return { stats: {}, debts: [], rawDebts: [] };
    const stats: Record<string, { net: number }> = {};
    group.members.forEach(uid => stats[uid] = { net: 0 });
    const rawDebtMap: Record<string, number> = {};

    groupExpenses.filter(exp => !exp.isSettled).forEach(exp => {
      if (stats[exp.paidBy]) stats[exp.paidBy].net += exp.amount;
      exp.splitBetween?.forEach(split => {
        if (stats[split.userId]) stats[split.userId].net -= split.amount;
        if (split.userId !== exp.paidBy && split.amount > 0.01) {
          const key = `${split.userId}_${exp.paidBy}`;
          rawDebtMap[key] = (rawDebtMap[key] || 0) + split.amount;
        }
      });
    });

    const rawDebts: SimplifiedDebt[] = [];
    const processed = new Set<string>();
    Object.keys(rawDebtMap).forEach(key => {
      if (processed.has(key)) return;
      const [u1, u2] = key.split('_');
      const revKey = `${u2}_${u1}`;
      const a1 = rawDebtMap[key] || 0;
      const a2 = rawDebtMap[revKey] || 0;
      if (a1 > a2) rawDebts.push({ from: u1, to: u2, amount: a1 - a2 });
      else if (a2 > a1) rawDebts.push({ from: u2, to: u1, amount: a2 - a1 });
      processed.add(key); processed.add(revKey);
    });

    const debtors = Object.entries(stats).filter(([_, s]) => s.net < -0.01).map(([uid, s]) => ({ uid, amount: Math.abs(s.net) })).sort((a, b) => b.amount - a.amount);
    const creditors = Object.entries(stats).filter(([_, s]) => s.net > 0.01).map(([uid, s]) => ({ uid, amount: s.net })).sort((a, b) => b.amount - a.amount);
    const optimizedDebts: SimplifiedDebt[] = [];
    let i = 0, j = 0;
    const tempDebtors = JSON.parse(JSON.stringify(debtors));
    const tempCreditors = JSON.parse(JSON.stringify(creditors));
    while (i < tempDebtors.length && j < tempCreditors.length) {
      const amount = Math.min(tempDebtors[i].amount, tempCreditors[j].amount);
      optimizedDebts.push({ from: tempDebtors[i].uid, to: tempCreditors[j].uid, amount });
      tempDebtors[i].amount -= amount; tempCreditors[j].amount -= amount;
      if (tempDebtors[i].amount < 0.01) i++;
      if (tempCreditors[j].amount < 0.01) j++;
    }
    return { stats, debts: optimizedDebts, rawDebts };
  }, [group?.members, groupExpenses]);

  const activeDebtsToShow = useMemo(() => {
    if (!user) return [];
    const base = isGreedyActive ? settlementInfo.debts : settlementInfo.rawDebts;
    return base.filter(debt => debt.from === user.uid || debt.to === user.uid);
  }, [settlementInfo, isGreedyActive, user]);

  const openSettleDialog = (debt: SimplifiedDebt) => {
    const fromUser = memberProfiles?.find(m => m.uid === debt.from);
    const toUser = memberProfiles?.find(m => m.uid === debt.to);
    setSettlementTarget({
      from: debt.from, to: debt.to, amount: debt.amount,
      fromName: debt.from === user?.uid ? "You" : (fromUser?.name || "Member"),
      toName: debt.to === user?.uid ? "you" : (toUser?.name || "Member")
    });
    setCustomAmount(debt.amount.toFixed(2));
  };

  const handleRecordPayment = () => {
    if (!db || !groupId || !settlementTarget) return;
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) return;
    try {
      const settlementId = `settle-${Date.now()}`;
      const settlementRef = doc(db, "groups", groupId, "expenses", settlementId);
      const settlementData = {
        id: settlementId, amount: amount, category: "Settlement", type: "GROUP", date: Date.now(),
        createdBy: user?.name || "User", createdById: user?.uid || "", paidBy: settlementTarget.from,
        splitBetween: [{ userId: settlementTarget.to, amount: amount }], splitType: "UNEQUAL", isSettled: false,
        notes: isGreedyActive ? "Smart Settle Sync" : "Direct Settle Sync",
        groupId: groupId, groupMemberIds: group?.members || [], isDeleted: false
      };
      setDocumentNonBlocking(settlementRef, settlementData, { merge: true });
      toast({ title: "Cycle Recorded", description: "Ledger synchronized." });
      setSettlementTarget(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Protocol error." });
    }
  };

  if (!mounted) return null;
  if (!groupId) return <div className="h-screen flex items-center justify-center bg-background"><Card className="glass-card p-12 text-center rounded-[3rem] border-dashed border-white/10 max-w-md"><h2 className="text-xl font-black uppercase tracking-tight text-glow">Node Unlinked</h2><p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-4">Missing sector context for clearance.</p></Card></div>;

  const symbol = getCurrencySymbol(user?.currency);
  const isLoading = groupLoading || expensesLoading || membersLoading;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-3xl mx-auto w-full">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <button className="mb-4 -ml-2 text-muted-foreground hover:text-primary gap-2 flex items-center transition-all px-2 py-1 uppercase font-black text-[10px] tracking-widest" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" />Back to Sector</button>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-black text-glow uppercase tracking-tighter">CLEARANCE</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Network Balancing / Node Payloads</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 group">
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Smart Settle</span>
                <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Optimization Engine</span>
              </div>
              <Switch checked={isGreedyActive} onCheckedChange={handleToggleSmartSettle} className="data-[state=checked]:bg-primary" />
            </div>
          </div>
        </motion.header>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-12 w-12 text-primary animate-spin glow-primary" /></div>
        ) : (
          <div className="space-y-6">
            <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
              <CardHeader className="bg-white/5 border-b border-white/5 px-8 py-6">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                  <Coins className="h-4 w-4 text-accent fill-accent" />
                  {isGreedyActive ? "Calculated Paths" : "Direct Node Links"}
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                  {isGreedyActive ? "Minimized transaction payloads for efficient clearance." : "Raw debt data between network nodes."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {activeDebtsToShow.length === 0 ? (
                    <div className="p-20 text-center">
                      <div className="h-16 w-16 glass text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-primary border-green-500/20"><Check className="h-8 w-8" /></div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-glow">Node Balanced</h3>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-2">Zero variance detected in your node profile.</p>
                    </div>
                  ) : (
                    activeDebtsToShow.map((debt, idx) => {
                      const fromUser = memberProfiles?.find(m => m.uid === debt.from);
                      const toUser = memberProfiles?.find(m => m.uid === debt.to);
                      const isFromMe = debt.from === user?.uid;
                      const isToMe = debt.to === user?.uid;
                      return (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="p-8 hover:bg-white/5 transition-all group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                              <div className="flex -space-x-6">
                                <Avatar className="h-14 w-14 border-4 border-background glass shadow-2xl z-20"><AvatarFallback className="bg-primary/20 text-primary font-black uppercase text-xs">{fromUser?.name?.[0]}</AvatarFallback></Avatar>
                                <Avatar className="h-14 w-14 border-4 border-background glass shadow-2xl z-10"><AvatarFallback className="bg-accent/20 text-accent font-black uppercase text-xs">{toUser?.name?.[0]}</AvatarFallback></Avatar>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  <span className={cn("text-foreground font-black", isFromMe && "text-primary")}>{isFromMe ? "YOU" : (fromUser?.name || "NODE").toUpperCase()}</span>
                                  <span className="mx-2 opacity-30">▶</span>
                                  <span className={cn("text-foreground font-black", isToMe && "text-accent")}>{isToMe ? "YOU" : (toUser?.name || "NODE").toUpperCase()}</span>
                                </p>
                                <div className="text-3xl font-black tracking-tighter text-glow">{symbol}{formatCompactNumber(debt.amount)}</div>
                              </div>
                            </div>
                            <Button className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-primary glow-primary shadow-xl group-hover:scale-105 transition-all active:scale-95" onClick={() => openSettleDialog(debt)}><Zap className="h-4 w-4 mr-2" />Execute</Button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={!!settlementTarget} onOpenChange={(open) => !open && setSettlementTarget(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-[2rem] p-8 border-none shadow-2xl glass-card">
          <DialogHeader className="mb-8 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 glow-primary"><Coins className="h-8 w-8" /></div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-glow">Sync Clearance</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Record node payload</DialogDescription>
          </DialogHeader>
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">Clearance Value ({symbol})</Label>
              <Input type="number" step="0.01" className="h-20 rounded-[2rem] text-4xl font-black bg-white/5 border-none text-glow focus:ring-primary px-6" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} autoFocus />
              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest text-center opacity-40">Target calculated: {symbol}{settlementTarget?.amount.toFixed(2)}</p>
            </div>
          </div>
          <DialogFooter className="mt-10 gap-3">
            <Button variant="ghost" className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => setSettlementTarget(null)}>Abort</Button>
            <Button className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary glow-primary transition-all active:scale-95" onClick={handleRecordPayment}>Synchronize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GroupSettlementsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary glow-primary" /></div>}>
      <SettlementsContent />
    </Suspense>
  );
}
