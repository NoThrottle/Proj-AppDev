// app/movies/[id]/edit/page.js
import prisma from "@/lib/prisma";
import { notFound, redirect, forbidden } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import MovieForm from "../../MovieForm";

export default async function EditMoviePage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const movieId = parseInt(params.id, 10);
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movie) return notFound();
  if (movie.userId !== session.user.id) return forbidden();

  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });

  const saveMovie = async (formData) => {
    "use server";

    const title = formData.get("title")?.trim();
    const description = formData.get("description")?.trim() || "";
    const genreId = parseInt(formData.get("genreId"));
    const watched = formData.get("watched") === "on";
    const rating = parseFloat(formData.get("rating"));

    await prisma.movie.update({
      where: { id: movieId },
      data: {
        title,
        description,
        genreId,
        watched,
        rating: isNaN(rating) ? null : rating,
      },
    });

    redirect(`/watchlist/${movieId}`);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Movie #{movieId}</h2>
      <MovieForm movie={movie} onSubmit={saveMovie} genres={genres} />
    </div>
  );
}