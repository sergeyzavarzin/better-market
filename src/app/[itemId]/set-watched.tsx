"use client";

import { useEffect } from "react";
import { setWatched } from "~/app/actions";

export const SetWatched = ({ itemId }: { itemId: string }) => {
  useEffect(() => {
    void setWatched(itemId).catch(console.error);
  }, [itemId]);

  return null;
};
