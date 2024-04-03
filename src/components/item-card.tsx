import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { type Database } from "~/types/supabase";

export const ItemCard = ({
  item,
}: {
  item: Database["public"]["Tables"]["items"]["Row"];
}) => {
  return (
    <Link key={item?.id} href={`/${item.id}`}>
      <Card className="h-full w-full">
        <CardHeader className="p-4">
          <Image
            alt={item.name ?? "placeholder"}
            className="h-auto w-full"
            height="150"
            src={
              item?.images?.[0]
                ? `https://mdgcufdkeduqpujdalzp.supabase.co/storage/v1/object/public/files/${item.images?.[0]}`
                : "/placeholder.svg"
            }
            style={{
              aspectRatio: "250/150",
              objectFit: "cover",
            }}
            width="250"
          />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <CardTitle className="line-clamp-2 text-ellipsis">
            {item.name}
          </CardTitle>
          <CardDescription>
            {item.price} {item.currency}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};
