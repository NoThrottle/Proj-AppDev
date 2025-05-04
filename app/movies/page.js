// app/movies/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import MoviesClient from "./MoviesClient.js";

export default async function MoviesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const movies = await prisma.movie.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <MoviesClient movies={movies} />;
}