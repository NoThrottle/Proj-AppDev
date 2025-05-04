// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.watchlistEntry.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const password1 = await bcrypt.hash("123", 10);
  const password2 = await bcrypt.hash("password456", 10);

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name:     "Alex",
      email:    "alex@gmail.com",
      password: password1,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name:     "Jane Smith",
      email:    "jane@example.com",
      password: password2,
    },
  });

  // Create genres
  const [actionGenre, comedyGenre, dramaGenre] = await Promise.all([
    prisma.genre.create({ data: { name: "Action"  } }),
    prisma.genre.create({ data: { name: "Comedy"  } }),
    prisma.genre.create({ data: { name: "Drama"   } }),
  ]);

  // Create watchlists for users
  const watchlist1 = await prisma.watchlist.create({
    data: {
      userId: user1.id,
      name: "Alex's Favorites",
      description: "My favorite movies.",
      tintColor: "#ff0000",
    },
  });
  const watchlist2 = await prisma.watchlist.create({
    data: {
      userId: user2.id,
      name: "Jane's Watchlist",
      description: "Jane's must-watch list.",
      tintColor: "#00aaff",
    },
  });

  // Create movies and add to watchlists
  const movie1 = await prisma.movie.create({
    data: {
      title: "Die Hard",
      description: "An action movie about a cop saving hostages.",
      genres: { connect: { id: actionGenre.id } },
    },
  });
  const movie2 = await prisma.movie.create({
    data: {
      title: "The Hangover",
      description: "Three friends lose their buddy on a crazy night out.",
      genres: { connect: { id: comedyGenre.id } },
    },
  });
  const movie3 = await prisma.movie.create({
    data: {
      title: "The Shawshank Redemption",
      description: "A drama about hope and friendship in prison.",
      genres: { connect: { id: dramaGenre.id } },
    },
  });

  // Add movies to watchlists (WatchlistEntry)
  await prisma.watchlistEntry.create({
    data: {
      userId: user1.id,
      watchlistId: watchlist1.id,
      movieId: movie1.id,
      rank: 1,
    },
  });
  await prisma.watchlistEntry.create({
    data: {
      userId: user1.id,
      watchlistId: watchlist1.id,
      movieId: movie2.id,
      rank: 2,
    },
  });
  await prisma.watchlistEntry.create({
    data: {
      userId: user2.id,
      watchlistId: watchlist2.id,
      movieId: movie3.id,
      rank: 1,
    },
  });

  console.log("✅ Seed data inserted successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });