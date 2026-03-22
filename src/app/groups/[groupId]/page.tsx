"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Users, Receipt, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { groups, expenses, user } = useStore();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const group = groups.find(g => g.id === groupId);
  const groupExpenses = expenses.filter(e => e.groupId === groupId);
  const totalSpent = groupExpenses.reduce((acc, curr) => acc + curr.amount, 0);

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
              <h2 className="text-3xl font-bold font-headline text-primary">{group.name}</h2>
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
                          <span className="text-[11px] font-medium text-muted-foreground uppercase">{format(expense.date, "MMM dd, yyyy")}</span>
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
    </div>
  );
}
