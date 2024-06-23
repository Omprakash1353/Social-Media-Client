"use server";

import { serverSession } from "@/hooks/useServerSession";
import { profileData } from "@/lib/aggregates";
import { getBlurImage } from "@/lib/blur-image";
import { dbConnect } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";
import { UploadImage } from "@/services/cloudinary";
import { ObjectType, SearchedUser, UserCardType } from "@/types/types";

export async function changeUserAccountType(e: boolean): Promise<{
  _id: string | ObjectType;
  account_Type: "PUBLIC" | "PRIVATE";
}> {
  await dbConnect();

  const session = await serverSession();

  const user = await UserModel.findByIdAndUpdate(
    session?.user._id,
    {
      account_Type: e ? "PRIVATE" : "PUBLIC",
    },
    { new: true },
  ).select("account_Type");

  return JSON.parse(JSON.stringify(user));
}

// TODO: delete the old avatar whenever user changes the avatar
export async function editUserData(formData: FormData) {
  await dbConnect();

  const session = await serverSession();
  if (!session?.user._id)
    return {
      ok: false,
      success: false,
      status: 403,
      error: "Unauthorized",
      message: "",
    };

  const checkUser = await UserModel.findById(session?.user._id);
  if (!checkUser)
    return {
      ok: false,
      success: false,
      status: 403,
      error: "Unauthorized",
      message: "",
    };

  const username = formData.get("username") as unknown as string | null;
  const bio = formData.get("bio") as unknown as string | null;
  const gender = formData.get("gender") as unknown as
    | ("MALE" | "FEMALE")
    | null;
  const file = formData.get("avatar") as unknown as File | null;

  let user: Record<string, unknown> = {};
  if (username) user.username = username;
  if (bio) user.bio = bio;
  if (gender) user.gender = gender;
  if (file) {
    const avatarRes = (await UploadImage(file, "AVATAR")) as any;
    const blurUrl = await getBlurImage(avatarRes.secure_url);

    let avatar = {
      asset_id: avatarRes.asset_id,
      public_id: avatarRes.public_id,
      secure_url: avatarRes.secure_url,
      blur_url: blurUrl.base64,
    };

    user.avatar = avatar;
  }

  await UserModel.findByIdAndUpdate(session.user._id, user);

  return {
    ok: true,
    success: true,
    error: "",
    status: 200,
    message: "User Data updated successfully",
  };
}

export async function getSearchedUsers(searchUsers: string): Promise<SearchedUser> {
  const regex = new RegExp(searchUsers, "i");
  await dbConnect();
  const results = await UserModel.find({ name: { $regex: regex } }).select(
    "avatar username",
  );
  return results.length ? JSON.parse(JSON.stringify(results)) : [];
}

// export async function getUserData(username: string): Promise<UserCardType> {
//   await dbConnect();
//   const userData = await UserModel.aggregate(profileData(username));
//   if (!userData.length) throw new Error("Invalid userid");
//   return JSON.parse(JSON.stringify(userData[0]));
// }
