import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  const params = await context.params;
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "recent";
  const movieId = parseInt(params.id, 10);
  const userParam = searchParams.get("user");
  const period = searchParams.get("period");

  if (userParam === "me") {
    // Return the current user's review for this movie
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return new Response(JSON.stringify({ review: null }), { status: 200 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return new Response(JSON.stringify({ review: null }), { status: 200 });
    }
    const review = await prisma.ratingEntry.findFirst({
      where: { userId: user.id, movieId },
    });
    return new Response(JSON.stringify({ review }), { status: 200 });
  }

  if (period) {
    // Ratings chart data for the past N days or all time
    let since = null;
    if (period !== "all") {
      const days = parseInt(period, 10);
      since = new Date();
      since.setDate(since.getDate() - days);
    }
    const ratings = await prisma.ratingEntry.findMany({
      where: {
        movieId,
        ...(since ? { createdAt: { gte: since } } : {}),
      },
      orderBy: { createdAt: "asc" },
    });
    // Group by day
    const chart = [];
    const map = {};
    for (const r of ratings) {
      const day = r.createdAt.toISOString().slice(0, 10);
      if (!map[day]) map[day] = [];
      map[day].push(r.rating);
    }
    Object.entries(map).forEach(([date, ratings]) => {
      chart.push({ date, avg: ratings.reduce((a, b) => a + b, 0) / ratings.length, count: ratings.length });
    });
    chart.sort((a, b) => a.date.localeCompare(b.date));
    return new Response(JSON.stringify({ chart }), { status: 200 });
  }

  let orderBy = { createdAt: "desc" };
  if (sort === "highest") orderBy = { rating: "desc" };
  if (sort === "lowest") orderBy = { rating: "asc" };
  const reviews = await prisma.ratingEntry.findMany({
    where: { movieId },
    include: { user: true },
    orderBy,
  });
  return new Response(JSON.stringify({ reviews }), { status: 200 });
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }
  const movieId = parseInt(params.id, 10);
  const { rating, subject, comment } = await req.json();
  // Check if user already has a review for this movie
  const existing = await prisma.ratingEntry.findFirst({ where: { userId: user.id, movieId } });
  let review;
  if (existing) {
    // Update existing review
    review = await prisma.ratingEntry.update({
      where: { id: existing.id },
      data: { rating, subject, comment, createdAt: new Date() },
    });
  } else {
    // Create new review
    review = await prisma.ratingEntry.create({
      data: { userId: user.id, movieId, rating, subject, comment },
    });
  }
  return new Response(JSON.stringify({ review }), { status: 201 });
}
