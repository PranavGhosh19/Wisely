"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Share2
} from "lucide-react";
import { useStore } from "@/lib/store";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { groups, expenses, user } = useStore();
  const { toast } = useToast();
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const group = groups.find(g => g.id === groupId);
  const groupExpenses = expenses.filter(e => e.groupId === groupId);
  const totalSpent = groupExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${groupId}` : `wisely.app/join/${groupId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share this link with your friends to join the group.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

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
      
      <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 -ml-2 text-muted-foreground hover:text-primary gap-2"
            onClick={() => router.push("/groups")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Button>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold font-headline text-primary">{group.name}</h2>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg border-primary/20 hover:bg-primary/5 hover:text-primary"
                  onClick={() => setIsQrOpen(true)}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{group.members.length} Members</span>
              </div>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2 h-11 rounded-xl font-bold"
              onClick={() => setIsAddExpenseOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Add Group Expense
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Group Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${totalSpent.toFixed(2)}</div>
              <div className="flex items-center gap-1 mt-1 text-accent text-[10px] font-bold uppercase">
                <TrendingUp className="h-3 w-3" />
                Live Tracking
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${(totalSpent / (group.members.length || 1)).toFixed(2)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">Split Equally</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{groupExpenses.length}</div>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[10px] font-bold uppercase">
                <Receipt className="h-3 w-3" />
                Recorded
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b bg-white">
            <CardTitle className="font-headline text-lg font-bold">Group Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {groupExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">No expenses in this group</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                  Click the button above to add the first group transaction.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-muted">
                {groupExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 md:px-6 md:py-5 hover:bg-muted/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">
                        {expense.category[0] || "💰"}
                      </div>
                      <div>
                        <p className="font-bold text-sm md:text-base">{expense.category}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-medium text-muted-foreground uppercase">
                            {mounted ? format(expense.date, "MMM dd, yyyy") : ""}
                          </span>
                          <span className="h-0.5 w-0.5 bg-muted-foreground rounded-full"></span>
                          <span className="text-[10px] uppercase font-bold text-accent">
                            Paid by {expense.paidBy === user?.uid ? "You" : "Member"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base md:text-lg text-foreground">-${expense.amount.toFixed(2)}</p>
                      {expense.notes && <p className="text-[11px] text-muted-foreground italic truncate max-w-[120px] md:max-w-[200px]">{expense.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddExpenseDialog 
        open={isAddExpenseOpen} 
        onOpenChange={setIsAddExpenseOpen}
        defaultType="GROUP"
        defaultGroupId={groupId}
      />

      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold font-headline text-primary">Invite Members</DialogTitle>
            <DialogDescription>
              Share this code with friends to join <span className="font-bold text-foreground">"{group.name}"</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="bg-white p-4 rounded-3xl shadow-md border-2 border-primary/10">
              {/* Generic QR Code SVG */}
              <svg 
                viewBox="0 0 100 100" 
                className="w-48 h-48 text-primary"
                fill="currentColor"
              >
                <path d="M0 0h30v10H10v20H0V0zm10 10h10v10H10V10zm60-10h30v30h-10V10H70V0zm10 10h10v10H80V10zM0 70h30v30H0V70zm10 10h10v10H10V80zm70 0h10v10H80V80zm10-10h10v10H90V70zm-10-10h10v10H80V60zm-10 10h10v10H70V70zm10 10h10v10H80V80zm-20-20h10v10H60V60zm-10 10h10v10H50V70zm10 10h10v10H60V80zm-10-10h10v10H50V70zm10-10h10v10H60V60z" />
                <rect x="40" y="40" width="20" height="20" rx="2" />
                <rect x="0" y="40" width="10" height="10" />
                <rect x="20" y="40" width="10" height="10" />
                <rect x="40" y="0" width="10" height="10" />
                <rect x="40" y="20" width="10" height="10" />
                <rect x="70" y="40" width="10" height="10" />
                <rect x="90" y="40" width="10" height="10" />
                <rect x="40" y="70" width="10" height="10" />
                <rect x="40" y="90" width="10" height="10" />
              </svg>
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-xl border border-border">
                <span className="flex-1 text-xs truncate text-muted-foreground font-mono">
                  {shareUrl}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary hover:bg-primary/10"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button 
                className="w-full rounded-xl font-bold h-12 gap-2"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Join ${group.name} on Wisely`,
                      text: `I'm using Wisely to track shared expenses. Join our group: ${group.name}`,
                      url: shareUrl,
                    });
                  } else {
                    copyToClipboard();
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                Share Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
