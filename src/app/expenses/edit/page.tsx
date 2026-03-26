
"use client";

import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseType } from "@/types";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useStore } from "@/lib/store";
import { Suspense } from "react";

function EditExpenseContent() {
  const searchParams = useSearchParams();
  const { user } = useStore();
  const db = useFirestore();
  
  const id = searchParams.get("id");
  const type = searchParams.get("type") as ExpenseType;
  const groupId = searchParams.get("groupId");

  const docRef = useMemoFirebase(() => {
    if (!db || !user || !id || !type) return null;
    if (type === "PERSONAL") return doc(db, "users", user.uid, "personalExpenses", id);
    if (type === "GROUP" && groupId) return doc(db, "groups", groupId, "expenses", id);
    return null;
  }, [db, user, id, type, groupId]);

  const { data: expense, isLoading } = useDoc(docRef);

  if (isLoading) return <div className="flex h-[200px] items-center justify-center animate-pulse text-muted-foreground font-bold">Loading expense data...</div>;
  if (!expense) return <div className="flex h-[200px] items-center justify-center font-bold text-destructive">Expense not found</div>;

  return (
    <ExpenseForm 
      initialData={expense}
    />
  );
}

export default function EditExpensePage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-2xl mx-auto w-full">
        <Suspense fallback={<div className="flex h-[200px] items-center justify-center">Initializing...</div>}>
          <EditExpenseContent />
        </Suspense>
      </main>
    </div>
  );
}
