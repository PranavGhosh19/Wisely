
"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyGroupRedirect({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (groupId) {
      router.replace(`/groups/details?groupId=${groupId}`);
    }
  }, [groupId, router]);

  return null;
}
