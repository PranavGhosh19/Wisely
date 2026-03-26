
"use client";

import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseType } from "@/types";
import { Suspense } from "react";

function AddExpenseContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as ExpenseType | null;
  const groupId = searchParams.get("groupId") || undefined;

  return (
    <ExpenseForm 
      initialType={type || "PERSONAL"} 
      initialGroupId={groupId} 
    />
  );
}

export default function AddExpensePage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-2xl mx-auto w-full">
        <Suspense fallback={<div className="flex h-[200px] items-center justify-center">Loading form...</div>}>
          <AddExpenseContent />
        </Suspense>
      </main>
    </div>
  );
}
