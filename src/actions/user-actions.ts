"use server";

import { dbConnect } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";

export async function getUserData(username: string) {
  await dbConnect();

  const userData = await UserModel.find({ username: username });

}
