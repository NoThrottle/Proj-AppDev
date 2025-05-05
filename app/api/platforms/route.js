import prisma from "@/lib/prisma";

export async function GET() {
  const platforms = await prisma.platform.findMany();
  return new Response(JSON.stringify(platforms), { status: 200 });
}

export async function POST(req) {
  const { name, image } = await req.json();
  if (!name) return new Response(JSON.stringify({ error: "Name required" }), { status: 400 });
  const platform = await prisma.platform.create({ data: { name, image } });
  return new Response(JSON.stringify(platform), { status: 201 });
}
