import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { hash } from "bcryptjs";

import { dbConnect } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";
import { getErrorMessage } from "@/helpers/errorMessageHandler";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          const user = await UserModel.findOne({
            email: credentials?.email,
          }).select("+password");

          if (!user) {
            throw new Error("User not found");
          }

          const isValidPassword = await hash(
            credentials?.password,
            user.password,
          );

          if (isValidPassword) {
            return {
              _id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          } else {
            throw new Error("Incorrect password");
          }
        } catch (error: unknown) {
          console.error(getErrorMessage(error));
          throw new Error("Internal Auth Error");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id as string;
        token.email = user.email as string;
        token.username = user.username as string;
        token.name = user.name as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  jwt: { secret: process.env.NEXTAUTH_SECRET },
};
