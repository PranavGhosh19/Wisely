
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { CalendarClock, Target } from "lucide-react";

/**
 * Prompt shown on the 1st of every month to ask the user if they want to
 * rollover their previous month's budget settings.
 */
export function BudgetRolloverPrompt() {
  const { user } = useStore();
  const db = useFirestore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.categoryBudgets || Object.keys(user.categoryBudgets).length === 0) return;

    const today = new Date();
    const currentMonthKey = format(today, "yyyy-MM");
    const isFirstOfMonth = today.getDate() === 1;

    // Show if it's the 1st AND we haven't prompted for this month yet
    if (isFirstOfMonth && user.lastBudgetPromptMonth !== currentMonthKey) {
      setOpen(true);
    }
  }, [user]);

  const handleKeepSame = async () => {
    if (!user || !db) return;
    const currentMonthKey = format(new Date(), "yyyy-MM");
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        lastBudgetPromptMonth: currentMonthKey
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to update prompt status:", error);
    }
  };

  const handleCustom = async () => {
    if (!user || !db) return;
    const currentMonthKey = format(new Date(), "yyyy-MM");
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        lastBudgetPromptMonth: currentMonthKey
      });
      setOpen(false);
      router.push("/budgets");
    } catch (error) {
      console.error("Failed to update prompt status:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-8 border-none shadow-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
            <CalendarClock className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-bold font-headline">New Month Detected!</DialogTitle>
          <DialogDescription className="text-base">
            It's the 1st of the month. Would you like to use the same category budgets as last month?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl font-bold order-2 sm:order-1 transition-all active:scale-95"
            onClick={handleCustom}
          >
            No, Set Custom
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl font-bold bg-primary order-1 sm:order-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
            onClick={handleKeepSame}
          >
            Yes, Keep Same
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
