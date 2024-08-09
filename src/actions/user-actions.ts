"use server";

import { serverSession } from "@/hooks/useServerSession";
import { getBlurImage } from "@/lib/blur-image";
import { dbConnect } from "@/lib/dbConnection";
import { RequestModel } from "@/models/request.model";
import { UserModel } from "@/models/user.model";
import { UploadImage } from "@/services/cloudinary";
import { ObjectType, SearchedUser } from "@/types/types";
import mongoose from "mongoose";
import { createOrRetrieveChat } from "./chat-actions";

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

export async function getSearchedUsers(
  searchUsers: string,
  excludeUsers: string[] = [],
): Promise<SearchedUser> {
  const regex = new RegExp(searchUsers, "i");
  await dbConnect();
  const session = await serverSession();
  if (!session || !session.user) return [];
  if (!excludeUsers.some((m) => m === session.user._id)) {
    excludeUsers.push(session.user._id);
  }

  const excludeUserIds = excludeUsers.map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  const results = await UserModel.find({
    name: { $regex: regex },
    _id: { $nin: excludeUserIds },
  }).select("avatar username");

  return results.length ? JSON.parse(JSON.stringify(results)) : [];
}

export async function followUser({
  account_Type,
  currentUserId,
  userId,
}: {
  account_Type: "PRIVATE" | "PUBLIC";
  currentUserId: string;
  userId: string;
}): Promise<{
  isFollowing: boolean;
  isRequested: boolean;
  status: any;
}> {
  await dbConnect();
  const newCurrentUserID = new mongoose.Types.ObjectId(currentUserId);
  const userToFollow = new mongoose.Types.ObjectId(userId);

  if (account_Type === "PRIVATE") {
    let request = await RequestModel.findOneAndUpdate(
      {
        requestType: "follow",
        sender: newCurrentUserID,
        receiver: userToFollow,
      },
      { status: "pending" },
      { new: true },
    );

    if (!request) {
      request = await RequestModel.create({
        requestType: "follow",
        status: "pending",
        sender: newCurrentUserID,
        receiver: userToFollow,
      });
    }

    return {
      isFollowing: false,
      isRequested: true,
      status: request.status,
    };
  }

  if (account_Type === "PUBLIC") {
    const [currentUserRequest, currentUserFollowing] = await Promise.all([
      UserModel.findByIdAndUpdate(
        userToFollow,
        { $addToSet: { followers: currentUserId } },
        { new: true, projection: { followers: 1 } },
      ),
      UserModel.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { followings: userToFollow } },
        { new: true, projection: { followings: 1 } },
      ),
    ]);

    if (!currentUserRequest || !currentUserFollowing) {
      return {
        isFollowing: false,
        isRequested: false,
        status: null,
      };
    }

    let request = await RequestModel.findOneAndUpdate(
      {
        requestType: "follow",
        sender: newCurrentUserID,
        receiver: userToFollow,
      },
      { status: "accepted" },
      { new: true },
    );

    if (!request) {
      request = await RequestModel.create({
        requestType: "follow",
        status: "accepted",
        sender: newCurrentUserID,
        receiver: userToFollow,
      });
    }

    await createOrRetrieveChat({
      userId1: currentUserId,
      userId2: userId,
    });

    return {
      isFollowing: true,
      isRequested: true,
      status: request.status,
    };
  }

  return { isFollowing: false, isRequested: false, status: null };
}

export async function unfollowUser({
  currentUserId,
  userId,
}: {
  currentUserId: string;
  userId: string;
}): Promise<{
  isFollowing: boolean;
  message: string;
}> {
  await dbConnect();
  const newCurrentUserID = new mongoose.Types.ObjectId(currentUserId);
  const userToUnfollow = new mongoose.Types.ObjectId(userId);

  const [currentUserUpdate, userToUnfollowUpdate, requestDelete] =
    await Promise.all([
      UserModel.findByIdAndUpdate(
        newCurrentUserID,
        { $pull: { followings: userToUnfollow } },
        { new: true },
      ),
      UserModel.findByIdAndUpdate(
        userToUnfollow,
        { $pull: { followers: newCurrentUserID } },
        { new: true },
      ),
      RequestModel.findOneAndDelete({
        requestType: "follow",
        sender: newCurrentUserID,
        receiver: userToUnfollow,
      }),
    ]);

  if (!currentUserUpdate || !userToUnfollowUpdate || !requestDelete) {
    return {
      isFollowing: true,
      message: "Failed to unfollow the user.",
    };
  }

  return {
    isFollowing: false,
    message: "Successfully unfollowed the user and deleted the follow request.",
  };
}

export async function acceptRequest({
  currentUserId,
  userId,
}: {
  currentUserId: string;
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  status: "pending" | "accepted" | "rejected";
}> {
  await dbConnect();
  const newCurrentUserID = new mongoose.Types.ObjectId(currentUserId);
  const requestorID = new mongoose.Types.ObjectId(userId);

  const request = await RequestModel.findOneAndUpdate(
    {
      requestType: "follow",
      sender: requestorID,
      receiver: newCurrentUserID,
      status: "pending",
    },
    { status: "accepted" },
    { new: true },
  );

  if (!request) {
    return {
      status: "pending",
      success: false,
      message: "No pending follow request found or already accepted/rejected.",
    };
  }

  const [currentUserUpdate, requestorUpdate] = await Promise.all([
    UserModel.findByIdAndUpdate(
      newCurrentUserID,
      { $addToSet: { followers: requestorID } },
      { new: true },
    ),
    UserModel.findByIdAndUpdate(
      requestorID,
      { $addToSet: { followings: newCurrentUserID } },
      { new: true },
    ),
  ]);

  if (!currentUserUpdate || !requestorUpdate) {
    return {
      status: request.status,
      success: false,
      message: "Failed to accept the follow request.",
    };
  }

  await createOrRetrieveChat({
    userId1: currentUserId,
    userId2: userId,
  });

  return {
    status: request.status,
    success: true,
    message: "Follow request accepted successfully.",
  };
}

export async function rejectRequest({
  currentUserId,
  userId,
}: {
  currentUserId: string;
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  status: "pending" | "accepted" | "rejected";
}> {
  await dbConnect();
  const newCurrentUserID = new mongoose.Types.ObjectId(currentUserId);
  const requestorID = new mongoose.Types.ObjectId(userId);

  const request = await RequestModel.findOneAndUpdate(
    {
      requestType: "follow",
      sender: requestorID,
      receiver: newCurrentUserID,
      status: "pending",
    },
    { status: "rejected" },
    { new: true },
  );

  if (!request) {
    return {
      status: request.status,
      success: false,
      message: "No pending follow request found or already accepted/rejected.",
    };
  }

  return {
    status: request.status,
    success: true,
    message: "Follow request rejected successfully.",
  };
}

export async function cancelRequest({
  currentUserId,
  userId,
}: {
  currentUserId: string;
  userId: string;
}): Promise<{
  isFollowing: boolean;
  isRequested: boolean;
  message: string;
}> {
  await dbConnect();
  const newCurrentUserID = new mongoose.Types.ObjectId(currentUserId);
  const requestorID = new mongoose.Types.ObjectId(userId);

  const request = await RequestModel.findOneAndDelete({
    requestType: "follow",
    sender: newCurrentUserID,
    receiver: requestorID,
    status: "pending",
  });

  if (!request) {
    return {
      isFollowing: false,
      isRequested: true,
      message: "No pending follow request found or already accepted/rejected.",
    };
  }

  return {
    isFollowing: false,
    isRequested: false,
    message: "Follow request cancelled successfully.",
  };
}
