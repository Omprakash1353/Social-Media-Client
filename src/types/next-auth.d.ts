import "next-auth";
import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      email?: string;
      name?: string;
      username?: string;
      avatar?: { secure_url: string };
      role?: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    _id?: string;
    email?: string;
    name?: string;
    username?: string;
    avatar?: { secure_url: string };
    role?: "USER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    email?: string;
    name?: string;
    username?: string;
    avatar?: { secure_url: string };
    role?: "USER" | "ADMIN";
  }
}
