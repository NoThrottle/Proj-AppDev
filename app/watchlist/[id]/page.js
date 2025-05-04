import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect, forbidden } from "next/navigation";
import Link from "next/link";
import { Button } from "flowbite-react";
import WatchlistEntriesClient from "../WatchlistEntriesClient";

export default async function WatchlistDetailPage({ params }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const watchlistId = parseInt(resolvedParams.id, 10);
  const watchlist = await prisma.watchlist.findUnique({
    where: { id: watchlistId },
    include: {
      entries: {
        include: {
          movie: { include: { genres: true } }
        },
        orderBy: { rank: "asc" }
      }
    }
  });

  if (!watchlist) return notFound();
  if (watchlist.userId !== session.user.id) return forbidden();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{watchlist.name}</h1>
      <WatchlistEntriesClient entries={watchlist.entries} />
      <div className="mt-6 flex justify-center">
        <Button as={Link} href="/watchlist" color="gray" className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
          Back to Watchlists
        </Button>
      </div>
    </div>
  );
}