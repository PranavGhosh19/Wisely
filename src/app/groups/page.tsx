"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, ArrowRight, UserPlus } from "lucide-react";

export default function GroupsPage() {
  const mockGroups = [
    { id: "1", name: "Roommates 202", members: 3, balance: 45.00 },
    { id: "2", name: "Europe Trip", members: 5, balance: -12.50 },
    { id: "3", name: "Grocery Pool", members: 2, balance: 0.00 },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold font-headline text-primary">Groups</h2>
            <p className="text-muted-foreground">Split bills with friends and family seamlessly.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-5 w-5" />
            Create Group
          </Button>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockGroups.map((group) => (
            <Card key={group.id} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-headline text-lg">{group.name}</CardTitle>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <UserPlus className="h-4 w-4" />
                  {group.members} Members
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Your Balance</span>
                  <span className={`text-xl font-bold ${
                    group.balance > 0 ? "text-accent" : 
                    group.balance < 0 ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {group.balance > 0 ? `+ $${group.balance.toFixed(2)}` : 
                     group.balance < 0 ? `- $${Math.abs(group.balance).toFixed(2)}` : 
                     "Settled"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full text-primary hover:bg-primary/5 gap-2 group-hover:translate-x-1 transition-transform">
                  View Group Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          <button className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all group">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="font-bold text-muted-foreground group-hover:text-primary">Create New Group</p>
          </button>
        </div>
      </main>
    </div>
  );
}