import prisma from "@/lib/prisma";
import { notFound, redirect, forbidden } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MovieForm from "../../MovieForm";

export default async function EditMoviePage({ params }) {
  const id = parseInt(params.id, 10);

  // Get current movie
  const movie = await prisma.movie.findUnique({
    where: { id },
  });

  if (!movie) return notFound();

  // Get session
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // ✅ Check if the logged-in user is the movie owner
  if (movie.userId !== session.user.id) {
    return forbidden("You are not allowed to edit this movie.");
  }

  // Get genre list
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });

  // Server action to update movie
  const saveMovie = async (formData) => {
    "use server";

    const title = formData.get("title")?.trim();
    const description = formData.get("description")?.trim() || "";
    const posterUrl = formData.get("posterUrl")?.trim() || "";
    const genreId = parseInt(formData.get("genreId"));
    const watched = formData.get("watched") === "on";
    const rating = parseFloat(formData.get("rating"));

    await prisma.movie.update({
      where: { id },
      data: {
        title,
        description,
        posterUrl,
        genreId,
        watched,
        rating: isNaN(rating) ? null : rating,
      },
    });

    redirect(`/movies/${id}`);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Movie #{id}</h2>
      <MovieForm movie={movie} onSubmit={saveMovie} genres={genres} />
    </div>
  );
}