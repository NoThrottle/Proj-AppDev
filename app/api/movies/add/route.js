import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  // Check if user is admin
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.admin) {
    return new Response(JSON.stringify({ error: "Admins only" }), { status: 403 });
  }
  const data = await req.json();
  const {
    title,
    description,
    posterUrl,
    bannerUrl,
    publishersSelected = [],
    studiosSelected = [],
    platformsSelected = [],
    castRoles = [],
    genresSelected = [],
    visibility = "public"
  } = data;
  if (!title) {
    return new Response(JSON.stringify({ error: "Title is required" }), { status: 400 });
  }
  try {
    console.log("Incoming data:", data);
    // Ensure all publishers exist, create if not
    const publisherIds = [];
    for (const pid of publishersSelected) {
      let pubId = parseInt(pid, 10);
      let pub = await prisma.publisher.findUnique({ where: { id: pubId } });
      if (!pub) {
        // Try to find by name if pid is a name (for new entries from UI)
        pub = await prisma.publisher.findUnique({ where: { name: pid } });
        if (!pub) {
          pub = await prisma.publisher.create({ data: { name: pid, pictureUrl: "" } });
        }
        pubId = pub.id;
      }
      publisherIds.push(pubId);
    }
    // Ensure all studios exist, create if not
    const studioIds = [];
    for (const sid of studiosSelected) {
      let studioId = parseInt(sid, 10);
      let studio = await prisma.studio.findUnique({ where: { id: studioId } });
      if (!studio) {
        studio = await prisma.studio.findUnique({ where: { name: sid } });
        if (!studio) {
          studio = await prisma.studio.create({ data: { name: sid, pictureUrl: "" } });
        }
        studioId = studio.id;
      }
      studioIds.push(studioId);
    }
    // Ensure all platforms exist, create if not
    const platformIds = [];
    for (const pid of platformsSelected) {
      let platId = parseInt(pid, 10);
      let plat = await prisma.platform.findUnique({ where: { id: platId } });
      if (!plat) {
        plat = await prisma.platform.findUnique({ where: { name: pid } });
        if (!plat) {
          plat = await prisma.platform.create({ data: { name: pid, image: "" } });
        }
        platId = plat.id;
      }
      platformIds.push(platId);
    }
    // Ensure all genres exist, create if not
    const genreIds = [];
    for (const gid of genresSelected || []) {
      let genreId = parseInt(gid, 10);
      let genre = await prisma.genre.findUnique({ where: { id: genreId } });
      if (!genre) {
        genre = await prisma.genre.findUnique({ where: { name: gid } });
        if (!genre) {
          genre = await prisma.genre.create({ data: { name: gid } });
        }
        genreId = genre.id;
      }
      genreIds.push(genreId);
    }
    // Ensure all cast members exist, create if not, and collect cast-role pairs
    const castRolePairs = [];
    for (const cr of castRoles) {
      let castId = parseInt(cr.castId, 10);
      let cast = await prisma.cast.findUnique({ where: { id: castId } });
      if (!cast) {
        // Try to find by name if castId is a name (for new entries from UI)
        cast = await prisma.cast.findUnique({ where: { name: cr.castId } });
        if (!cast) {
          cast = await prisma.cast.create({ data: { name: cr.castId, birthday: new Date(2000,0,1), profileUrl: "" } });
        }
        castId = cast.id;
      }
      castRolePairs.push({ castId, role: cr.role });
    }
    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        posterUrl,
        bannerUrl,
        visibility,
        genres: {
          connect: genreIds.map(id => ({ id }))
        },
        publishers: {
          connect: publisherIds.map(id => ({ id }))
        },
        studios: {
          connect: studioIds.map(id => ({ id }))
        },
        platforms: {
          connect: platformIds.map(id => ({ id }))
        }
        // do not create movieCasts here
      },
      include: {
        genres: true,
        publishers: true,
        studios: true,
        platforms: true
      }
    });
    // Now create movieCasts bridge table entries
    for (const cr of castRolePairs) {
      await prisma.movieCast.create({
        data: {
          movieId: movie.id,
          castId: cr.castId,
          role: cr.role
        }
      });
    }
    return new Response(JSON.stringify({ movie }), { status: 201 });
  } catch (e) {
    console.error("Prisma error:", e);
    return new Response(JSON.stringify({ error: "Failed to add movie", details: e.message }), { status: 500 });
  }
}
