import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Wrap the PrismaAdapter to coerce id to number for getUser
function FixedPrismaAdapter(prisma) {
  const adapter = PrismaAdapter(prisma);
  return {
    ...adapter,
    async getUser(id) {
      return adapter.getUser(Number(id));
    },
  };
}

// Create NextAuth options
export const authOptions = {
  adapter: FixedPrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login?error" },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always redirect to home after login
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = typeof user.id === "string" ? Number(user.id) : user.id;
        token.email = user.email;
        token.admin = user.admin;
        token.image = user.image; // Ensure image is included in token
        // Add provider information to identify auth method
        if (account) {
          token.provider = account.provider;
        } else if (user.password) {
          token.provider = "credentials";
        } else if (user.email?.includes("@gmail.com")) {
          token.provider = "google";
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = typeof token.id === "string" ? Number(token.id) : token.id;
      session.user.email = token.email;
      session.user.admin = token.admin;
      session.user.image = token.image; // Ensure image is included in session
      session.user.provider = token.provider; // Add provider to session
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };