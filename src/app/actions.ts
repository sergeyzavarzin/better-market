"use server";

import { cookies } from "next/headers";

export const setWatched = async (itemId: string) => {
  const cookieStore = cookies();

  const watched = cookieStore.get("watchedList");

  const parsedWatched = watched
    ? (JSON.parse(watched.value) as Record<string, boolean>)
    : {};

  const newWatched = { ...parsedWatched, [itemId]: true };

  cookies().set("watchedList", JSON.stringify(newWatched));
};

export const clearWatched = async () => {
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  return cookies().delete("watchedList");
};
