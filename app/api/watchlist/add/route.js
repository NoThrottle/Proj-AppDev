import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { movieId, watchlistId } = await req.json();
  if (!movieId) {
    return new Response(JSON.stringify({ error: "Missing movieId" }), { status: 400 });
  }

  // Find or create the user's default watchlist if watchlistId is not provided
  let targetWatchlistId = watchlistId;
  if (!targetWatchlistId) {
    let watchlist = await prisma.watchlist.findFirst({
      where: { userId: session.user.id },
      orderBy: { id: "asc" },
    });
    if (!watchlist) {
      watchlist = await prisma.watchlist.create({
        data: {
          userId: session.user.id,
          name: "My Watchlist",
        },
      });
    }
    targetWatchlistId = watchlist.id;
  }

  // Prevent duplicate entries
  const existing = await prisma.watchlistEntry.findFirst({
    where: {
      userId: session.user.id,
      watchlistId: targetWatchlistId,
      movieId: Number(movieId),
    },
  });
  if (existing) {
    return new Response(JSON.stringify({ error: "Movie already in watchlist" }), { status: 409 });
  }

  // Add the movie to the watchlist
  const entry = await prisma.watchlistEntry.create({
    data: {
      userId: session.user.id,
      watchlistId: targetWatchlistId,
      movieId: Number(movieId),
      rank: 1, // You may want to set this based on current list length
    },
  });

  return new Response(JSON.stringify({ success: true, entry }), { status: 201 });
}
