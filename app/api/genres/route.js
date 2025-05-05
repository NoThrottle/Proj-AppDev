import prisma from "@/lib/prisma";

export async function GET() {
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  return Response.json(genres);
}
