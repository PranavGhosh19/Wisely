"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
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
  QrCode, 
  Copy, 
  Check,
  Share2,
  Edit2,
  UserPlus,
  BarChart3,
  Coins,
  Zap,
  BellRing,
  Loader2
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
import { useToast } from "@/hooks/use-toast";
import { useCollection, useMemoFirebase, useFirestore, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, arrayUnion, where } from "firebase/firestore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { cn, getCurrencySymbol, formatCompactNumber } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

interface SettlementTarget {
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
}

function GroupDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const totalSpent = (groupExpenses || [])
    .filter(exp => !exp.isSettled && exp.category !== 'Settlement')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const settlementInfo = useMemo(() => {
    if (!group?.members || !groupExpenses) return { stats: {}, debts: [] };
    
    const stats: Record<string, { net: number; paid: number; share: number }> = {};
    group.members.forEach(uid => 
      stats[uid] = { net: 0, paid: 0, share: 0 }
    );

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
      router.replace(`/groups/details?groupId=${groupId}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error joining group", description: error.message });
    } finally {
      setIsJoining(false);
    }
  };

  const handleIndividualSettle = () => {
    if (!db || !groupId || !settlementTarget) return;
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Positive amount required." });
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
      toast({ title: "Payment Recorded", description: "Vault ledger updated." });
      setSettlementTarget(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Failed to record payment." });
    }
  };

  const simulateGroupNotification = async () => {
    if (!("Notification" in window)) {
      toast({ title: "Signal Error", description: "System doesn't support push notifications." });
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      toast({ title: "Heuristic Link", description: "Signal ping in 3 seconds." });
      setTimeout(async () => {
        await registration.showNotification(`New Bill in ${group?.name || 'Sector'}`, {
          body: `💸 ${user?.name} just added a ${getCurrencySymbol(user?.currency)}50.00 expense.`,
          icon: '/wallet.png',
          badge: '/wallet.png',
        });
      }, 3000);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/join?groupId=${groupId}` : `wisely.app/join?groupId=${groupId}`;
  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link Secured", description: "Invite link copied to memory." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareToWhatsApp = () => {
    const text = `Join my sector "${group?.name || 'Shared Expenses'}" on Wisely to track and split expenses together! ${shareUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.location.href = whatsappUrl;
  };

  if (!groupId) return <div className="p-8 text-center glass-card rounded-3xl m-8 font-black text-destructive uppercase tracking-widest">Missing Sector Context</div>;
  if (groupLoading) return <div className="h-screen flex items-center justify-center bg-background"><div className="h-12 w-12 animate-spin rounded-[1rem] border-4 border-primary border-t-transparent glow-primary" /></div>;
  if (!group) return <div className="p-8 text-center glass-card rounded-3xl m-8 font-black text-destructive uppercase tracking-widest">Sector Not Found</div>;

  const symbol = getCurrencySymbol(user?.currency);
  const myNet = settlementInfo.stats[user?.uid || ""]?.net || 0;

  return (
    <>
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button 
            className="mb-4 -ml-2 text-muted-foreground hover:text-primary gap-2 flex items-center transition-all px-2 py-1 uppercase font-black text-[10px] tracking-widest"
            onClick={() => router.push("/groups")}
          ><ArrowLeft className="h-4 w-4" />Network nodes</button>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl md:text-5xl font-black text-glow uppercase tracking-tighter truncate max-w-[240px] sm:max-w-none">{group.name}</h2>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-primary/20 bg-card hover:bg-primary/5 hover:text-primary glow-primary transition-all shrink-0" onClick={() => setIsQrOpen(true)}><QrCode className="h-3.5 w-3.5" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-primary/20 bg-card hover:bg-primary/5 hover:text-primary glow-primary transition-all shrink-0" onClick={simulateGroupNotification}><BellRing className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-colors group w-fit" onClick={() => setIsMembersOpen(true)}><Users className="h-3 w-3 group-hover:scale-110 transition-transform" />{group.members?.length || 0} SECURED NODES</button>
            </div>
            <Button className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg glow-primary w-full sm:w-auto" onClick={() => setIsQrOpen(true)}><UserPlus className="h-4 w-4" />Sync Peer</Button>
          </div>
        </motion.header>

        <div className="grid gap-6 mb-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card rounded-[2rem] overflow-hidden group/card relative">
                <div className="absolute top-0 right-0 p-4"><Zap className="h-4 w-4 text-accent fill-accent animate-pulse" /></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Network Total</CardTitle>
                    <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity"><Link href={`/groups/analytics?groupId=${groupId}`}><BarChart3 className="h-3 w-3 mr-1" />Metrics</Link></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-primary text-glow">{symbol}{formatCompactNumber(totalSpent)}</div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Active group load</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-card rounded-[2rem] overflow-hidden group/card relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Self Node Net</CardTitle>
                    {Math.abs(myNet) > 0.01 && (
                      <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg"><Link href={`/groups/settlements?groupId=${groupId}`}><Zap className="h-3 w-3 mr-1" />Settle</Link></Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={cn("text-3xl font-black text-glow", myNet > 0.01 ? "text-green-500" : myNet < -0.01 ? "text-destructive" : "text-foreground")}>{symbol}{formatCompactNumber(Math.abs(myNet))}</div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">{myNet > 0.01 ? "Owed from network" : myNet < -0.01 ? "Due to peers" : "Balanced"}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
              <CardHeader className="border-b border-white/5 px-6 py-5 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-[0.3em]">Historical Ledger</CardTitle>
                <Button variant="link" asChild className="text-accent font-black uppercase tracking-widest text-[10px] p-0 h-auto"><Link href={`/groups/transactions?groupId=${groupId}`}>Scan All Cycles</Link></Button>
              </CardHeader>
              <CardContent className="p-0">
                {expensesLoading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary glow-primary" /></div>
                ) : !groupExpenses || groupExpenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <Receipt className="h-12 w-12 text-primary mb-6 opacity-30 glow-primary" />
                    <h3 className="text-lg font-black uppercase tracking-tight text-glow">Zero Activity Detected</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-2">Initialize a cycle to begin ledger tracking.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {groupExpenses.slice(0, 8).map((expense) => {
                      const payerName = expense.paidBy === user?.uid ? "You" : (memberProfiles?.find(m => m.uid === expense.paidBy)?.name || "Peer");
                      const userShare = expense.splitBetween?.find((s: any) => s.userId === user?.uid)?.amount || 0;
                      const isPayer = expense.paidBy === user?.uid;
                      const netImpact = isPayer ? (expense.amount - userShare) : -userShare;
                      const isSettlement = expense.category === 'Settlement';
                      return (
                        <div key={expense.id} className="group flex items-center hover:bg-white/5 transition-all">
                          <Link href={`/expenses/details?id=${expense.id}&type=${expense.type}&groupId=${groupId}`} className="flex-1 flex items-center justify-between px-6 py-5 min-w-0">
                            <div className="flex items-center gap-5 min-w-0">
                              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-xl shrink-0 glass shadow-inner transition-transform group-hover:scale-110", isSettlement ? "text-accent glow-accent" : "text-primary glow-primary")}>
                                {isSettlement ? <Coins className="h-6 w-6" /> : (expense.category[0] || "💰")}
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-base uppercase tracking-tight truncate">{expense.category}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{mounted ? format(expense.date, "MMM dd") : ""}</span>
                                  <div className="h-1 w-1 bg-white/10 rounded-full" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-accent truncate">{payerName} paid</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-black text-xl text-glow tracking-tighter">{isSettlement ? "" : "-"}{symbol}{formatCompactNumber(expense.amount)}</p>
                              <p className={cn("text-[9px] font-black uppercase tracking-widest", netImpact > 0.01 ? "text-green-500" : netImpact < -0.01 ? "text-destructive" : "text-muted-foreground")}>
                                {isSettlement ? (isPayer ? `Outflow` : `Inflow`) : (netImpact > 0.01 ? `+${symbol}${formatCompactNumber(netImpact)}` : netImpact < -0.01 ? `-${symbol}${formatCompactNumber(Math.abs(netImpact))}` : "Stable")}
                              </p>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-[2rem] p-8 border-none shadow-2xl glass-card">
          <DialogHeader className="mb-6 text-center">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-glow">Invite Node</DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground opacity-60">SCAN TO JOIN SECTOR</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-8 py-4">
            <div className="p-4 bg-white rounded-[2rem] shadow-inner"><QRCodeSVG value={shareUrl} size={200} /></div>
            <div className="w-full space-y-4">
              <div className="flex items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/10 group">
                <Input value={shareUrl} readOnly className="h-8 bg-transparent border-none text-[10px] font-black uppercase tracking-widest p-0 focus-visible:ring-0" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={copyToClipboard}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
              </div>
              <Button className="w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#25D366]/90 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg" onClick={handleShareToWhatsApp}><Share2 className="h-4 w-4" />WhatsApp Protocol</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-[2rem] p-8 border-none shadow-2xl glass-card">
          <DialogHeader className="mb-6"><DialogTitle className="text-2xl font-black uppercase tracking-tighter text-glow flex items-center gap-3"><Users className="h-6 w-6 text-primary" />Sector Nodes</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
            {membersLoading ? (
              <div className="py-8 flex flex-col items-center gap-2"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : memberProfiles?.map((member) => (
              <div key={member.uid} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <Avatar className="h-10 w-10 border-2 border-white/10"><AvatarFallback className="bg-primary/20 text-primary font-black uppercase text-xs">{member.name?.[0]}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-tight truncate">{member.name} {member.uid === user?.uid && "(YOU)"}</p>
                  <p className="text-[9px] font-bold text-muted-foreground truncate uppercase opacity-50">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-8"><Button className="w-full rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 gap-2 bg-primary glow-primary" onClick={() => { setIsMembersOpen(false); setIsQrOpen(true); }}>Initialize Peer Sync</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-[2rem] p-8 border-none shadow-2xl glass-card">
          <DialogHeader className="mb-6 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 glow-primary"><UserPlus className="h-8 w-8" /></div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-glow">Join Sector</DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground opacity-60">LINK TO {group?.name}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-center text-muted-foreground leading-relaxed">Authorized node requesting access to this vault. Synchronize data streams?</p>
          <DialogFooter className="mt-8 gap-3">
            <Button variant="ghost" className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsJoinDialogOpen(false)}>Abort</Button>
            <Button className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary glow-primary transition-all active:scale-95" onClick={handleJoinGroup} disabled={isJoining}>{isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Sync"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function GroupDetailPage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar">
      <Navbar />
      <Suspense fallback={null}><GroupDetailContent /></Suspense>
    </div>
  );
}
