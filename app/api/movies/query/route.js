import prisma from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "recently_added";
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const skip = (page - 1) * limit;

  let movies = [];
  let total = 0;

  if (type === "recently_added") {
    // Movies added to any watchlist in the last 30 days, ordered by most recent
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const entries = await prisma.watchlistEntry.findMany({
      where: { dateAdded: { gte: since } },
      orderBy: { dateAdded: "desc" },
      skip,
      take: limit,
      include: { movie: true },
    });
    movies = entries.map((entry) => entry.movie);
    total = await prisma.watchlistEntry.count({ where: { dateAdded: { gte: since } } });
  } else if (type === "top_watched") {
    // Movies with the most watchlist entries marked as watched
    const watchedCounts = await prisma.watchlistEntry.groupBy({
      by: ["movieId"],
      where: { dateWatched: { not: null } },
      _count: { movieId: true },
      orderBy: { _count: { movieId: "desc" } },
      skip,
      take: limit,
    });
    const ids = watchedCounts.map((g) => g.movieId);
    movies = await prisma.movie.findMany({ where: { id: { in: ids } } });
    total = await prisma.watchlistEntry.count({ where: { dateWatched: { not: null } } });
  } else if (type === "highly_rated") {
    // Movies with the highest average rating (at least 1 rating)
    const ratings = await prisma.ratingEntry.groupBy({
      by: ["movieId"],
      _avg: { rating: true },
      _count: { rating: true },
      orderBy: { _avg: { rating: "desc" } },
      skip,
      take: limit,
    });
    const ids = ratings.map((g) => g.movieId);
    movies = await prisma.movie.findMany({ where: { id: { in: ids } } });
    total = await prisma.ratingEntry.count();
  } else if (type === "top_newest_highest_rated") {
    // Top 5 newest movies within the last month, sorted by highest average rating
    const since = new Date();
    since.setDate(since.getDate() - 30);
    // Get movies added in the last 30 days
    const recentMovies = await prisma.movie.findMany({
      where: { createdAt: { gte: since } },
      include: {
        ratingEntries: true,
      },
    });
    // Calculate average rating for each movie
    const moviesWithAvg = recentMovies.map((movie) => {
      const ratings = movie.ratingEntries.map((r) => r.rating);
      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      return { ...movie, avgRating };
    });
    // Sort by avgRating desc, then by createdAt desc
    moviesWithAvg.sort((a, b) => b.avgRating - a.avgRating || b.createdAt - a.createdAt);
    movies = moviesWithAvg.slice(0, limit);
    total = movies.length;
  } else if (type === "search") {
    const query = searchParams.get("query") || "";
    movies = await prisma.movie.findMany({
      where: {
        title: {
          contains: query
        },
        visibility: "public",
      },
      orderBy: { title: "asc" },
      take: limit,
    });
    total = movies.length;
  } else {
    return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });
  }

  return new Response(JSON.stringify({ movies, total, page, limit }), { status: 200 });
}
