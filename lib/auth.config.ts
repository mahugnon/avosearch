import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma/bcrypt imports): shared by the proxy and the
// full NextAuth instance in lib/auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role ?? "CLIENT";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
