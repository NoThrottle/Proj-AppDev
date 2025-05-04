// app/movies/page.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Card } from "flowbite-react";

export default async function MoviesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const movies = await prisma.movie.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const topMovies = movies
    .filter((movie) => typeof movie.rating === "number")
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Top 10 Movies</h1>
      </div>

      <div className="flex flex-col gap-4">
        {topMovies.map((movie, index) => (
          <Card key={movie.id} className="flex flex-row gap-4 items-center p-4">
            {/* Rank number */}
            <div className="text-2xl font-bold text-blue-700 w-6">{index + 1}.</div>

            {/* Poster */}
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                width={80}
                height={120}
                className="rounded w-[80px] h-[120px] object-cover"
              />
            ) : (
              <div className="w-[80px] h-[120px] bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                No Image
              </div>
            )}

            {/* Movie Info */}
            <div className="flex flex-col justify-between">
              <h5 className="text-lg font-semibold">{movie.title}</h5>
              <p className="text-sm text-gray-500">Rating: {movie.rating}</p>
              <p className="text-sm text-gray-400">
                Watched:{" "}
                <span className={movie.watched ? "text-green-600" : "text-red-600"}>
                  {movie.watched ? "Yes" : "No"}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Added: {new Date(movie.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
