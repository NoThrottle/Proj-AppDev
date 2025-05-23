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
  async function createWatchlist(formData) {
    "use server";
    if (!session || !session.user || !session.user.id) {
      console.error("No valid user session for creating watchlist");
      return;
    }
    const name = formData.get("name");
    const image = formData.get("image");
    const description = formData.get("description");
    const tintColor = formData.get("tintColor");
    if (!name) return;
    try {
      await prisma.watchlist.create({
        data: {
          userId: session.user.id,
          name,
          image: image || undefined,
          description: description || undefined,
          tintColor: tintColor || undefined,
        },
      });
      redirect("/watchlist");
    } catch (error) {
      console.error("Database error (createWatchlist):", error);
      return;
    }
  }

  // Server action to delete a watchlist
  async function deleteWatchlist(id) {
    "use server";
    try {
      await prisma.watchlist.delete({ where: { id } });
      // No redirect, just return true to signal success
      return true;
    } catch (error) {
      console.error("Database error (deleteWatchlist):", error);
      return false;
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{session.user.name}'s Watchlists</h1>
      <WatchlistsClient
        watchlists={watchlists}
        createWatchlist={createWatchlist}
        onDelete={deleteWatchlist}
        refreshOnDelete={true}
      />
    </div>
  );
}