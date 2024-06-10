"use server";

import { hash } from "bcryptjs";

import { getErrorMessage } from "@/helpers/errorMessageHandler";
import { dbConnect } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";
import { SignUpSchemaType } from "@/schemas";

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
