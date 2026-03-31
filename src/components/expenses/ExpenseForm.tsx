
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ExpenseType, Expense, SplitType, SplitMember } from "@/types";
import { AlertCircle, Upload, X, FileText, ArrowLeft, Loader2, ChevronRight, Users } from "lucide-react";
import { format } from "date-fns";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { SplitOptions } from "./SplitOptions";

interface ExpenseFormProps {
  initialData?: Expense;
  initialType?: ExpenseType;
  initialGroupId?: string;
}

export function ExpenseForm({ initialData, initialType, initialGroupId }: ExpenseFormProps) {
  const router = useRouter();
  const { user, addExpense, deleteExpense, groups, categories } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expenseType, setExpenseType] = useState<ExpenseType>(initialType || "PERSONAL");
  const [isSplitOptionsOpen, setIsSplitOptionsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    notes: "",
    date: format(new Date(), "yyyy-MM-dd"),
    groupId: initialGroupId || "",
    paidBy: user?.uid || "",
    splitType: "EQUAL" as SplitType,
    splitBetween: [] as SplitMember[],
    receiptName: "",
    receiptUrl: "",
  });

  const groupRef = useMemoFirebase(() => {
    if (!db || !formData.groupId || expenseType !== "GROUP") return null;
    return doc(db, "groups", formData.groupId);
  }, [db, formData.groupId, expenseType]);
  const { data: group } = useDoc(groupRef);

  const membersQuery = useMemoFirebase(() => {
    if (!db || !group?.members || group.members.length === 0) return null;
    return query(
      collection(db, "users"),
      where("uid", "in", group.members.slice(0, 30))
    );
  }, [db, group?.members]);
  const { data: memberProfiles, isLoading: membersLoading } = useCollection(membersQuery);

  useEffect(() => {
    if (initialData) {
      setExpenseType(initialData.type);
      setFormData({
        amount: initialData.amount.toString(),
        category: initialData.category,
        notes: initialData.notes || "",
        date: format(new Date(initialData.date), "yyyy-MM-dd"),
        groupId: initialData.groupId || "",
        paidBy: initialData.paidBy || user?.uid || "",
        splitType: initialData.splitType || "EQUAL",
        splitBetween: initialData.splitBetween || [],
        receiptName: initialData.receiptName || "",
        receiptUrl: initialData.receiptUrl || "",
      });
    } else if (user) {
      setFormData(prev => ({ ...prev, paidBy: user.uid }));
    }
  }, [initialData, user]);

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

  const handleSplitDone = (type: SplitType, members: SplitMember[]) => {
    setFormData(prev => ({ ...prev, splitType: type, splitBetween: members }));
    setIsSplitOptionsOpen(false);
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
      toast({ variant: "destructive", title: "Missing group", description: "Please select a group." });
      return;
    }

    setLoading(true);
    try {
      const isEditing = !!initialData;
      const expenseId = initialData?.id || Math.random().toString(36).substr(2, 9);
      
      const expenseData: any = {
        id: expenseId,
        amount: amount,
        category: formData.category,
        notes: formData.notes || "",
        date: new Date(formData.date).getTime(),
        type: expenseType,
        createdBy: isEditing ? (initialData?.createdBy || user.name || "User") : (user.name || "User"),
        createdById: isEditing ? (initialData?.createdById || user.uid) : user.uid,
        paidBy: formData.paidBy || user.uid,
        splitType: formData.splitType,
        splitBetween: formData.splitBetween,
        receiptName: formData.receiptName || "",
        receiptUrl: formData.receiptUrl || "",
        isDeleted: false,
      };

      if (isEditing) {
        expenseData.updatedBy = user.name || "User";
        expenseData.updatedById = user.uid;
      }

      if (expenseType === "PERSONAL") {
        const newRef = doc(db, "users", user.uid, "personalExpenses", expenseId);
        setDocumentNonBlocking(newRef, expenseData, { merge: true });
      } else {
        const selectedGroup = groups.find(g => g.id === formData.groupId) || group;
        if (!selectedGroup) throw new Error("Group not found");
        
        expenseData.groupId = formData.groupId;
        expenseData.groupMemberIds = selectedGroup.members;

        // Ensure splitBetween amounts are synchronized with the total amount
        if (formData.splitType === 'EQUAL') {
          // Identify members selected in the split (those with an amount > 0 or explicitly in splitBetween)
          const activeMembers = formData.splitBetween.filter(s => s.amount > 0).map(s => s.userId);
          const membersToSplitWith = activeMembers.length > 0 ? activeMembers : (selectedGroup.members || []);
          
          const splitAmount = amount / (membersToSplitWith.length || 1);
          expenseData.splitBetween = (selectedGroup.members || []).map(uid => ({
            userId: uid,
            amount: membersToSplitWith.includes(uid) ? parseFloat(splitAmount.toFixed(2)) : 0
          }));
        } else if (formData.splitType === 'PERCENTAGE') {
          expenseData.splitBetween = formData.splitBetween.map(s => ({
            ...s,
            amount: parseFloat(((s.percentage || 0) / 100 * amount).toFixed(2))
          }));
        } else if (formData.splitType === 'WEIGHT') {
          const totalWeight = formData.splitBetween.reduce((acc, s) => acc + (s.weight || 0), 0);
          expenseData.splitBetween = formData.splitBetween.map(s => ({
            ...s,
            amount: parseFloat(((s.weight || 0) / (totalWeight || 1) * amount).toFixed(2))
          }));
        } else {
          expenseData.splitBetween = formData.splitBetween;
        }

        const newRef = doc(db, "groups", formData.groupId, "expenses", expenseId);
        setDocumentNonBlocking(newRef, expenseData, { merge: true });
      }

      addExpense(expenseData);
      
      toast({ title: "Expense Saved", description: `Successfully ${isEditing ? "updated" : "added"} expense.` });
      router.back();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save expense." });
    } finally {
      setLoading(false);
    }
  };

  const getSplitLabel = () => {
    switch(formData.splitType) {
      case 'EQUAL': return 'Equally';
      case 'PERCENTAGE': return 'By Percentage';
      case 'WEIGHT': return 'By Shares';
      case 'UNEQUAL': return 'Exactly';
      default: return 'Equally';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-headline">{initialData ? "Edit Expense" : "New Expense"}</h1>
          <p className="text-sm text-muted-foreground">{expenseType === "GROUP" ? "Shared Group Cost" : "Personal Record"}</p>
        </div>
      </div>

      <Tabs value={expenseType} onValueChange={(val) => setExpenseType(val as ExpenseType)} className="w-full">
        {!initialGroupId && !initialData && (
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted p-1 rounded-xl">
            <TabsTrigger value="PERSONAL" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:text-primary">Personal</TabsTrigger>
            <TabsTrigger value="GROUP" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:text-primary">Group</TabsTrigger>
          </TabsList>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Amount ($)</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01"
              placeholder="0.00" 
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
              className="h-16 rounded-2xl text-3xl font-bold bg-muted/20 border-none"
            />
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="h-12 rounded-xl bg-muted/20 border-none"
              />
            </div>
          </div>

          {expenseType === "GROUP" && (
            <div className="space-y-4">
              {!initialGroupId && !initialData && (
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Group</Label>
                  <Select value={formData.groupId} onValueChange={(val) => setFormData(prev => ({ ...prev, groupId: val }))}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                      <SelectValue placeholder="Select Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups?.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Paid By</Label>
                  <Select 
                    value={formData.paidBy} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, paidBy: val }))}
                    disabled={!formData.groupId || membersLoading}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                      <SelectValue placeholder="Who?" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberProfiles?.filter(m => !!m.uid).map(m => (
                        <SelectItem key={m.uid} value={m.uid}>{m.uid === user?.uid ? "You" : m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Split</Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.groupId) setIsSplitOptionsOpen(true);
                      else toast({ variant: "destructive", title: "Select Group", description: "Please select a group first." });
                    }}
                    className="flex items-center justify-between w-full h-12 px-3 rounded-xl bg-muted/20 border-none text-left"
                  >
                    <span className="text-sm font-medium">
                      {getSplitLabel()}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Notes (Optional)</Label>
            <Input 
              id="notes" 
              placeholder="What was this for?" 
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="h-12 rounded-xl bg-muted/20 border-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Receipt (Optional)</Label>
            {formData.receiptName ? (
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-bold truncate">{formData.receiptName}</span>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={removeReceipt}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-muted/30 hover:border-primary/50 cursor-pointer transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-bold">Upload Receipt</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
              </div>
            )}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-3 pb-10">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="flex-[2] h-12 rounded-xl font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (initialData ? "Update" : "Add Expense")}
            </Button>
          </div>
        </form>
      </Tabs>

      {isSplitOptionsOpen && (
        <SplitOptions
          isOpen={isSplitOptionsOpen}
          onClose={() => setIsSplitOptionsOpen(false)}
          onDone={handleSplitDone}
          members={memberProfiles || []}
          totalAmount={parseFloat(formData.amount) || 0}
          initialSplitType={formData.splitType}
          initialSplitBetween={formData.splitBetween}
        />
      )}
    </div>
  );
}
