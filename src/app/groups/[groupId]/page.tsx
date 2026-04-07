
"use client";

import { use, useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Users, 
  Receipt, 
  TrendingUp, 
  QrCode, 
  Copy, 
  Check,
  Share2,
  Edit2,
  UserPlus,
  User as UserIcon,
  BarChart3,
  Coins,
  Zap
} from "lucide-react";
import { format } from "date-fns";
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
import { useCollection, useMemoFirebase, useFirestore, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, arrayUnion, where } from "firebase/firestore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { cn, getCurrencySymbol } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

interface SettlementTarget {
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
}

function GroupDetailContent({ groupId }: { groupId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isGreedyActive, setIsGreedyActive] = useState(false);

  // Settlement Dialog State
  const [settlementTarget, setSettlementTarget] = useState<SettlementTarget | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  const shouldShowJoin = searchParams.get("join") === "true";

  useEffect(() => {
    setMounted(true);
  }, []);

  const groupRef = useMemoFirebase(() => {
    if (!db || !groupId) return null;
    return doc(db, "groups", groupId);
  }, [db, groupId]);
  const { data: group, isLoading: groupLoading } = useDoc(groupRef);

  const isMember = group?.members?.includes(user?.uid || "");

  useEffect(() => {
    if (mounted && shouldShowJoin && group && !isMember) {
      setIsJoinDialogOpen(true);
    }
  }, [mounted, shouldShowJoin, group, isMember]);

  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !groupId || !user || !isMember) return null;
    return query(
      collection(db, "groups", groupId, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false),
      orderBy("date", "desc")
    );
  }, [db, groupId, user, isMember]);
  const { data: groupExpenses, isLoading: expensesLoading } = useCollection(groupExpensesQuery);

  const membersQuery = useMemoFirebase(() => {
    if (!db || !group?.members || group.members.length === 0) return null;
    return query(
      collection(db, "users"),
      where("uid", "in", group.members.slice(0, 30))
    );
  }, [db, group?.members]);
  const { data: memberProfiles, isLoading: membersLoading } = useCollection(membersQuery);

  // Exclude settlements from the "Total Spent" aggregate
  const totalSpent = (groupExpenses || [])
    .filter(exp => !exp.isSettled && exp.category !== 'Settlement')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const settlementInfo = useMemo(() => {
    if (!group?.members || !groupExpenses) return { stats: {}, debts: [] };
    
    const stats: Record<string, { net: number; paid: number; share: number }> = {};
    group.members.forEach(uid => stats[uid] = { net: 0, paid: 0, share: 0 });

    groupExpenses.filter(exp => !exp.isSettled).forEach(exp => {
      const isTransfer = exp.category === 'Settlement';
      
      if (stats[exp.paidBy]) {
        if (!isTransfer) stats[exp.paidBy].paid += exp.amount;
        stats[exp.paidBy].net += exp.amount;
      }
      exp.splitBetween?.forEach(split => {
        if (stats[split.userId]) {
          if (!isTransfer) stats[split.userId].share += split.amount;
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

  const handleJoinGroup = async () => {
    if (!user || !db || !groupId) return;
    setIsJoining(true);
    try {
      const gRef = doc(db, "groups", groupId);
      const uRef = doc(db, "users", user.uid);
      await updateDoc(gRef, { members: arrayUnion(user.uid) });
      await updateDoc(uRef, { groupIds: arrayUnion(groupId) });
      toast({ title: "Joined!", description: `Welcome to ${group?.name}!` });
      setIsJoinDialogOpen(false);
      router.replace(`/groups/${groupId}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error joining group", description: error.message });
    } finally {
      setIsJoining(false);
    }
  };

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

  const handleIndividualSettle = () => {
    if (!db || !groupId || !settlementTarget) return;
    
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Please enter a valid amount greater than 0." });
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
        notes: `Individual settlement payment`,
        groupId: groupId,
        groupMemberIds: group?.members || [],
        isDeleted: false
      };
      setDocumentNonBlocking(settlementRef, settlementData, { merge: true });
      toast({ title: "Payment Recorded", description: "The balance has been updated." });
      setSettlementTarget(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to record payment." });
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${groupId}` : `wisely.app/join/${groupId}`;

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Invite link is ready to share." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (groupLoading) {
    return <div className="flex h-screen items-center justify-center animate-pulse text-primary font-bold">Loading group details...</div>;
  }

  if (!group) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Group not found</h2>
          <Button variant="link" onClick={() => router.push("/groups")}>Back to Groups</Button>
        </div>
      </div>
    );
  }

  const symbol = getCurrencySymbol(user?.currency);
  const myNet = settlementInfo.stats[user?.uid || ""]?.net || 0;

  return (
    <>
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-2 -ml-2 text-muted-foreground hover:text-primary gap-2"
            onClick={() => router.push("/groups")}
          >
            <ArrowLeft className="h-4 w-4" />
            Groups
          </Button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:gap-1">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold font-headline text-primary">{group.name}</h2>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl border-primary/20 bg-card hover:bg-primary/5 hover:text-primary transition-all active:scale-95 shadow-sm"
                    onClick={() => setIsQrOpen(true)}
                  >
                    <QrCode className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50 sm:hidden">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Smart Settle</span>
                  <Switch 
                    checked={isGreedyActive} 
                    onCheckedChange={setIsGreedyActive} 
                    className="scale-75 data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
              <button 
                className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground hover:text-primary transition-colors group w-fit"
                onClick={() => setIsMembersOpen(true)}
              >
                <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium underline-offset-4 group-hover:underline">{group.members?.length || 0} Members</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border/50">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground leading-none">Smart Settle</span>
                <span className="text-[9px] font-medium text-muted-foreground">Greedy Settlement</span>
              </div>
              <Switch 
                checked={isGreedyActive} 
                onCheckedChange={setIsGreedyActive} 
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-none shadow-sm bg-card rounded-2xl relative overflow-hidden group/card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Group Spend</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity"
                    >
                      <Link href={`/groups/${groupId}/analytics`}>
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Details
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{symbol}{totalSpent.toFixed(2)}</div>
                  <div className="flex items-center gap-1 mt-1 text-accent text-[11px] font-bold uppercase">
                    <Zap className="h-3.5 w-3.5 fill-accent" />
                    Unsettled Total
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-card rounded-2xl relative overflow-hidden group/card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Net Position</CardTitle>
                    <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      {Math.abs(myNet) > 0.01 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 rounded-lg"
                          onClick={() => {
                            const myDebt = settlementInfo.debts.find(d => d.from === user?.uid || d.to === user?.uid);
                            if (myDebt) openSettleDialog(myDebt);
                          }}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Settle Up
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-accent hover:bg-accent/10 rounded-lg"
                      >
                        <Link href={`/groups/${groupId}/analytics`}>
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-3xl font-bold",
                    myNet > 0.01 ? "text-green-500" : 
                    myNet < -0.01 ? "text-destructive" : 
                    "text-foreground"
                  )}>
                    {symbol}{Math.abs(myNet).toFixed(2)}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">
                    {myNet > 0.01 ? "You are owed" : myNet < -0.01 ? "You owe" : "Settled"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
              <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-lg font-bold">Group History</CardTitle>
                <Button variant="link" asChild className="text-accent font-bold p-0 h-auto">
                  <Link href={`/groups/${groupId}/transactions`}>All Transactions</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {expensesLoading ? (
                  <div className="py-20 flex justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>
                ) : !groupExpenses || groupExpenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold font-headline">No shared expenses</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mt-1">Activities will appear here once you start tracking.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-muted">
                    {groupExpenses.slice(0, 10).map((expense) => {
                      const payerName = expense.paidBy === user?.uid 
                        ? "You" 
                        : (memberProfiles?.find(m => m.uid === expense.paidBy)?.name || "Member");
                      
                      const userShare = expense.splitBetween?.find((s: any) => s.userId === user?.uid)?.amount || 0;
                      const isPayer = expense.paidBy === user?.uid;
                      const netImpact = isPayer ? (expense.amount - userShare) : -userShare;
                      const isSettlement = expense.category === 'Settlement';

                      return (
                        <div key={expense.id} className="group flex items-center hover:bg-muted/5 transition-colors">
                          <Link 
                            href={`/expenses/${expense.id}?type=${expense.type}&groupId=${groupId}`}
                            className="flex-1 flex items-center justify-between px-6 py-5 min-w-0"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className={cn(
                                "h-12 w-12 rounded-full flex items-center justify-center text-xl shrink-0",
                                isSettlement ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                              )}>
                                {isSettlement ? <Coins className="h-6 w-6" /> : (expense.category[0] || "💰")}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-base truncate">{expense.category}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] font-medium text-muted-foreground uppercase whitespace-nowrap">
                                    {mounted ? format(expense.date, "MMM dd") : ""}
                                  </span>
                                  <span className="h-0.5 w-0.5 bg-muted-foreground rounded-full"></span>
                                  <span className="text-[10px] uppercase font-bold text-accent truncate">
                                    {payerName} {isSettlement ? "transferred" : "paid"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0 px-4">
                              <p className="font-bold text-lg text-foreground">
                                {isSettlement ? "" : "-"}{symbol}{expense.amount.toFixed(2)}
                              </p>
                              <p className={cn(
                                "text-[10px] font-bold uppercase tracking-tight",
                                netImpact > 0.01 ? "text-green-500" : netImpact < -0.01 ? "text-destructive" : "text-muted-foreground"
                              )}>
                                {isSettlement ? (
                                  isPayer ? `You paid ${symbol}${expense.amount.toFixed(2)}` : `You received ${symbol}${expense.amount.toFixed(2)}`
                                ) : (
                                  netImpact > 0.01 ? `You are owed ${symbol}${netImpact.toFixed(2)}` : 
                                  netImpact < -0.01 ? `You owe ${symbol}${Math.abs(netImpact).toFixed(2)}` : 
                                  "Not involved"
                                )}
                              </p>
                            </div>
                          </Link>
                          <div className="pr-6 shrink-0">
                            {!expense.isSettled && (
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/expenses/edit?id=${expense.id}&type=${expense.type}&groupId=${groupId}`}>
                                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden h-fit">
              <CardHeader className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
                      <Coins className="h-5 w-5 text-accent" />
                      {isGreedyActive ? "Greedy Magic" : "Active Settlements"}
                    </CardTitle>
                    <CardDescription>
                      {isGreedyActive ? "Optimized path to zero" : "Individual net standings"}
                    </CardDescription>
                  </div>
                  {isGreedyActive && <Zap className="h-5 w-5 text-primary fill-primary animate-pulse" />}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {membersLoading ? (
                  <div className="py-12 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
                ) : !isGreedyActive ? (
                  /* RAW MODE: Show net balances for everyone EXCEPT current user */
                  <div className="divide-y divide-muted">
                    {Object.entries(settlementInfo.stats).filter(([uid, s]) => uid !== user?.uid && Math.abs(s.net) > 0.01).length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="h-12 w-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Check className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold">Everyone is settled!</p>
                      </div>
                    ) : (
                      Object.entries(settlementInfo.stats)
                        .filter(([uid, s]) => uid !== user?.uid && Math.abs(s.net) > 0.01)
                        .sort((a, b) => b[1].net - a[1].net)
                        .map(([uid, stats]) => {
                          const mUser = memberProfiles?.find(m => m.uid === uid);
                          const isOwed = stats.net > 0.01;
                          // Find a relevant debt to suggest a settlement pair
                          const suggestedDebt = settlementInfo.debts.find(d => d.from === uid || d.to === uid);
                          
                          return (
                            <div key={uid} className="px-6 py-4 flex items-center justify-between group/row">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback className={cn("font-bold text-[10px]", isOwed ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive")}>
                                    {mUser?.name?.[0] || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold truncate max-w-[100px]">{mUser?.name || "Member"}</span>
                                  {suggestedDebt && (
                                    <button 
                                      className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline text-left"
                                      onClick={() => openSettleDialog(suggestedDebt)}
                                    >
                                      Settle Up
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={cn("text-sm font-black", isOwed ? "text-green-500" : "text-destructive")}>
                                  {isOwed ? "+" : "-"}{symbol}{Math.abs(stats.net).toFixed(2)}
                                </p>
                                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">
                                  {isOwed ? "is owed" : "owes"}
                                </p>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                ) : (
                  /* GREEDY MODE: Show simplified transfers */
                  <div className="divide-y divide-muted">
                    {settlementInfo.debts.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="h-12 w-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Check className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold">No transfers needed!</p>
                      </div>
                    ) : (
                      settlementInfo.debts.map((debt, idx) => {
                        const fromUser = memberProfiles?.find(m => m.uid === debt.from);
                        const toUser = memberProfiles?.find(m => m.uid === debt.to);
                        const isFromMe = debt.from === user?.uid;
                        const isToMe = debt.to === user?.uid;
                        return (
                          <div key={idx} className="px-6 py-5 group/settle">
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-3">
                                <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">{fromUser?.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                                  <AvatarFallback className="bg-accent/10 text-accent font-bold text-[10px]">{toUser?.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm leading-snug">
                                  <span className="font-bold">{isFromMe ? "You" : (fromUser?.name || "Member")}</span>
                                  <span className="text-muted-foreground mx-1">owes</span>
                                  <span className="font-black text-foreground">{symbol}{debt.amount.toFixed(2)}</span>
                                  <span className="text-muted-foreground mx-1">to</span>
                                  <span className="font-bold">{isToMe ? "you" : (toUser?.name || "Member")}</span>
                                </p>
                                <button 
                                  className="h-7 mt-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg px-3 transition-all border border-transparent hover:border-primary/20"
                                  onClick={() => openSettleDialog(debt)}
                                >
                                  Settle Up
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Settle Up Dialog */}
      <Dialog open={!!settlementTarget} onOpenChange={(open) => !open && setSettlementTarget(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-6 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold font-headline flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Settle Payment
            </DialogTitle>
            <DialogDescription>
              {settlementTarget?.fromName} paying {settlementTarget?.toName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="settle-amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount ({symbol})</Label>
              <Input 
                id="settle-amount"
                type="number"
                step="0.01"
                className="h-14 rounded-xl text-2xl font-bold bg-muted/30 border-none"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground font-medium">
                The total debt is {symbol}{settlementTarget?.amount.toFixed(2)}. You can edit this amount for partial settlements.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" className="h-11 rounded-xl font-bold" onClick={() => setSettlementTarget(null)}>Cancel</Button>
            <Button className="flex-1 h-11 rounded-xl font-bold bg-primary shadow-lg shadow-primary/10 transition-all active:scale-95" onClick={handleIndividualSettle}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-6 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold font-headline flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Group Members</DialogTitle>
            <DialogDescription>Sharing expenses in <span className="font-bold text-foreground">"{group.name}"</span>.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {membersLoading ? (
              <div className="py-8 flex flex-col items-center gap-2"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span className="text-xs text-muted-foreground">Loading members...</span></div>
            ) : memberProfiles?.map((member) => (
              <div key={member.uid} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                <Avatar className="h-10 w-10 border-2 border-background"><AvatarFallback className="bg-primary/10 text-primary font-bold">{member.name?.[0] || <UserIcon className="h-4 w-4" />}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{member.name} {member.uid === user?.uid && "(You)"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-6">
            <Button className="w-full rounded-xl font-bold h-11 gap-2 bg-primary shadow-lg shadow-primary/10 transition-all active:scale-95" onClick={() => { setIsMembersOpen(false); setIsQrOpen(true); }}>
              <UserPlus className="h-4 w-4" />Invite More Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isJoinDialogOpen} onOpenChange={(open) => { if (!isJoining) setIsJoinDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-8 border-none shadow-2xl">
          <DialogHeader className="text-center space-y-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto"><UserPlus className="h-8 w-8" /></div>
            <DialogTitle className="text-2xl font-bold font-headline">Join Group?</DialogTitle>
            <DialogDescription className="text-base">Would you like to join <span className="font-bold text-foreground">"{group?.name}"</span>?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold order-2 sm:order-1 transition-all active:scale-95" onClick={() => { setIsJoinDialogOpen(false); router.push("/dashboard"); }} disabled={isJoining}>No</Button>
            <Button className="flex-1 h-12 rounded-xl font-bold bg-primary order-1 sm:order-2 transition-all active:scale-95 shadow-lg shadow-primary/20" onClick={handleJoinGroup} disabled={isJoining}>{isJoining ? "Joining..." : "Ok"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-[1.5rem] p-5 sm:p-10 border-none shadow-2xl overflow-hidden">
          <DialogHeader className="text-center space-y-2 mb-2">
            <DialogTitle className="text-xl sm:text-2xl font-bold font-headline text-primary">Invite Members</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm px-2">Share this code with friends to join <span className="font-bold text-foreground">"{group.name}"</span></DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-5 py-2 overflow-x-hidden">
            <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] shadow-xl shadow-primary/5 border border-primary/10">
              <QRCodeSVG 
                value={shareUrl} 
                size={160} 
                level="H" 
                includeMargin={false}
                className="w-32 h-32 sm:w-40 sm:h-40"
              />
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg border border-border/40 overflow-hidden w-full">
                <span className="flex-1 text-[10px] sm:text-xs truncate text-muted-foreground font-mono block overflow-hidden">{shareUrl}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary shrink-0 rounded-md" onClick={copyToClipboard}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
              </div>
              <Button className="w-full rounded-xl font-bold h-12 gap-2 text-sm bg-primary shadow-lg shadow-primary/10 transition-all active:scale-95" onClick={copyToClipboard}><Share2 className="h-4 w-4" />Share Group Link</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      <Suspense fallback={<div className="flex h-screen items-center justify-center animate-pulse text-primary font-bold">Loading group details...</div>}>
        <GroupDetailContent groupId={groupId} />
      </Suspense>
    </div>
  );
}
