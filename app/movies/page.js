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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Movie Watchlist</h1>
        <Button as={Link} href="/movies/create" gradientDuoTone="purpleToBlue">
          Add Movie
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <Card key={movie.id} className="max-w-sm">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                width={400}
                height={250}
                className="rounded-lg w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
                No Image
              </div>
            )}

            <h5 className="text-xl font-semibold tracking-tight text-gray-900">
              {movie.title}
            </h5>

            <p className="text-sm text-gray-500">
              Watched:{" "}
              <span className={movie.watched ? "text-green-600" : "text-red-600"}>
                {movie.watched ? "Yes" : "No"}
              </span>
            </p>

            <p className="text-sm text-gray-500">Rating: {movie.rating ?? "—"}</p>
            <p className="text-sm text-gray-400">
              Created: {new Date(movie.createdAt).toLocaleDateString()}
            </p>

            <div className="mt-4 flex gap-2">
              <Button size="xs" color="green" as={Link} href={`/movies/${movie.id}`}>
                View
              </Button>
              <Button size="xs" color="cyan" as={Link} href={`/movies/${movie.id}/edit`}>
                Edit
              </Button>
              <Button size="xs" color="red" as={Link} href={`/movies/${movie.id}/delete`}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}