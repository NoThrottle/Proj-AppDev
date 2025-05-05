import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) {
      // No valid session, redirect to login (logs out client)
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Optionally, you could check if the user exists in the DB here
    return NextResponse.next();
  } catch (err) {
    // On any error, force logout by redirecting to login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/movies/:path*",
    "/watchlist/:path*",
    "/leaderboards",
    "/admin/:path*"
  ],
};