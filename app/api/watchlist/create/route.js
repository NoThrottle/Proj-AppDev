import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  let { name, image, description, tintColor } = await req.json();
  name = name?.trim();
  if (!name) {
    return new Response(JSON.stringify({ error: "Missing name" }), { status: 400 });
  }
  // Prevent duplicate watchlist names for the same user
  const existing = await prisma.watchlist.findFirst({
    where: { userId: session.user.id, name },
  });
  if (existing) {
    return new Response(JSON.stringify({ error: "A watchlist with this name already exists." }), { status: 409 });
  }
  const watchlist = await prisma.watchlist.create({
    data: {
      userId: session.user.id,
      name,
      image: image || undefined,
      description: description || undefined,
      tintColor: tintColor || undefined,
    },
  });
  return new Response(JSON.stringify({ success: true, watchlist }), { status: 201 });
}
