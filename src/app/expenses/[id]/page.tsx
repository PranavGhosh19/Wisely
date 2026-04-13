
"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyExpenseRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/expenses/details?id=${id}`);
    }
  }, [id, router]);

  return null;
}
