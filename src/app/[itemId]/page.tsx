/**
 * v0 by Vercel.
 * @see https://v0.dev/t/lqyaqqyyAFF
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "~/components/ui/button";
import { createClient } from "~/lib/supabase/server";
import Link from "next/link";
import { Images } from "~/app/[itemId]/images";

const getItem = async (id: string) => {
  const supabase = createClient();

  const res = await supabase.from("items").select().eq("id", id).single();

  return res;
};

type Props = {
  params: {
    itemId: string;
  };
};

export default async function ItemPage({ params }: Props) {
  const { data: item } = await getItem(params.itemId.toString());

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className="grid  items-start gap-6 py-6 md:grid-cols-2 lg:gap-12">
      <div className="grid items-start gap-4 md:gap-10">
        <div className="hidden items-start md:flex">
          <div className="grid gap-4">
            <h1 className="text-3xl font-bold lg:text-4xl">{item.name}</h1>
            <div className="text-2xl font-bold">
              {item.price} {item.currency}
            </div>
            <div>
              <p>{item.description}</p>
            </div>
          </div>
        </div>
        <form className="grid gap-4 md:gap-10">
          <Link href={`tg://user?id=${item.seller_id}`}>
            <Button size="lg">Связаться с продавцом</Button>
          </Link>
        </form>
      </div>
      <Images images={item?.images ?? []} />
    </div>
  );
}
