"use client";

import { useEffect } from "react";
import { clearWatched } from "~/app/actions";
import { useRouter } from "next/navigation";

export default function ClearWatched() {
  const router = useRouter();

  useEffect(() => {
    void clearWatched()
      .catch(console.error)
      .finally(() => {
        router.push("/");
      });
  }, [router]);

  return null;
}
