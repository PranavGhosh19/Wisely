
"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ExpenseType, Expense } from "@/types";
import { AlertCircle, Upload, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: ExpenseType;
  defaultGroupId?: string;
  expenseToEdit?: Expense;
}

export function AddExpenseDialog({ open, onOpenChange, defaultType, defaultGroupId, expenseToEdit }: AddExpenseDialogProps) {
  const { user, addExpense, groups, categories } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expenseType, setExpenseType] = useState<ExpenseType>(defaultType || "PERSONAL");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    notes: "",
    date: format(new Date(), "yyyy-MM-dd"),
    groupId: defaultGroupId || "",
    receiptName: "",
    receiptUrl: "",
  });

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
          receiptName: expenseToEdit.receiptName || "",
          receiptUrl: expenseToEdit.receiptUrl || "",
        });
      } else {
        setExpenseType(defaultType || "PERSONAL");
        setFormData({
          amount: "",
          category: "",
          notes: "",
          date: format(new Date(), "yyyy-MM-dd"),
          groupId: defaultGroupId || "",
          receiptName: "",
          receiptUrl: "",
        });
      }
    }
  }, [open, defaultType, defaultGroupId, expenseToEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setFormData(prev => ({ 
        ...prev, 
        receiptName: file.name,
        receiptUrl: fakeUrl 
      }));
    }
  };

  const removeReceipt = () => {
    setFormData(prev => ({ ...prev, receiptName: "", receiptUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Expense amount must be greater than 0." });
      return;
    }

    if (!formData.category) {
      toast({ variant: "destructive", title: "Missing category", description: "Please select a category." });
      return;
    }

    if (expenseType === "GROUP" && !formData.groupId) {
      toast({ variant: "destructive", title: "Missing group", description: "Please select a group for this expense." });
      return;
    }

    setLoading(true);
    try {
      const isEditing = !!expenseToEdit;
      const expenseId = expenseToEdit?.id || Math.random().toString(36).substr(2, 9);
      
      const expenseData: any = {
        id: expenseId,
        amount: amount,
        category: formData.category,
        notes: formData.notes || "",
        date: new Date(formData.date).getTime(),
        type: expenseType,
        createdBy: isEditing ? (expenseToEdit.createdBy || user.name || "User") : (user.name || "User"),
        createdById: isEditing ? (expenseToEdit.createdById || user.uid) : user.uid,
        paidBy: isEditing ? (expenseToEdit.paidBy || user.uid) : user.uid,
        receiptName: formData.receiptName || "",
        receiptUrl: formData.receiptUrl || "",
        isDeleted: false,
      };

      if (isEditing) {
        expenseData.updatedBy = user.name || "User";
        expenseData.updatedById = user.uid;
      }

      let docRef;

      if (expenseType === "PERSONAL") {
        docRef = doc(db, "users", user.uid, "personalExpenses", expenseId);
      } else {
        const selectedGroup = groups.find(g => g.id === formData.groupId);
        if (!selectedGroup) throw new Error("Group not found");

        expenseData.groupId = formData.groupId;
        expenseData.groupMemberIds = selectedGroup.members; 
        
        const splitAmount = amount / (selectedGroup.members?.length || 1);
        expenseData.splitBetween = (selectedGroup.members || []).map(uid => ({
          userId: uid,
          amount: parseFloat(splitAmount.toFixed(2))
        }));
        expenseData.splitType = 'EQUAL';
        
        docRef = doc(db, "groups", formData.groupId, "expenses", expenseId);
      }

      setDocumentNonBlocking(docRef, expenseData, { merge: true });
      addExpense(expenseData);
      
      toast({ 
        title: "Expense Saved", 
        description: `Successfully ${isEditing ? "updated" : "added"} expense.` 
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: error.message || "Failed to save expense." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl max-h-[90vh] overflow-y-auto">
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
              <TabsTrigger value="PERSONAL" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:text-primary">Personal</TabsTrigger>
              <TabsTrigger value="GROUP" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:text-primary">Group</TabsTrigger>
            </TabsList>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-bold">Amount ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01"
                min="0.01"
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
                {groups?.length === 0 ? (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>No groups found.</span>
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
                      {groups?.map(group => (
                        <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="font-bold">Date</Label>
                <Input 
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="h-11 rounded-xl w-full"
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

            <div className="space-y-2">
              <Label className="font-bold">Receipt (Optional)</Label>
              {formData.receiptName ? (
                <div className="flex items-center justify-between p-3 bg-accent/5 border border-accent/20 rounded-xl">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-xs font-medium truncate">{formData.receiptName}</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                    onClick={removeReceipt}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Click to upload receipt</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-primary h-11 rounded-xl font-bold text-base" disabled={loading}>
                {loading ? "Saving..." : (expenseToEdit ? "Update Expense" : "Add Expense")}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
