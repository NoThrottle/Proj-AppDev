import prisma from "@/lib/prisma";

export async function GET() {
  const studios = await prisma.studio.findMany();
  return new Response(JSON.stringify(studios), { status: 200 });
}

export async function POST(req) {
  const { name, pictureUrl } = await req.json();
  if (!name) return new Response(JSON.stringify({ error: "Name required" }), { status: 400 });
  const studio = await prisma.studio.create({ data: { name, pictureUrl } });
  return new Response(JSON.stringify(studio), { status: 201 });
}
