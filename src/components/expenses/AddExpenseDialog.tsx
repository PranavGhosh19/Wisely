
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { ExpenseType, SplitType } from "@/types";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  "Food & Dining", "Transportation", "Utilities", "Rent/Mortgage", 
  "Shopping", "Entertainment", "Groceries", "Healthcare", 
  "Education", "Travel", "Personal Care", "Other"
];

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const { user } = useStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expenseType, setExpenseType] = useState<ExpenseType>("PERSONAL");
  
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.amount || !formData.category) {
      toast({ title: "Error", description: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        notes: formData.notes,
        date: new Date(formData.date).getTime(),
        type: expenseType,
        createdBy: user.uid,
        paidBy: user.uid,
        createdAt: Date.now(),
        splitType: "EQUAL" as SplitType,
        splitBetween: [{ userId: user.uid, amount: parseFloat(formData.amount) }],
      };

      await addDoc(collection(db, "expenses"), expenseData);
      
      toast({ title: "Success", description: "Expense added successfully." });
      onOpenChange(false);
      setFormData({
        amount: "",
        category: "",
        notes: "",
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add expense." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Add New Expense</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="PERSONAL" onValueChange={(val) => setExpenseType(val as ExpenseType)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="PERSONAL">Personal</TabsTrigger>
            <TabsTrigger value="GROUP">Group</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="0.00" 
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input 
                id="notes" 
                placeholder="What was this for?" 
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {expenseType === "GROUP" && (
              <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground border border-dashed border-primary/20">
                Group features allow you to split bills with members. Choose a group below.
                <Select>
                  <SelectTrigger className="mt-2 bg-white">
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g1">Friends (Roommates)</SelectItem>
                    <SelectItem value="g2">Road Trip 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-primary" disabled={loading}>
                {loading ? "Adding..." : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
