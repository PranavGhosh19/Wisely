"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Receipt, FileText, Edit2, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { useCollection, useMemoFirebase, useFirestore, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, where } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function GroupTransactionsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { user } = useStore();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch group metadata for header context
  const groupRef = useMemoFirebase(() => {
    if (!db || !groupId) return null;
    return doc(db, "groups", groupId);
  }, [db, groupId]);
  const { data: group } = useDoc(groupRef);

  const isMember = group?.members?.includes(user?.uid || "");

  // Fetch ALL group expenses
  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !groupId || !user || !isMember) return null;
    return query(
      collection(db, "groups", groupId, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false),
      orderBy("date", "desc")
    );
  }, [db, groupId, user, isMember]);
  const { data: groupExpenses, isLoading } = useCollection(groupExpensesQuery);

  // Filter based on search term
  const filteredExpenses = (groupExpenses || []).filter(exp => 
    exp.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-2 -ml-2 text-muted-foreground hover:text-primary gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold font-headline text-primary">All Transactions</h2>
              <p className="text-muted-foreground">{group?.name || "Group Activity"}</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-9 rounded-xl bg-card border-none h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-bold font-headline">No transactions found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? "Try a different search term." : "Your group activity will appear here."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-muted">
                {filteredExpenses.map((expense) => (
                  <Link 
                    key={expense.id} 
                    href={`/expenses/${expense.id}?type=${expense.type}&groupId=${groupId}`}
                    className="flex items-center justify-between px-6 py-5 hover:bg-muted/5 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
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
                            {format(expense.date, "MMM dd, yyyy")}
                          </span>
                          <span className="h-0.5 w-0.5 bg-muted-foreground rounded-full"></span>
                          <span className="text-[10px] uppercase font-bold text-accent truncate">
                            {expense.paidBy === user?.uid ? "You paid" : "Member paid"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">-${expense.amount.toFixed(2)}</p>
                        {expense.notes && <p className="text-[11px] text-muted-foreground italic truncate max-w-[150px]">{expense.notes}</p>}
                      </div>
                      <Button 
                        asChild
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/expenses/edit?id=${expense.id}&type=${expense.type}&groupId=${groupId}`}>
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
