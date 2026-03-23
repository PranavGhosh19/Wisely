
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
  Share2,
  Edit2,
  FileText
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
import { Expense } from "@/types";

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { groups, expenses, user } = useStore();
  const { toast } = useToast();
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  const group = groups.find(g => g.id === groupId);
  // Filter out deleted transactions
  const groupExpenses = expenses.filter(e => e.groupId === groupId && !e.isDeleted);
  const totalSpent = groupExpenses.reduce((acc, curr) => acc + curr.amount, 0);

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

  const handleEditClick = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsAddExpenseOpen(true);
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
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-2 -ml-2 text-muted-foreground hover:text-primary gap-2 h-8 px-2 text-xs sm:text-sm"
            onClick={() => router.push("/groups")}
          >
            <ArrowLeft className="h-4 w-4" />
            Groups
          </Button>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-3xl font-bold font-headline text-primary truncate">{group.name}</h2>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-xl border-primary/20 bg-white hover:bg-primary/5 hover:text-primary transition-all active:scale-95 shadow-sm"
                  onClick={() => setIsQrOpen(true)}
                >
                  <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] sm:text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{group.members.length} Members</span>
              </div>
            </div>
            <Button 
              className="hidden sm:flex bg-primary hover:bg-primary/90 gap-2 h-11 rounded-xl font-bold px-6"
              onClick={() => {
                setExpenseToEdit(undefined);
                setIsAddExpenseOpen(true);
              }}
            >
              <Plus className="h-5 w-5" />
              Add Group Expense
            </Button>
          </div>
        </header>

        <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-none shadow-sm bg-white rounded-2xl col-span-2 lg:col-span-1">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Spending</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-primary">${totalSpent.toFixed(2)}</div>
              <div className="flex items-center gap-1 mt-1 text-accent text-[9px] sm:text-[11px] font-bold uppercase">
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Live Tracking
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Share</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-lg sm:text-3xl font-bold text-foreground">
                ${(totalSpent / (group.members.length || 1)).toFixed(2)}
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 uppercase font-medium">Split Equally</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Txns</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-lg sm:text-3xl font-bold text-foreground">{groupExpenses.length}</div>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[9px] sm:text-[11px] font-bold uppercase">
                <Receipt className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Recorded
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b bg-white px-4 sm:px-6 py-4">
            <CardTitle className="font-headline text-base sm:text-lg font-bold">Group Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {groupExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold font-headline">No expenses in this group</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                  Start tracking by adding your first shared transaction.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-muted">
                {groupExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 sm:px-6 sm:py-5 hover:bg-muted/5 transition-colors group">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-base sm:text-xl shrink-0">
                        {expense.category[0] || "💰"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs sm:text-base truncate">{expense.category}</p>
                          {expense.receiptUrl && <FileText className="h-3 w-3 text-accent" title="Has receipt" />}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                          <span className="text-[9px] sm:text-[11px] font-medium text-muted-foreground uppercase whitespace-nowrap">
                            {mounted ? format(expense.date, "MMM dd") : ""}
                          </span>
                          <span className="h-0.5 w-0.5 bg-muted-foreground rounded-full shrink-0"></span>
                          <span className="text-[8px] sm:text-[10px] uppercase font-bold text-accent truncate">
                            {expense.paidBy === user?.uid ? "You paid" : "Member paid"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-sm sm:text-lg text-foreground">-${expense.amount.toFixed(2)}</p>
                        {expense.notes && <p className="text-[9px] sm:text-[11px] text-muted-foreground italic truncate max-w-[60px] sm:max-w-[120px]">{expense.notes}</p>}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleEditClick(expense)}
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
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
        onOpenChange={(open) => {
          setIsAddExpenseOpen(open);
          if (!open) setExpenseToEdit(undefined);
        }}
        defaultType="GROUP"
        defaultGroupId={groupId}
        expenseToEdit={expenseToEdit}
      />

      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-[1.5rem] p-5 sm:p-10 border-none shadow-2xl overflow-hidden">
          <DialogHeader className="text-center space-y-2 mb-2">
            <DialogTitle className="text-xl sm:text-2xl font-bold font-headline text-primary">Invite Members</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm px-2">
              Share this code with friends to join <span className="font-bold text-foreground">"{group.name}"</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] shadow-xl shadow-primary/5 border border-primary/10">
              <svg 
                viewBox="0 0 100 100" 
                className="w-32 h-32 sm:w-48 sm:h-48 text-primary"
                fill="currentColor"
              >
                <path d="M0 0h30v10H10v20H0V0zm10 10h10v10H10V10zm60-10h30v30h-10V10H70V0zm10 10h10v10H80V10zM0 70h30v30H0V70zm10 10h10v10H10V80zm70 0h10v10H80V80zm10-10h10v10H90V70zm-10-10h10v10H80V60zm-10 10h10v10H70V70zm10 10h10v10H80V80zm-20-20h10v10H60V60zm-10 10h10v10H50V70zm10 10h10v10H60V80zm-10-10h10v10H50V70zm10-10h10v10H60V60z" />
                <rect x="40" y="40" width="20" height="20" rx="4" />
                <rect x="0" y="40" width="10" height="10" rx="1" />
                <rect x="20" y="40" width="10" height="10" rx="1" />
                <rect x="40" y="0" width="10" height="10" rx="1" />
                <rect x="40" y="20" width="10" height="10" rx="1" />
                <rect x="70" y="40" width="10" height="10" rx="1" />
                <rect x="90" y="40" width="10" height="10" rx="1" />
                <rect x="40" y="70" width="10" height="10" rx="1" />
                <rect x="40" y="90" width="10" height="10" rx="1" />
              </svg>
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg border border-border/40 group active:bg-muted/50 transition-colors overflow-hidden">
                <span className="flex-1 text-[10px] sm:text-xs truncate text-muted-foreground font-mono">
                  {shareUrl}
                </span>
                <Button 
                  variant="ghost" size="icon" 
                  className="h-8 w-8 text-primary hover:bg-primary/10 shrink-0 rounded-md"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button 
                className="w-full rounded-xl font-bold h-12 gap-2 text-sm shadow-lg shadow-primary/10 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({
                      title: `Join ${group.name} on Wisely`,
                      text: `I'm using Wisely to track shared expenses. Join our group: ${group.name}`,
                      url: shareUrl,
                    }).catch(() => copyToClipboard());
                  } else {
                    copyToClipboard();
                  }
                }}
              >
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
