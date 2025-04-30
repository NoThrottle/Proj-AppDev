// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const password1 = await bcrypt.hash("password123", 10);
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

  // Create movies
  await prisma.movie.createMany({
    data: [
      {
        title:       "Die Hard",
        description: "An action movie about a cop saving hostages.",
        watched:     true,
        rating:      5,
        genreId:     actionGenre.id,
        userId:      user1.id,
      },
      {
        title:       "The Hangover",
        description: "Three friends lose their buddy on a crazy night out.",
        watched:     false,
        rating:      4,
        genreId:     comedyGenre.id,
        userId:      user1.id,
      },
      {
        title:       "The Shawshank Redemption",
        description: "A drama about hope and friendship in prison.",
        watched:     true,
        rating:      5,
        genreId:     dramaGenre.id,
        userId:      user2.id,
      },
    ],
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