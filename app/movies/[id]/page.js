// app/movies/[id]/page.jsx
import prisma from "@/lib/prisma";
import { Button } from "flowbite-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ViewMoviePage({ params }) {
  // Await the params object
  const { id } = await params; // Correctly await params

  if (!id) return notFound(); // ensure `id` is available

  const movieId = parseInt(id, 10); // Use the awaited id
  if (isNaN(movieId)) return notFound();

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: { genre: true },
  });

  if (!movie) return notFound();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center">{movie.title}</h1>

      <div className="border rounded-lg p-6 bg-white shadow-md space-y-4">
        <p><strong>Description:</strong> {movie.description || "No description available."}</p>
        <p><strong>Genre:</strong> {movie.genre?.name || "No genre selected"}</p>
        <p><strong>Watched:</strong> {movie.watched ? "Yes" : "No"}</p>
        <p><strong>Rating:</strong> {movie.rating != null ? `${movie.rating}/5` : "Not rated"}</p>
      </div>

      <div className="flex justify-center gap-4">
        <Button as={Link} href={`/movies/${movieId}/edit`} color="cyan">
          Edit
        </Button>
        <Button as={Link} href={`/movies/${movieId}/delete`} color="failure">
          Delete
        </Button>
      </div>
    </div>
  );
}