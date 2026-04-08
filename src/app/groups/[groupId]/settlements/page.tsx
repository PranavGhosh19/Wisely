
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
  Plus
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useCollection, useMemoFirebase, useFirestore, useDoc } from "@/firebase";
import { collection, query, doc, where } from "firebase/firestore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { cn, getCurrencySymbol } from "@/lib/utils";
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

interface SettlementTarget {
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
}

function SettlementsContent({ groupId }: { groupId: string }) {
  const router = useRouter();
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isGreedyActive, setIsGreedyActive] = useState(true);
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
  const { data: group, isLoading: groupLoading } = useDoc(groupRef);

  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !groupId || !user) return null;
    return query(
      collection(db, "groups", groupId, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, groupId, user]);
  const { data: groupExpenses, isLoading: expensesLoading } = useCollection(groupExpensesQuery);

  const membersQuery = useMemoFirebase(() => {
    if (!db || !group?.members || group.members.length === 0) return null;
    return query(
      collection(db, "users"),
      where("uid", "in", group.members.slice(0, 30))
    );
  }, [db, group?.members]);
  const { data: memberProfiles, isLoading: membersLoading } = useCollection(membersQuery);

  const settlementInfo = useMemo(() => {
    if (!group?.members || !groupExpenses) return { stats: {}, debts: [] };
    
    const stats: Record<string, { net: number }> = {};
    group.members.forEach(uid => stats[uid] = { net: 0 });

    groupExpenses.filter(exp => !exp.isSettled).forEach(exp => {
      if (stats[exp.paidBy]) {
        stats[exp.paidBy].net += exp.amount;
      }
      exp.splitBetween?.forEach(split => {
        if (stats[split.userId]) {
          stats[split.userId].net -= split.amount;
        }
      });
    });

    const debtors = Object.entries(stats)
      .filter(([_, s]) => s.net < -0.01)
      .map(([uid, s]) => ({ uid, amount: Math.abs(s.net) }))
      .sort((a, b) => b.amount - a.amount);
    
    const creditors = Object.entries(stats)
      .filter(([_, s]) => s.net > 0.01)
      .map(([uid, s]) => ({ uid, amount: s.net }))
      .sort((a, b) => b.amount - a.amount);

    const debts: { from: string; to: string; amount: number }[] = [];
    
    let i = 0, j = 0;
    const tempDebtors = JSON.parse(JSON.stringify(debtors));
    const tempCreditors = JSON.parse(JSON.stringify(creditors));

    while (i < tempDebtors.length && j < tempCreditors.length) {
      const amount = Math.min(tempDebtors[i].amount, tempCreditors[j].amount);
      debts.push({ from: tempDebtors[i].uid, to: tempCreditors[j].uid, amount });
      tempDebtors[i].amount -= amount;
      tempCreditors[j].amount -= amount;
      if (tempDebtors[i].amount < 0.01) i++;
      if (tempCreditors[j].amount < 0.01) j++;
    }

    return { stats, debts };
  }, [group?.members, groupExpenses]);

  const openSettleDialog = (debt: { from: string; to: string; amount: number }) => {
    const fromUser = memberProfiles?.find(m => m.uid === debt.from);
    const toUser = memberProfiles?.find(m => m.uid === debt.to);
    
    setSettlementTarget({
      from: debt.from,
      to: debt.to,
      amount: debt.amount,
      fromName: debt.from === user?.uid ? "You" : (fromUser?.name || "Member"),
      toName: debt.to === user?.uid ? "you" : (toUser?.name || "Member")
    });
    setCustomAmount(debt.amount.toFixed(2));
  };

  const handleRecordPayment = () => {
    if (!db || !groupId || !settlementTarget) return;
    
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Please enter a valid amount." });
      return;
    }

    try {
      const settlementId = `settle-${Date.now()}`;
      const settlementRef = doc(db, "groups", groupId, "expenses", settlementId);
      const settlementData = {
        id: settlementId,
        amount: amount,
        category: "Settlement",
        type: "GROUP",
        date: Date.now(),
        createdBy: user?.name || "User",
        createdById: user?.uid || "",
        paidBy: settlementTarget.from,
        splitBetween: [{ userId: settlementTarget.to, amount: amount }],
        splitType: "UNEQUAL",
        isSettled: false,
        notes: `Smart Settlement Recording`,
        groupId: groupId,
        groupMemberIds: group?.members || [],
        isDeleted: false
      };
      setDocumentNonBlocking(settlementRef, settlementData, { merge: true });
      toast({ title: "Payment Recorded", description: "Balance updated successfully." });
      setSettlementTarget(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to record payment." });
    }
  };

  if (!mounted) return null;

  const symbol = getCurrencySymbol(user?.currency);
  const isLoading = groupLoading || expensesLoading || membersLoading;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-3xl mx-auto w-full">
        <header className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 -ml-2 text-muted-foreground hover:text-primary gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Group
          </Button>
          
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold font-headline text-primary tracking-tight">Active Settlements</h1>
              <p className="text-muted-foreground">Manage payments and balance the group.</p>
            </div>

            <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border/50">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground leading-none">Smart Settle</span>
                <span className="text-[9px] font-medium text-muted-foreground">Minimize Transactions</span>
              </div>
              <Switch 
                checked={isGreedyActive} 
                onCheckedChange={setIsGreedyActive} 
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Zap className="h-8 w-8 text-primary animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b">
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <Coins className="h-5 w-5 text-accent" />
                  {isGreedyActive ? "Smart Settlements" : "Current Standings"}
                </CardTitle>
                <CardDescription>
                  {isGreedyActive 
                    ? "The most efficient way to zero out everyone's debt." 
                    : "Individual net balances for group members."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-muted">
                  {isGreedyActive ? (
                    settlementInfo.debts.length === 0 ? (
                      <div className="p-16 text-center">
                        <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Group is perfectly balanced!</h3>
                        <p className="text-muted-foreground mt-1">No transfers are needed at this time.</p>
                      </div>
                    ) : (
                      settlementInfo.debts.map((debt, idx) => {
                        const fromUser = memberProfiles?.find(m => m.uid === debt.from);
                        const toUser = memberProfiles?.find(m => m.uid === debt.to);
                        const isFromMe = debt.from === user?.uid;
                        const isToMe = debt.to === user?.uid;

                        return (
                          <div key={idx} className="p-6 hover:bg-muted/5 transition-colors group">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                              <div className="flex items-center gap-4">
                                <div className="flex -space-x-4">
                                  <Avatar className="h-12 w-12 border-4 border-card shadow-lg">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{fromUser?.name?.[0] || "?"}</AvatarFallback>
                                  </Avatar>
                                  <Avatar className="h-12 w-12 border-4 border-card shadow-lg">
                                    <AvatarFallback className="bg-accent/10 text-accent font-bold">{toUser?.name?.[0] || "?"}</AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-muted-foreground">
                                    <span className={cn("font-bold text-foreground", isFromMe && "text-primary")}>{isFromMe ? "You" : (fromUser?.name || "Member")}</span>
                                    <span className="mx-2">owes</span>
                                    <span className={cn("font-bold text-foreground", isToMe && "text-accent")}>{isToMe ? "you" : (toUser?.name || "Member")}</span>
                                  </p>
                                  <div className="text-2xl font-black tracking-tight text-foreground">
                                    {symbol}{debt.amount.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              <Button 
                                className="rounded-xl font-bold h-11 px-6 shadow-lg shadow-primary/10 group-hover:scale-105 transition-all"
                                onClick={() => openSettleDialog(debt)}
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                Settle Now
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )
                  ) : (
                    /* RAW BALANCES VIEW */
                    (() => {
                      const otherStandings = Object.entries(settlementInfo.stats)
                        .filter(([uid, s]) => uid !== user?.uid && Math.abs(s.net) > 0.01)
                        .sort((a, b) => b[1].net - a[1].net);

                      if (otherStandings.length === 0) {
                        return (
                          <div className="p-16 text-center">
                            <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Check className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold font-headline">No other active balances</h3>
                            <p className="text-muted-foreground mt-1">Everyone else in the group is settled up.</p>
                          </div>
                        );
                      }

                      return otherStandings.map(([uid, stats]) => {
                        const mUser = memberProfiles?.find(m => m.uid === uid);
                        const isOwed = stats.net > 0.01;
                        const suggestedDebt = settlementInfo.debts.find(d => d.from === uid || d.to === uid);

                        return (
                          <div key={uid} className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12 border-2 border-background">
                                <AvatarFallback className={cn("font-bold", isOwed ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive")}>
                                  {mUser?.name?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-base">{mUser?.name || "Member"}</p>
                                <p className={cn("text-[10px] font-black uppercase tracking-widest", isOwed ? "text-green-500" : "text-destructive")}>
                                  {isOwed ? "Is Owed" : "Owes Money"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <p className={cn("text-2xl font-black tabular-nums", isOwed ? "text-green-500" : "text-destructive")}>
                                {isOwed ? "+" : "-"}{symbol}{Math.abs(stats.net).toFixed(2)}
                              </p>
                              {suggestedDebt && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                  onClick={() => openSettleDialog(suggestedDebt)}
                                >
                                  Settle Now
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Settle Recording Dialog */}
      <Dialog open={!!settlementTarget} onOpenChange={(open) => !open && setSettlementTarget(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
              <Coins className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-bold font-headline">Record Payment</DialogTitle>
            <DialogDescription className="text-base">
              Recording that <span className="font-bold text-foreground">{settlementTarget?.fromName}</span> paid <span className="font-bold text-foreground">{settlementTarget?.toName}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="settle-amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Amount to Record ({symbol})</Label>
              <Input 
                id="settle-amount"
                type="number"
                step="0.01"
                className="h-16 rounded-2xl text-3xl font-black bg-muted/30 border-none px-6"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground font-medium italic mt-2 px-1">
                The total calculated debt is {symbol}{settlementTarget?.amount.toFixed(2)}. This entry will update balances for both members instantly.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button variant="ghost" className="h-12 rounded-xl font-bold order-2 sm:order-1" onClick={() => setSettlementTarget(null)}>Cancel</Button>
            <Button className="flex-1 h-12 rounded-xl font-bold bg-primary shadow-xl shadow-primary/20 transition-all active:scale-95 order-1 sm:order-2" onClick={handleRecordPayment}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GroupSettlementsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center animate-pulse text-primary font-bold">Calculating smart paths...</div>}>
      <SettlementsContent groupId={groupId} />
    </Suspense>
  );
}
