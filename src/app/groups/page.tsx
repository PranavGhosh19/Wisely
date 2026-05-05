"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Loader2, Check, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { cn, getCurrencySymbol, formatCompactNumber } from "@/lib/utils";
import { calculateGroupBalances } from "@/lib/balances";
import { motion } from "framer-motion";

function GroupCard({ group, userId, currencyCode }: { group: any; userId: string; currencyCode?: string }) {
  const router = useRouter();
  const db = useFirestore();
  
  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !group.id || !userId) return null;
    return query(
      collection(db, "groups", group.id, "expenses"),
      where("groupMemberIds", "array-contains", userId),
      where("isDeleted", "==", false)
    );
  }, [db, group.id, userId]);

  const { data: groupExpenses } = useCollection(groupExpensesQuery);

  const balance = useMemo(() => {
    if (!groupExpenses || !userId) return 0;
    const stats = calculateGroupBalances(group.members || [], groupExpenses);
    return stats[userId] || 0;
  }, [groupExpenses, userId, group.members]);

  const symbol = getCurrencySymbol(currencyCode);
  const isOwed = balance > 0.01;
  const isOwe = balance < -0.01;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="glass-card border-white/5 hover:border-primary/30 transition-all cursor-pointer group rounded-[2rem] h-32 flex flex-col justify-center overflow-hidden relative"
        onClick={() => router.push(`/groups/details?groupId=${group.id}`)}
      >
        <div className="absolute top-0 right-0 p-4">
           <Zap className={cn("h-4 w-4 opacity-10 group-hover:opacity-100 transition-opacity", isOwed ? "text-green-500" : isOwe ? "text-destructive" : "text-primary")} />
        </div>
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
          <div className="flex flex-col min-w-0 pr-2">
            <CardTitle className="font-black text-xl text-foreground uppercase tracking-tight truncate mb-1">
              {group.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-lg glass flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <Users className="h-3 w-3" />
              </div>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                {group.members?.length || 0} SECTOR NODES
              </span>
            </div>
          </div>
          
          <div className={cn(
            "h-20 w-28 rounded-2xl glass flex flex-col items-center justify-center transition-all group-hover:glow-primary",
            isOwed ? "border-green-500/20" : isOwe ? "border-destructive/20" : "border-white/5"
          )}>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 mb-1">
                {isOwed ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : isOwe ? (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                ) : (
                  <Check className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                  {isOwed ? "INFLOW" : isOwe ? "OUTFLOW" : "STABLE"}
                </span>
              </div>
              <span className={cn(
                "text-lg font-black tracking-tighter",
                isOwed ? "text-green-500" : isOwe ? "text-destructive" : "text-foreground"
              )}>
                {symbol}{formatCompactNumber(Math.abs(balance))}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}

export default function GroupsPage() {
  const { user, setGroups } = useStore();
  const db = useFirestore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const groupsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "groups"),
      where("members", "array-contains", user.uid)
    );
  }, [db, user]);

  const { data: groups, isLoading } = useCollection(groupsQuery);

  useEffect(() => {
    if (groups) {
      setGroups(groups);
    }
  }, [groups, setGroups]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <h2 className="text-3xl md:text-5xl font-black text-glow uppercase tracking-tighter">NETWORK</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Collaborative Vaults / Protocol Members</p>
          </div>
          <Button 
            className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary glow-primary gap-3 group transition-all active:scale-95"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Establish Group
          </Button>
        </motion.header>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-[1rem] border-4 border-primary border-t-transparent glow-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scanning Peer Connections...</p>
            </div>
          </div>
        ) : !groups || groups.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-[3rem] border-dashed border-white/10"
          >
            <div className="h-24 w-24 glass rounded-[2rem] flex items-center justify-center text-primary mb-8 glow-primary">
              <Users className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-glow">No Peer Groups Linked</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-3 mb-10 leading-relaxed uppercase font-bold tracking-widest opacity-60">
              Establish a shared ledger node to begin multi-member tracking and settlements.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-[0.3em] text-xs">
              Initialize First Node
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} userId={user?.uid || ""} currencyCode={user?.currency} />
            ))}
          </motion.div>
        )}
      </main>

      <CreateGroupDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
