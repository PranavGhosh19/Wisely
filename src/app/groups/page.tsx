"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, ArrowRight, UserPlus, HelpCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";

export default function GroupsPage() {
  const router = useRouter();
  const { groups, expenses } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Helper to calculate total volume for a group
  const getGroupBalance = (groupId: string) => {
    const groupExpenses = expenses.filter(e => e.groupId === groupId);
    return groupExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  };

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

        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm border-2 border-dashed border-muted">
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const groupVolume = getGroupBalance(group.id);
              return (
                <Card 
                  key={group.id} 
                  className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white group rounded-2xl"
                  onClick={() => router.push(`/groups/${group.id}`)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-headline text-lg font-bold">{group.name}</CardTitle>
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <UserPlus className="h-4 w-4" />
                      {group.members.length} Members
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Group Spending</span>
                      <span className="text-2xl font-bold text-primary">
                        ${groupVolume.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="ghost" className="w-full text-primary hover:bg-primary/5 gap-2 group-hover:translate-x-1 transition-transform font-bold rounded-xl">
                      View Group
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
            
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all group min-h-[220px]"
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
              </div>
              <p className="font-bold text-muted-foreground group-hover:text-primary">Create New Group</p>
            </button>
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
