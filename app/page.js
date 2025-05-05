// app/page.js (Home Page)
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Card } from "flowbite-react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const bannerImages = [
  {
    src: "/file.svg",
    alt: "Movie Banner 1",
  },
  {
    src: "/globe.svg",
    alt: "Movie Banner 2",
  },
  {
    src: "/window.svg",
    alt: "Movie Banner 3",
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const carouselApiRef = useRef(null);
  const [bannerMovies, setBannerMovies] = useState([]);

  useEffect(() => {
    fetch("/api/movies/query?type=top_newest_highest_rated&limit=5")
      .then((res) => res.json())
      .then((data) => setBannerMovies(data.movies || []));
  }, []);

  useEffect(() => {
    if (!carouselApiRef.current || bannerMovies.length === 0) return;
    const api = carouselApiRef.current;
    let interval = setInterval(() => {
      if (api) {
        if (api.selectedScrollSnap() === bannerMovies.length - 1) {
          api.scrollTo(0); // Loop back to start
        } else {
          api.scrollNext();
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselApiRef.current, bannerMovies.length]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center pt-0 justify-start min-h-screen bg-background px-4">
      <div className="w-full flex justify-center mb-10 mt-0">
        <Carousel className="w-full max-w-[1200px] aspect-[3/1] relative" setApi={api => (carouselApiRef.current = api)}>
          <CarouselContent>
            {(bannerMovies.length ? bannerMovies : bannerImages).map((movie, idx) => (
              <CarouselItem key={idx} className="flex items-center justify-center">
                <img
                  src={movie.bannerUrl || movie.posterUrl || movie.src || "/file.svg"}
                  alt={movie.title || movie.alt || "Movie Banner"}
                  className="object-cover w-full h-full rounded-xl shadow-lg"
                  style={{ maxHeight: 400 }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <Card className="w-full max-w-2xl shadow-lg border border-gray-200">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">
              🎬 Movie Watchlist
            </h1>
            <p className="text-gray-200 text-lg">
              Organize your movie collection effortlessly. Track what you've seen, rate your favorites, and plan your next movie night.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              as={Link}
              href="/movies"
              gradientDuoTone="purpleToPink"
              size="lg"
            >
              Go to Movies
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
