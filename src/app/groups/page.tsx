
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, HelpCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export default function GroupsPage() {
  const router = useRouter();
  const { user, setGroups } = useStore();
  const db = useFirestore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Safe Fetching: Guard query with !user and align with list rule
  const groupsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "groups"),
      where("members", "array-contains", user.uid)
    );
  }, [db, user]);

  const { data: groups, isLoading } = useCollection(groupsQuery);

  // Sync groups to store for AddExpenseDialog usage
  useEffect(() => {
    if (groups) {
      setGroups(groups);
    }
  }, [groups, setGroups]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold font-headline text-primary">Groups</h2>
            <p className="text-muted-foreground">Split bills with friends and family seamlessly.</p>
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
          <div className="py-20 flex justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>
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
              <Card 
                key={group.id} 
                className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-card group rounded-2xl h-24 flex flex-col justify-center overflow-hidden"
                onClick={() => router.push(`/groups/${group.id}`)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
                  <CardTitle className="font-headline text-lg font-bold text-foreground truncate max-w-[75%]">{group.name}</CardTitle>
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                    <Users className="h-5 w-5" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 p-6 bg-accent/5 rounded-2xl border border-accent/10 flex flex-col md:flex-row items-center gap-6">
          <div className="h-14 w-14 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
            <HelpCircle className="h-7 w-7 text-accent" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-bold text-lg mb-1">How do groups work?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you add a group expense, Wisely automatically calculates everyone's share. 
              You can split equally, by percentage, or exact amounts. Settle up with a single tap.
            </p>
          </div>
        </div>
      </main>

      <CreateGroupDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
