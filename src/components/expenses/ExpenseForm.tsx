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
import { ExpenseType, Expense, SplitType } from "@/types";
import { AlertCircle, Upload, X, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface ExpenseFormProps {
  initialData?: Expense;
  initialType?: ExpenseType;
  initialGroupId?: string;
}

export function ExpenseForm({ initialData, initialType, initialGroupId }: ExpenseFormProps) {
  const router = useRouter();
  const { user, addExpense, groups, categories } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expenseType, setExpenseType] = useState<ExpenseType>(initialType || "PERSONAL");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    notes: "",
    date: format(new Date(), "yyyy-MM-dd"),
    groupId: initialGroupId || "",
    paidBy: user?.uid || "",
    splitType: "EQUAL" as SplitType,
    receiptName: "",
    receiptUrl: "",
  });

  // Fetch group data
  const groupRef = useMemoFirebase(() => {
    if (!db || !formData.groupId || expenseType !== "GROUP") return null;
    return doc(db, "groups", formData.groupId);
  }, [db, formData.groupId, expenseType]);
  const { data: group } = useDoc(groupRef);

  // Fetch member profiles
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
        receiptName: initialData.receiptName || "",
        receiptUrl: initialData.receiptUrl || "",
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        paidBy: user.uid
      }));
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
      const expenseId = initialData?.id || Math.random().toString(36).substr(2, 9);
      
      const expenseData: any = {
        id: expenseId,
        amount: amount,
        category: formData.category,
        notes: formData.notes,
        date: new Date(formData.date).getTime(),
        type: expenseType,
        createdBy: user.name,
        createdById: user.uid,
        paidBy: formData.paidBy || user.uid,
        splitType: formData.splitType,
        receiptName: formData.receiptName,
        receiptUrl: formData.receiptUrl,
        isDeleted: false,
      };

      let docRef;

      if (expenseType === "PERSONAL") {
        docRef = doc(db, "users", user.uid, "personalExpenses", expenseId);
      } else {
        const selectedGroup = groups.find(g => g.id === formData.groupId) || group;
        if (!selectedGroup) throw new Error("Group not found");

        expenseData.groupId = formData.groupId;
        expenseData.groupMemberIds = selectedGroup.members;

        // Auto-calculate equal split if selected
        if (formData.splitType === 'EQUAL') {
          const members = selectedGroup.members || [];
          const splitAmount = amount / members.length;
          expenseData.splitBetween = members.map(uid => ({
            userId: uid,
            amount: parseFloat(splitAmount.toFixed(2))
          }));
        }
        
        docRef = doc(db, "groups", formData.groupId, "expenses", expenseId);
      }

      setDocumentNonBlocking(docRef, expenseData, { merge: true });
      addExpense(expenseData);
      
      toast({ 
        title: "Expense Saved", 
        description: `Successfully ${initialData ? "updated" : "added"} expense.` 
      });
      router.back();
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

      <Tabs 
        value={expenseType} 
        onValueChange={(val) => setExpenseType(val as ExpenseType)} 
        className="w-full"
      >
        {!initialGroupId && !initialData && (
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted p-1 rounded-xl">
            <TabsTrigger value="PERSONAL" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:text-primary shadow-sm transition-all">Personal</TabsTrigger>
            <TabsTrigger value="GROUP" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:text-primary shadow-sm transition-all">Group</TabsTrigger>
          </TabsList>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Amount ($)</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01"
              min="0.01"
              placeholder="0.00" 
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
              className="h-16 rounded-2xl text-3xl font-bold bg-muted/20 border-none focus-visible:ring-primary focus-visible:bg-muted/30 transition-all"
            />
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
              >
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Date</Label>
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
            <div className="space-y-6">
              {!initialGroupId && !initialData && (
                <div className="space-y-2">
                  <Label htmlFor="group" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Group</Label>
                  <Select 
                    value={formData.groupId} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, groupId: val }))}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                      <SelectValue placeholder="Select Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups?.map(group => (
                        <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paidBy" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Paid By</Label>
                  <Select 
                    value={formData.paidBy} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, paidBy: val }))}
                    disabled={!formData.groupId || membersLoading}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                      <SelectValue placeholder="Who?" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberProfiles?.map(member => (
                        <SelectItem key={member.uid} value={member.uid}>
                          {member.uid === user?.uid ? "You" : member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="splitType" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Split</Label>
                  <Select 
                    value={formData.splitType} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, splitType: val as SplitType }))}
                    disabled={!formData.groupId}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none">
                      <SelectValue placeholder="How?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EQUAL">Equally</SelectItem>
                      <SelectItem value="PERCENTAGE">By %</SelectItem>
                      <SelectItem value="UNEQUAL">Exactly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Notes (Optional)</Label>
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
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={removeReceipt}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-muted/30 hover:border-primary/50 cursor-pointer transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                <p className="text-sm font-bold">Upload Receipt</p>
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

          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-12 rounded-xl font-bold" 
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-[2] h-12 rounded-xl font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (initialData ? "Update" : "Add Expense")}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}