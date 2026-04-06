
"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { LoadingScreen } from "@/components/layout/loading-screen";

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

  return <LoadingScreen />;
}
