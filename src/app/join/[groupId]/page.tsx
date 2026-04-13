
"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyJoinRedirect({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (groupId) {
      router.replace(`/join?groupId=${groupId}`);
    }
  }, [groupId, router]);

  return null;
}
