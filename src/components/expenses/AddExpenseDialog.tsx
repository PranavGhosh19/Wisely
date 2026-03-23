
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ExpenseType, SplitType, Expense } from "@/types";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: ExpenseType;
  defaultGroupId?: string;
  expenseToEdit?: Expense;
}

export function AddExpenseDialog({ open, onOpenChange, defaultType, defaultGroupId, expenseToEdit }: AddExpenseDialogProps) {
  const { user, addExpense, deleteExpense, groups, categories } = useStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expenseType, setExpenseType] = useState<ExpenseType>(defaultType || "PERSONAL");
  
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    notes: "",
    date: format(new Date(), "yyyy-MM-dd"),
    groupId: defaultGroupId || "",
  });

  // Sync state with props or edit object
  useEffect(() => {
    if (open) {
      if (expenseToEdit) {
        setExpenseType(expenseToEdit.type);
        setFormData({
          amount: expenseToEdit.amount.toString(),
          category: expenseToEdit.category,
          notes: expenseToEdit.notes || "",
          date: format(new Date(expenseToEdit.date), "yyyy-MM-dd"),
          groupId: expenseToEdit.groupId || "",
        });
      } else {
        setExpenseType(defaultType || "PERSONAL");
        setFormData({
          amount: "",
          category: "",
          notes: "",
          date: format(new Date(), "yyyy-MM-dd"),
          groupId: defaultGroupId || "",
        });
      }
    }
  }, [open, defaultType, defaultGroupId, expenseToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.amount || !formData.category) {
      toast({ title: "Error", description: "Please fill in all required fields." });
      return;
    }

    if (expenseType === "GROUP" && !formData.groupId) {
      toast({ title: "Error", description: "Please select a group for this expense." });
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      
      // If editing, mark the old one as deleted first
      if (expenseToEdit) {
        deleteExpense(expenseToEdit.id);
      }

      const expenseData: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        amount: amount,
        category: formData.category,
        notes: formData.notes,
        date: new Date(formData.date).getTime(),
        type: expenseType,
        createdBy: user.uid,
        paidBy: user.uid,
        groupId: expenseType === "GROUP" ? formData.groupId : undefined,
        splitType: "EQUAL" as SplitType,
        splitBetween: [{ userId: user.uid, amount: amount }],
      };

      addExpense(expenseData);
      
      toast({ 
        title: "Success", 
        description: expenseToEdit ? "Expense updated (new record created)." : "Expense added successfully." 
      });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to process expense." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl font-bold">
            {expenseToEdit ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs 
          value={expenseType} 
          onValueChange={(val) => setExpenseType(val as ExpenseType)} 
          className="w-full"
        >
          {!defaultGroupId && !expenseToEdit && (
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted p-1 rounded-xl">
              <TabsTrigger value="PERSONAL" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary">Personal</TabsTrigger>
              <TabsTrigger value="GROUP" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary">Group</TabsTrigger>
            </TabsList>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-bold">Amount ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01"
                placeholder="0.00" 
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="h-11 rounded-xl text-lg font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-bold">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(expenseType === "GROUP" && !defaultGroupId && !expenseToEdit) && (
              <div className="space-y-2">
                <Label htmlFor="group" className="font-bold">Select Group</Label>
                {groups.length === 0 ? (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>You haven't joined or created any groups yet. Create one in the Groups tab first.</span>
                  </div>
                ) : (
                  <Select 
                    value={formData.groupId} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, groupId: val }))}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Choose a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {(defaultGroupId || expenseToEdit?.groupId) && (
              <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 mb-2">
                <p className="text-[10px] font-bold uppercase text-primary/70 tracking-wider mb-0.5">
                  {expenseToEdit ? "Updating Group Record" : "Adding to Group"}
                </p>
                <p className="font-bold text-sm text-primary">
                  {groups.find(g => g.id === (formData.groupId || defaultGroupId))?.name || "Group Expense"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="font-bold">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="font-bold">Notes (Opt.)</Label>
                <Input 
                  id="notes" 
                  placeholder="Pizza night..." 
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-primary h-11 rounded-xl font-bold text-base" disabled={loading}>
                {loading ? "Processing..." : (expenseToEdit ? "Update Expense" : "Add Expense")}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
