
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { LoadingScreen } from "@/components/layout/loading-screen";

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const { user, isLoading } = useStore();

  useEffect(() => {
    if (isLoading || !groupId) return;

    if (!user) {
      router.push(`/auth?redirect=/join?groupId=${groupId}`);
    } else {
      router.replace(`/groups/details?groupId=${groupId}&join=true`);
    }
  }, [user, isLoading, groupId, router]);

  if (!groupId) {
    return <div className="p-8 text-center">Invalid Join Link</div>;
  }

  return <LoadingScreen />;
}

export default function JoinPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <JoinContent />
    </Suspense>
  );
}
