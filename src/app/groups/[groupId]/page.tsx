
"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Receipt, 
  TrendingUp, 
  QrCode, 
  Copy, 
  Check,
  Share2,
  Edit2,
  FileText,
  UserPlus,
  User as UserIcon,
  BarChart3
} from "lucide-react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useMemoFirebase, useFirestore, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, arrayUnion, where } from "firebase/firestore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
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

  const shouldShowJoin = searchParams.get("join") === "true";

  useEffect(() => {
    setMounted(true);
  }, []);

  // UseDoc for group metadata
  const groupRef = useMemoFirebase(() => {
    if (!db || !groupId) return null;
    return doc(db, "groups", groupId);
  }, [db, groupId]);
  const { data: group, isLoading: groupLoading } = useDoc(groupRef);

  // Check if user is already a member
  const isMember = group?.members?.includes(user?.uid || "");

  useEffect(() => {
    if (mounted && shouldShowJoin && group && !isMember) {
      setIsJoinDialogOpen(true);
    }
  }, [mounted, shouldShowJoin, group, isMember]);

  // UseCollection for group expenses - limiting to recent for summary view
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

  // Fetch member profiles
  const membersQuery = useMemoFirebase(() => {
    if (!db || !group?.members || group.members.length === 0) return null;
    return query(
      collection(db, "users"),
      where("uid", "in", group.members.slice(0, 30))
    );
  }, [db, group?.members]);
  const { data: memberProfiles, isLoading: membersLoading } = useCollection(membersQuery);

  const totalSpent = (groupExpenses || []).reduce((acc, curr) => acc + curr.amount, 0);

  const handleJoinGroup = async () => {
    if (!user || !db || !groupId) return;
    setIsJoining(true);
    try {
      const gRef = doc(db, "groups", groupId);
      const uRef = doc(db, "users", user.uid);

      await updateDoc(gRef, {
        members: arrayUnion(user.uid)
      });

      await updateDoc(uRef, {
        groupIds: arrayUnion(groupId)
      });

      toast({
        title: "Joined!",
        description: `Welcome to ${group?.name}!`,
      });
      setIsJoinDialogOpen(false);
      router.replace(`/groups/${groupId}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error joining group",
        description: error.message,
      });
    } finally {
      setIsJoining(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${groupId}` : `wisely.app/join/${groupId}`;

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Invite link is ready to share.",
      });
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

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
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
            <div>
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
              <button 
                className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
                onClick={() => setIsMembersOpen(true)}
              >
                <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium underline-offset-4 group-hover:underline">{group.members?.length || 0} Members</span>
              </button>
            </div>
            <Button 
              asChild
              className="hidden md:flex bg-primary hover:bg-primary/90 gap-2 h-11 rounded-xl font-bold px-6 transition-all active:scale-95"
            >
              <Link href={`/expenses/add?type=GROUP&groupId=${groupId}`}>
                <Plus className="h-5 w-5" />
                Add Group Expense
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-none shadow-sm bg-card rounded-2xl relative overflow-hidden group/card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Spending</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity"
                >
                  <Link href={`/groups/${groupId}/analytics`}>
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analyse
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${totalSpent.toFixed(2)}</div>
              <div className="flex items-center gap-1 mt-1 text-accent text-[11px] font-bold uppercase">
                <TrendingUp className="h-3.5 w-3.5" />
                Live Tracking
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${(totalSpent / (group.members?.length || 1)).toFixed(2)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">Split Equally</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{(groupExpenses || []).length}</div>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[11px] font-bold uppercase">
                <Receipt className="h-3.5 w-3.5" />
                Recorded
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-lg font-bold">Group Activity</CardTitle>
            <Button variant="link" asChild className="text-accent font-bold p-0 h-auto">
              <Link href={`/groups/${groupId}/transactions`}>View all transaction</Link>
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
                <h3 className="text-lg font-bold font-headline">No expenses in this group</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">Start tracking by adding your first shared transaction.</p>
              </div>
            ) : (
              <div className="divide-y divide-muted">
                {groupExpenses.slice(0, 10).map((expense) => {
                  const payerName = expense.paidBy === user?.uid 
                    ? "You" 
                    : (memberProfiles?.find(m => m.uid === expense.paidBy)?.name || "Member");

                  return (
                    <div 
                      key={expense.id} 
                      className="group flex items-center hover:bg-muted/5 transition-colors"
                    >
                      <Link 
                        href={`/expenses/${expense.id}?type=${expense.type}&groupId=${groupId}`}
                        className="flex-1 flex items-center justify-between px-6 py-5 min-w-0"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl shrink-0">
                            {expense.category[0] || "💰"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-base truncate">{expense.category}</p>
                              {expense.receiptUrl && <FileText className="h-3.5 w-3.5 text-accent" title="Has receipt" />}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-medium text-muted-foreground uppercase whitespace-nowrap">
                                {mounted ? format(expense.date, "MMM dd") : ""}
                              </span>
                              <span className="h-0.5 w-0.5 bg-muted-foreground rounded-full"></span>
                              <span className="text-[10px] uppercase font-bold text-accent truncate">
                                {payerName} paid
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 px-4">
                          <p className="font-bold text-lg text-foreground">-${expense.amount.toFixed(2)}</p>
                          {expense.notes && <p className="text-[11px] text-muted-foreground italic truncate max-w-[150px]">{expense.notes}</p>}
                        </div>
                      </Link>
                      <div className="pr-6 shrink-0">
                        <Button 
                          asChild
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Link href={`/expenses/edit?id=${expense.id}&type=${expense.type}&groupId=${groupId}`}>
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Members Dialog */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-6 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold font-headline flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Group Members
            </DialogTitle>
            <DialogDescription>
              Everyone sharing expenses in <span className="font-bold text-foreground">"{group.name}"</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {membersLoading ? (
              <div className="py-8 flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs text-muted-foreground">Loading members...</span>
              </div>
            ) : memberProfiles?.map((member) => (
              <div key={member.uid} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {member.name?.[0] || <UserIcon className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{member.name} {member.uid === user?.uid && "(You)"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-6">
            <Button 
              className="w-full rounded-xl font-bold h-11 gap-2 bg-primary shadow-lg shadow-primary/10 transition-all active:scale-95"
              onClick={() => {
                setIsMembersOpen(false);
                setIsQrOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4" />
              Invite More Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={(open) => {
        if (!isJoining) setIsJoinDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-8 border-none shadow-2xl">
          <DialogHeader className="text-center space-y-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
              <UserPlus className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-bold font-headline">Join Group?</DialogTitle>
            <DialogDescription className="text-base">
              Would you like to join <span className="font-bold text-foreground">"{group?.name}"</span>? You'll be able to track shared expenses and see balances.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl font-bold order-2 sm:order-1 transition-all active:scale-95" 
              onClick={() => {
                setIsJoinDialogOpen(false);
                router.push("/dashboard");
              }}
              disabled={isJoining}
            >
              No
            </Button>
            <Button 
              className="flex-1 h-12 rounded-xl font-bold bg-primary order-1 sm:order-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
              onClick={handleJoinGroup}
              disabled={isJoining}
            >
              {isJoining ? "Joining..." : "Ok"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-[1.5rem] p-5 sm:p-10 border-none shadow-2xl overflow-hidden">
          <DialogHeader className="text-center space-y-2 mb-2">
            <DialogTitle className="text-xl sm:text-2xl font-bold font-headline text-primary">Invite Members</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm px-2">
              Share this code with friends to join <span className="font-bold text-foreground">"{group.name}"</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="bg-secondary p-4 sm:p-6 rounded-[1.5rem] shadow-xl shadow-primary/5 border border-primary/10">
              <svg viewBox="0 0 100 100" className="w-32 h-32 sm:w-48 sm:h-48 text-primary" fill="currentColor">
                <path d="M0 0h30v10H10v20H0V0zm10 10h10v10H10V10zm60-10h30v30h-10V10H70V0zm10 10h10v10H80V10zM0 70h30v30H0V70zm10 10h10v10H10V80zm70 0h10v10H80V80zm10-10h10v10H90V70zm-10-10h10v10H80V60zm-10 10h10v10H70V70zm10 10h10v10H80V80zm-20-20h10v10H60V60zm-10 10h10v10H50V70zm10 10h10v10H60V80zm-10-10h10v10H50V70zm10-10h10v10H60V60z" />
              </svg>
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg border border-border/40 overflow-hidden">
                <span className="flex-1 text-[10px] sm:text-xs truncate text-muted-foreground font-mono">{shareUrl}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary shrink-0 rounded-md" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button className="w-full rounded-xl font-bold h-12 gap-2 text-sm bg-primary shadow-lg shadow-primary/10 transition-all active:scale-95" onClick={copyToClipboard}>
                <Share2 className="h-4 w-4" />
                Share Group Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
