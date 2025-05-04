// app/movies/[id]/delete/page.js
import prisma from "@/lib/prisma";
import { notFound, redirect, forbidden } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function DeleteMoviePage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const movieId = parseInt(params.id, 10);
  const movie = await prisma.movie.findUnique({ where: { id: movieId } });

  if (!movie) return notFound();
  if (movie.userId !== session.user.id) return forbidden();

  const deleteMovie = async () => {
    "use server";
    await prisma.movie.delete({ where: { id: movieId } });
    redirect("/watchlist");
  };

  return (
    <form action={deleteMovie} className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-xl font-bold">Are you sure you want to delete this movie?</h2>
      <p className="text-gray-600">{movie.title}</p>
      <div className="flex space-x-4">
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">
          Yes, Delete
        </button>
        <a href="/watchlist" className="bg-green-300 text-black px-4 py-2 rounded">
          Cancel
        </a>
      </div>
    </form>

  );
}