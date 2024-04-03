import { cookies } from "next/headers";
import { createClient } from "~/lib/supabase/server";
import { ItemCard } from "~/components/item-card";

const getWatchedItems = async () => {
  const watched = cookies().get("watchedList");

  if (!watched?.value) return { data: [], error: true };

  const parsedWatched = JSON.parse(watched.value) as Record<string, boolean>;

  const supabase = createClient();

  return supabase
    .from("items")
    .select()
    .in("id", Object.keys(parsedWatched).reverse());
};

export default async function WatchedPage() {
  const { data } = await getWatchedItems();
  return (
    <section className="py-6">
      <h2 className="mb-4 text-xl font-semibold">Вы смотрели</h2>
      <div className="grid grid-cols-5 gap-4">
        {!!data?.length &&
          data.map((item) => <ItemCard key={item.id} item={item} />)}
      </div>
    </section>
  );
}
