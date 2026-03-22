"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types";
import { Users } from "lucide-react";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const { user, addGroup } = useStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      toast({ title: "Error", description: "Group name is required." });
      return;
    }

    setLoading(true);
    try {
      const newGroup: Group = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        members: [user.uid],
        createdBy: user.uid,
        createdAt: Date.now(),
      };

      addGroup(newGroup);
      
      toast({ title: "Success", description: "Group created successfully." });
      onOpenChange(false);
      setName("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to create group." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Create New Group
          </DialogTitle>
          <DialogDescription>
            Collaborate on expenses with friends or family.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input 
              id="group-name" 
              placeholder="e.g., Summer Trip, Roommates" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xl h-11"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full bg-primary h-11 rounded-xl font-bold" disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
