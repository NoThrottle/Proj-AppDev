import prisma from "@/lib/prisma";

export async function GET() {
  const cast = await prisma.cast.findMany();
  return new Response(JSON.stringify(cast), { status: 200 });
}

export async function POST(req) {
  const { name, birthday, profileUrl } = await req.json();
  if (!name) return new Response(JSON.stringify({ error: "Name required" }), { status: 400 });
  // Only include birthday if it is a valid ISO string
  const data = { name, profileUrl };
  if (birthday && /^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    // Convert to ISO string with time for Prisma DateTime
    data.birthday = new Date(birthday).toISOString();
  } else if (birthday) {
    return new Response(JSON.stringify({ error: "Invalid birthday format. Use YYYY-MM-DD." }), { status: 400 });
  }
  const castMember = await prisma.cast.create({ data });
  return new Response(JSON.stringify(castMember), { status: 201 });
}
