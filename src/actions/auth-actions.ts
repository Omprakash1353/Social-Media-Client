"use server";

import { hash } from "bcryptjs";

import { getErrorMessage } from "@/helpers/errorMessageHandler";
import { dbConnect } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";
import { SignUpSchemaType } from "@/schemas";
import { cookies } from "next/headers";

export async function signUpAction({
  email,
  name,
  password,
}: SignUpSchemaType) {
  try {
    await dbConnect();
    const user = await UserModel.findOne({ $or: [{ email }, { name }] });
    if (user) return { ok: false, error: "User already exists" };

    const hashedPassword = await hash(password, 10);
    const newUser = await UserModel.create({
      email,
      username: name,
      name,
      password: hashedPassword,
    });

    return { ok: true, error: null, message: "User created successfully" };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    return {
      ok: false,
      error:
        typeof errorMessage === "string"
          ? errorMessage
          : "Internal action error",
    };
  }
}

export async function setCookie(originalString: string) {
  const parts = originalString.split(";");
  const cookieValue = parts[0].split("=")[1];
  const maxAge = parts[1].split("=")[1];
  const path = parts[2].split("=")[1];
  const expires = parts[3].split("=")[1];
  const httpOnly = parts[4].trim() === "HttpOnly";
  const secure = parts[5].trim() === "Secure";
  const sameSite = parts[6].split("=")[1];

  cookies().set("social-chat-token", cookieValue, {
    maxAge: parseInt(maxAge),
    path: "/",
    expires: new Date(expires),
    httpOnly,
    secure,
    sameSite: "none",
  });
}
