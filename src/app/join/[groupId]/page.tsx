"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function JoinPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { user, isLoading } = useStore();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Redirect to auth if not logged in, with return path
      router.push(`/auth?redirect=/join/${groupId}`);
    } else {
      // Redirect to group page with join flag
      router.replace(`/groups/${groupId}?join=true`);
    }
  }, [user, isLoading, groupId, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="font-medium text-muted-foreground animate-pulse">Checking invitation...</p>
      </div>
    </div>
  );
}