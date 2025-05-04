import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect, forbidden } from "next/navigation";
import Link from "next/link";
import { Button, Card } from "flowbite-react";

export default async function ViewMoviePage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const movieId = parseInt(params.id, 10);
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: { genre: true },
  });

  if (!movie) return notFound();
  if (movie.userId !== session.user.id) return forbidden();

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <h1 className="text-2xl font-bold">{movie.title}</h1>
        <p><strong>Genre:</strong> {movie.genre?.name}</p>
        <p><strong>Description:</strong> {movie.description || "No description"}</p>
        <p>
          <strong>Watched:</strong>{" "}
          <span className={movie.watched ? "text-green-600" : "text-red-600"}>
            {movie.watched ? "Yes" : "No"}
          </span>
        </p>
        <p><strong>Rating:</strong> {movie.rating ?? "—"}</p>

      <div className="flex gap-2 mt-4">
        <Button as={Link} href={`/watchlist/${movie.id}/edit`} color="blue">
          Edit
        </Button>
        <Button as={Link} href={`/watchlist/${movie.id}/delete`} color="red">
          Delete
        </Button>
        <Button as={Link} href="/watchlist" color="gray">
          Done
        </Button>
      </div>
      </Card>
    </div>
  );
}