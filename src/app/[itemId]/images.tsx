"use client";

import Image from "next/image";
import { useState } from "react";

import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";

export const Images = ({ images }: { images: string[] }) => {
  const [api, setApi] = useState<CarouselApi>();

  return (
    <div className="grid items-start gap-3 md:grid-cols-5">
      <div className="hidden flex-col items-start gap-3 md:flex">
        {images?.map((imageUrl, index) => (
          <button
            key={imageUrl}
            className="overflow-hidden rounded-lg border transition-colors hover:border-gray-900 dark:hover:border-gray-50"
            onClick={() => api?.scrollTo(index)}
          >
            <Image
              alt="Preview thumbnail"
              className="aspect-[5/6] object-cover"
              height={120}
              src={`https://mdgcufdkeduqpujdalzp.supabase.co/storage/v1/object/public/files/${imageUrl}`}
              width={100}
            />
          </button>
        ))}
      </div>
      <div className="md:col-span-4">
        <Carousel setApi={setApi} className="w-full max-w-md">
          <CarouselContent>
            {images?.map((imageUrl) => (
              <CarouselItem key={imageUrl}>
                <Image
                  alt="Product Image"
                  className="aspect-[2/3] w-full overflow-hidden rounded-lg border border-gray-200 object-cover dark:border-gray-800"
                  height={900}
                  src={`https://mdgcufdkeduqpujdalzp.supabase.co/storage/v1/object/public/files/${imageUrl}`}
                  width={600}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};
