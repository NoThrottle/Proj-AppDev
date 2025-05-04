// app/movies/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import WatchlistsClient from "./WatchlistsClient";

export default async function WatchlistsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const watchlists = await prisma.watchlist.findMany({
    where: { userId: session.user.id },
    orderBy: { id: "asc" },
  });

  // Server action to create a new watchlist
  async function createWatchlist(name) {
    "use server";
    if (!name) return;
    try {
      await prisma.watchlist.create({
        data: { userId: session.user.id, name },
      });
      redirect("/watchlist");
    } catch (error) {
      console.error("Database error (createWatchlist):", error);
      // Optionally show a toast or set a UI error state here
      return;
    }
  }

  // Server action to delete a watchlist
  async function deleteWatchlist(id) {
    "use server";
    try {
      await prisma.watchlist.delete({ where: { id } });
      redirect("/watchlist");
    } catch (error) {
      console.error("Database error (deleteWatchlist):", error);
      // Optionally show a toast or set a UI error state here
      return;
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Watchlists</h1>
      <WatchlistsClient
        watchlists={watchlists}
        onCreate={createWatchlist}
        onDelete={deleteWatchlist}
      />
    </div>
  );
}