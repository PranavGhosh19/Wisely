
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Loader2, Check, TrendingUp, TrendingDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { cn, getCurrencySymbol } from "@/lib/utils";

/**
 * Optimized Group Card using the "Pro-Level Architecture".
 * It reads pre-calculated balances directly from the group document.
 */
function GroupCard({ group, userId, currencyCode }: { group: any; userId: string; currencyCode?: string }) {
  const router = useRouter();
  
  // Instant access from cached field on group doc
  const balance = group.groupBalances?.[userId] || 0;
  const symbol = getCurrencySymbol(currencyCode);
  
  const isOwed = balance > 0.01;
  const isOwe = balance < -0.01;

  return (
    <Card 
      className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-card group rounded-2xl h-24 flex flex-col justify-center overflow-hidden"
      onClick={() => router.push(`/groups/${group.id}`)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex flex-col min-w-0 pr-2">
          <CardTitle className="font-headline text-base font-bold text-foreground truncate">
            {group.name}
          </CardTitle>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {group.members?.length || 0} members
            </span>
          </div>
        </div>
        
        <div className={cn(
          "px-4 py-2.5 rounded-xl flex flex-col items-center justify-center transition-all group-hover:scale-105 min-w-[110px]",
          isOwed ? "bg-green-500/10 text-green-500" : 
          isOwe ? "bg-destructive/10 text-destructive" : 
          "bg-muted/50 text-muted-foreground"
        )}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 leading-none mb-1">
              {isOwed ? (
                <>
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">You are owed</span>
                </>
              ) : isOwe ? (
                <>
                  <TrendingDown className="h-2.5 w-2.5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">You owe</span>
                </>
              ) : (
                <>
                  <Check className="h-2.5 w-2.5" />
                  <span className="text-[9px] font-bold uppercase tracking-tight">Settled</span>
                </>
              )}
            </div>
            <span className="text-sm font-black leading-none">
              {symbol}{Math.abs(balance).toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>
    </Card>
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
      
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold font-headline text-primary">Groups</h2>
            <p className="text-muted-foreground">Manage your shared expenses and balances.</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 gap-2 h-11 rounded-xl font-bold"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Create Group
          </Button>
        </header>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !groups || groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl shadow-sm border-2 border-dashed border-muted">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold font-headline">No groups yet</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-8">
              Create a group to start splitting expenses with your friends, roommates, or travel partners.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl font-bold">
              Start Your First Group
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} userId={user?.uid || ""} currencyCode={user?.currency} />
            ))}
          </div>
        )}
      </main>

      <CreateGroupDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
