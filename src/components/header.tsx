import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Search } from "~/components/search";
import { FlagIcon } from "~/components/icons/flag";

export const Header = () => (
  <>
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
  </>
);
