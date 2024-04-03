/**
 * v0 by Vercel.
 * ~see https://v0.dev/t/vkisuzDC95a
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { createClient } from "~/lib/supabase/server";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { ItemCard } from "~/components/item-card";

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
    <section className="py-6">
      <h2 className="mb-4 text-xl font-semibold">
        {searchParams?.search ? "Результаты поиска" : "Рекомендации для вас"}
      </h2>
      <div className="grid grid-cols-5 gap-4">
        {!!data?.length &&
          data?.map((item) => <ItemCard key={item.id} item={item} />)}
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
              href={data?.length < PER_PAGE ? "/" : `/?page=${currentPage + 1}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </section>
  );
}
