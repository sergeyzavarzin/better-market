/**
 * v0 by Vercel.
 * ~see https://v0.dev/t/vkisuzDC95a
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { type SVGProps } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import Link from "next/link";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "~/components/ui/card";
import { createClient } from "~/lib/supabase/server";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Search } from "~/app/search";

const PER_PAGE = 14;

const getItems = async (page: number, search?: string) => {
  const supabase = createClient();

  // is search presented search by name or description
  if (search) {
    const res = await supabase
      .from("items")
      .select()
      .textSearch("name, description", search)
      .range(page * PER_PAGE, (page + 1) * PER_PAGE);

    return res;
  }

  const res = await supabase
    .from("items")
    .select()
    .range(page * PER_PAGE, (page + 1) * PER_PAGE);

  return res;
};

type Props = {
  searchParams?: {
    page?: number;
    search?: string;
  };
};

export default async function IndexPage({ searchParams }: Props) {
  const currentPage = Number(searchParams?.page ?? 0);

  const res = await getItems(currentPage, searchParams?.search);

  const data = res?.data ?? [];

  return (
    <div className="mx-auto max-w-screen-xl px-4">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <FlagIcon className="h-10 w-10" />
          </Link>
          <Button className="text-sm" variant="outline">
            Все категории
          </Button>
        </div>
        <Search />
      </header>
      <nav className="flex items-center justify-between border-b py-4">
        <div className="flex space-x-4">
          <Link className="text-sm" href="#">
            Авто
          </Link>
          <Link className="text-sm" href="#">
            Недвижимость
          </Link>
          <Link className="text-sm" href="#">
            Работа
          </Link>
          <Link className="text-sm" href="#">
            Одежда, обувь, аксессуары
          </Link>
          <Link className="text-sm" href="#">
            Хобби и отдых
          </Link>
          <Link className="text-sm" href="#">
            Животные
          </Link>
          <Link className="text-sm" href="#">
            Товары для бизнеса и оборудование
          </Link>
        </div>
        <div className="flex space-x-4">
          <Link className="text-sm" href="#">
            Вы смотрели
          </Link>
          <Link className="text-sm" href="#">
            Сервисы и услуги
          </Link>
        </div>
      </nav>
      <main>
        <section className="py-6">
          <h2 className="mb-4 text-xl font-semibold">
            {searchParams?.search
              ? "Результаты поиска"
              : "Рекомендации для вас"}
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {!!data?.length &&
              data?.map((item) => (
                <Card key={item.id} className="w-full">
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>
                      {item.price} {item.currency}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img
                      alt={item.name}
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
                  </CardContent>
                </Card>
              ))}
          </div>
          <Pagination className="mt-5">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={currentPage > 0 ? `/?page=${currentPage - 1}` : `/`}
                />
              </PaginationItem>
              {/*<PaginationItem>*/}
              {/*  <PaginationLink href="#">1</PaginationLink>*/}
              {/*</PaginationItem>*/}
              {/*<PaginationItem>*/}
              {/*  <PaginationEllipsis />*/}
              {/*</PaginationItem>*/}
              <PaginationItem>
                <PaginationNext
                  href={
                    data?.length < PER_PAGE ? "/" : `/?page=${currentPage + 1}`
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </section>
      </main>
      <footer className="py-4">
        <div className="text-sm">
          <p>© cepera 2024.</p>
        </div>
      </footer>
    </div>
  );
}

function FlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}
