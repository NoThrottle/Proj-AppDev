// app/movies/[id]/delete/page.jsx
import prisma from "@/lib/prisma";
import { Button } from "flowbite-react";
import Form from "next/form";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function DeleteMoviePage({ params }) {
  const id = parseInt(params.id, 10);

  const movie = await prisma.movie.findUnique({
    where: { id },
  });

  if (!movie) return notFound();

  const deleteMovie = async () => {
    "use server";

    await prisma.movie.delete({
      where: { id },
    });

    redirect("/movies");
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-semibold text-gray-800">
        Are you sure you want to delete <b>{movie.title}</b>?
      </h1>

      <Form action={deleteMovie} className="flex gap-4">
        <Button type="submit" color="failure">
          Yes, Delete
        </Button>
        <Button as={Link} href={`/movies/${id}`} color="light">
          No, Go Back
        </Button>
      </Form>
    </div>
  );
}