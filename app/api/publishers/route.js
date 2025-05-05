import prisma from "@/lib/prisma";

export async function GET() {
  const publishers = await prisma.publisher.findMany();
  return new Response(JSON.stringify(publishers), { status: 200 });
}

export async function POST(req) {
  const { name, pictureUrl } = await req.json();
  if (!name) return new Response(JSON.stringify({ error: "Name required" }), { status: 400 });
  const publisher = await prisma.publisher.create({ data: { name, pictureUrl } });
  return new Response(JSON.stringify(publisher), { status: 201 });
}
