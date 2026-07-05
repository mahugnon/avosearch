import type { DefaultSession } from "next-auth";
// Required so the "next-auth/jwt" module augmentation below is applied
import type {} from "next-auth/jwt";

export type AppRole = "CLIENT" | "BARRISTER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
  }
}
