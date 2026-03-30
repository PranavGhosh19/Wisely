"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Edit2, 
  Calendar, 
  Tag, 
  User as UserIcon, 
  FileText, 
  Users,
  Wallet,
  Receipt
} from "lucide-react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { ExpenseType } from "@/types";
import Image from "next/image";

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStore();
  const db = useFirestore();
  
  const type = searchParams.get("type") as ExpenseType;
  const groupId = searchParams.get("groupId");

  const docRef = useMemoFirebase(() => {
    if (!db || !user || !id || !type) return null;
    if (type === "PERSONAL") return doc(db, "users", user.uid, "personalExpenses", id);
    if (type === "GROUP" && groupId) return doc(db, "groups", groupId, "expenses", id);
    return null;
  }, [db, user, id, type, groupId]);

  const { data: expense, isLoading } = useDoc(docRef);

  // Fetch member profiles if it's a group expense to show names in split
  const membersQuery = useMemoFirebase(() => {
    if (!db || !expense?.groupMemberIds || expense.groupMemberIds.length === 0) return null;
    return query(collection(db, "users"), where("uid", "in", expense.groupMemberIds));
  }, [db, expense?.groupMemberIds]);
  const { data: memberProfiles } = useCollection(membersQuery);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Transaction not found</h2>
          <Button variant="link" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const payer = memberProfiles?.find(m => m.uid === expense.paidBy);
  const payerName = expense.paidBy === user?.uid ? "You" : (payer?.name || "Unknown");

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-3xl mx-auto w-full">
        <header className="mb-8 flex items-center justify-between">
          <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground hover:text-primary" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button asChild variant="outline" className="rounded-xl font-bold gap-2">
            <a href={`/expenses/edit?id=${expense.id}&type=${expense.type}${groupId ? `&groupId=${groupId}` : ''}`}>
              <Edit2 className="h-4 w-4" />
              Edit
            </a>
          </Button>
        </header>

        <div className="space-y-6">
          <section className="text-center py-8">
            <div className="inline-flex h-16 w-16 bg-primary/10 rounded-full items-center justify-center text-primary mb-4">
              <Receipt className="h-8 w-8" />
            </div>
            <h1 className="text-5xl font-bold font-headline text-foreground tracking-tight">
              ${expense.amount.toFixed(2)}
            </h1>
            <p className="text-muted-foreground mt-2 font-medium flex items-center justify-center gap-2">
              {expense.category}
              <span className="h-1 w-1 bg-muted-foreground rounded-full"></span>
              {format(expense.date, "MMM dd, yyyy")}
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none bg-card rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Paid by</span>
                  <span className="text-sm font-bold text-foreground">{payerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <span className="text-sm font-bold text-foreground">Wisely {expense.type === 'GROUP' ? 'Shared' : 'Private'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-card rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" />
                  Meta Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recorded by</span>
                  <span className="text-sm font-bold text-foreground">{expense.createdBy}</span>
                </div>
                {expense.notes && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm font-medium italic">{expense.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {expense.type === 'GROUP' && (
              <Card className="border-none bg-card rounded-2xl shadow-sm md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Split Breakdown ({expense.splitType})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-muted">
                    {expense.splitBetween?.map((split: any) => {
                      const member = memberProfiles?.find(m => m.uid === split.userId);
                      return (
                        <div key={split.userId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                              {member?.name?.[0] || "?"}
                            </div>
                            <span className="text-sm font-medium">{member?.uid === user?.uid ? "You" : (member?.name || "Unknown")}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">${split.amount.toFixed(2)}</p>
                            {split.percentage && <p className="text-[10px] text-muted-foreground">{split.percentage}%</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {expense.receiptUrl && (
              <Card className="border-none bg-card rounded-2xl shadow-sm md:col-span-2 overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    Receipt Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex justify-center bg-black/5">
                  <div className="relative w-full max-w-md aspect-[3/4] my-4 shadow-xl border">
                    <Image 
                      src={expense.receiptUrl} 
                      alt="Receipt" 
                      fill 
                      className="object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
