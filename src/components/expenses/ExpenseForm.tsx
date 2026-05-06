
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
import { Upload, X, FileText, ArrowLeft, Loader2, ChevronRight, Zap, Database, Cpu } from "lucide-react";
import { format } from "date-fns";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { SplitOptions } from "./SplitOptions";
import { cn, getCurrencySymbol } from "@/lib/utils";
import { motion } from "framer-motion";

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          receiptName: file.name,
          receiptUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
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
      toast({ variant: "destructive", title: "Protocol error", description: "Positive amount required." });
      return;
    }

    if (!formData.category) {
      toast({ variant: "destructive", title: "Protocol error", description: "Select categorical class." });
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
        createdBy: isEditing ? (initialData?.createdBy || user.name) : (user.name || "User"),
        createdById: isEditing ? (initialData?.createdById || user.uid) : user.uid,
        paidBy: formData.paidBy || user.uid,
        splitType: formData.splitType,
        receiptName: formData.receiptName || "",
        receiptUrl: formData.receiptUrl || "",
        isDeleted: false,
      };

      if (expenseType === "PERSONAL") {
        const newRef = doc(db, "users", user.uid, "personalExpenses", expenseId);
        await setDocumentNonBlocking(newRef, expenseData, { merge: true });
      } else {
        const selectedGroup = groups.find(g => g.id === formData.groupId) || group;
        if (!selectedGroup) throw new Error("Peer group not synced");
        
        expenseData.groupId = formData.groupId;
        expenseData.groupMemberIds = selectedGroup.members;

        if (formData.splitBetween.length === 0 || formData.splitType === 'EQUAL') {
          const selectedUsers = formData.splitType === 'EQUAL' && formData.splitBetween.length > 0 
            ? formData.splitBetween.filter(s => s.amount > 0).map(s => s.userId)
            : selectedGroup.members;
          
          const usersToInclude = selectedUsers.length > 0 ? selectedUsers : selectedGroup.members;
          const splitAmount = amount / usersToInclude.length;
          
          expenseData.splitBetween = selectedGroup.members.map(uid => ({
            userId: uid,
            amount: usersToInclude.includes(uid) ? parseFloat(splitAmount.toFixed(2)) : 0
          }));
          expenseData.splitType = 'EQUAL';
        } else {
          expenseData.splitBetween = formData.splitBetween;
        }

        const newRef = doc(db, "groups", formData.groupId, "expenses", expenseId);
        await setDocumentNonBlocking(newRef, expenseData, { merge: true });
      }

      addExpense(expenseData);
      toast({ title: "Cycle Recorded", description: `Vault ledger synchronized.` });
      router.back();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const symbol = getCurrencySymbol(user?.currency);

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 shrink-0 glass border-white/5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-glow">{initialData ? "Edit cycle" : "Initialize cycle"}</h2>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">INPUT PROTOCOL / {expenseType}</p>
        </div>
      </motion.div>

      <Tabs value={expenseType} onValueChange={(val) => setExpenseType(val as ExpenseType)} className="w-full">
        {!initialGroupId && !initialData && (
          <TabsList className="grid w-full grid-cols-2 mb-10 bg-white/5 p-1 rounded-2xl border border-white/10">
            <TabsTrigger value="PERSONAL" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground glow-primary">Personal vault</TabsTrigger>
            <TabsTrigger value="GROUP" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground glow-accent">Shared network</TabsTrigger>
          </TabsList>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Input value ({symbol})</Label>
            <div className="relative">
               <div className="absolute left-6 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary animate-pulse" />
               <Input 
                 id="amount" 
                 type="number" 
                 step="0.01"
                 placeholder="0.00" 
                 value={formData.amount}
                 onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                 required
                 className="h-20 pl-12 rounded-[2rem] text-4xl font-black bg-white/5 border-none text-glow focus:ring-primary placeholder:opacity-20"
               />
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category class</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}>
                <SelectTrigger className="h-14 rounded-2xl glass border-white/5 font-black uppercase text-xs tracking-widest">
                  <SelectValue placeholder="CLASS" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {categories.map(cat => <SelectItem key={cat} value={cat} className="font-black uppercase text-[10px] tracking-widest">{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Temporal node</Label>
              <Input 
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="h-14 rounded-2xl glass border-white/5 font-black text-xs uppercase tracking-widest"
              />
            </div>
          </div>

          {expenseType === "GROUP" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {!initialGroupId && !initialData && (
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Network sector</Label>
                  <Select value={formData.groupId} onValueChange={(val) => setFormData(prev => ({ ...prev, groupId: val }))}>
                    <SelectTrigger className="h-14 rounded-2xl glass border-white/5 font-black uppercase text-xs tracking-widest">
                      <SelectValue placeholder="SELECT NODE" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {groups?.map(g => <SelectItem key={g.id} value={g.id} className="font-black uppercase text-[10px] tracking-widest">{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Inflow node</Label>
                  <Select 
                    value={formData.paidBy} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, paidBy: val }))}
                    disabled={!formData.groupId || membersLoading}
                  >
                    <SelectTrigger className="h-14 rounded-2xl glass border-white/5 font-black uppercase text-xs tracking-widest">
                      <SelectValue placeholder="NODE" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {memberProfiles?.map(m => (
                        <SelectItem key={m.uid} value={m.uid} className="font-black uppercase text-[10px] tracking-widest">{m.uid === user?.uid ? "YOU" : m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Split logic</Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.groupId) setIsSplitOptionsOpen(true);
                      else toast({ variant: "destructive", title: "Select Node", description: "Network sector required first." });
                    }}
                    className="flex items-center justify-between w-full h-14 px-4 rounded-2xl glass border-white/5 hover:border-primary/30 transition-all text-left"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {formData.splitType}
                    </span>
                    <ChevronRight className="h-4 w-4 text-primary animate-pulse" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Signal notes (optional)</Label>
            <Input 
              id="notes" 
              placeholder="TRANSACTION DATA..." 
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="h-14 rounded-2xl glass border-white/5 font-black text-xs uppercase tracking-widest"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Record capture (optional)</Label>
            {formData.receiptName ? (
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-xs font-black uppercase tracking-widest truncate">{formData.receiptName}</span>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={removeReceipt}>
                  <X className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-primary/50 cursor-pointer transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-12 w-12 glass rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:glow-primary transition-all">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">Sync capture</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
              </div>
            )}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-10 flex flex-col sm:flex-row gap-4 pb-12">
            <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => router.back()}>Abort</Button>
            <Button type="submit" className="flex-[2] h-14 rounded-[2rem] font-black uppercase tracking-widest text-[11px] bg-primary glow-primary shadow-xl" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (initialData ? "Synchronize" : "Execute entry")}
            </Button>
          </motion.div>
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
          currencyCode={user?.currency}
        />
      )}
    </div>
  );
}
