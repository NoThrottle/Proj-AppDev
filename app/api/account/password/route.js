import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return new Response(JSON.stringify({ error: "Both current password and new password are required" }), { status: 400 });
  }

  try {
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.password) {
      return new Response(JSON.stringify({ error: "User not found or no password set (OAuth user)" }), { status: 400 });
    }

    // Verify the current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Current password is incorrect" }), { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Password change error:", error);
    return new Response(JSON.stringify({ error: "Failed to change password" }), { status: 500 });
  }
}