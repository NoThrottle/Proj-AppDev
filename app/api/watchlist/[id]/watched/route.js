import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const entryId = parseInt(params.id, 10);
  if (!entryId) {
    return new Response(JSON.stringify({ error: "Missing entry id" }), { status: 400 });
  }
  const { dateWatched } = await req.json();
  const entry = await prisma.watchlistEntry.update({
    where: { id: entryId },
    data: { dateWatched: dateWatched ? new Date(dateWatched) : new Date() },
  });
  return new Response(JSON.stringify({ success: true, entry }), { status: 200 });
}
