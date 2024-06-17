"use server";

import mongoose from "mongoose";

import { getErrorMessage } from "@/helpers/errorMessageHandler";
import { serverSession } from "@/hooks/useServerSession";
import {
  postExploreAggregate,
  postHomeAggregate,
  profilePostAggregate,
} from "@/lib/aggregates";
import { getBlurImage } from "@/lib/blur-image";
import { dbConnect } from "@/lib/dbConnection";
import { PostModel } from "@/models/post.model";
import { UserModel } from "@/models/user.model";
import { UploadImage } from "@/services/cloudinary";
import {
  IPostStringified,
  PostExplorerType,
  ProfilePostsType,
} from "@/types/types";

export async function createPostAction(formData: FormData) {
  try {
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

    const user = await UserModel.findById(session?.user._id);
    if (!user)
      return {
        ok: false,
        success: false,
        status: 403,
        error: "Unauthorized",
        message: "",
      };

    const caption = formData.get("caption") as unknown as string;
    const hashTags = formData.getAll("hashTags") as unknown as string[];
    const location = formData.get("location") as unknown as string;
    const isCommentOn = formData.get("isCommentOn") as unknown as boolean;
    const isLikesAndCommentVisible = formData.get(
      "isLikesAndCommentVisible",
    ) as unknown as boolean;
    const clientMedia = formData.getAll("media") as unknown as File[];

    let media:
      | {
          asset_id: string;
          public_id: string;
          secure_url: string;
          blur_url?: string;
        }[]
      | [] = [];

    if (clientMedia.length) {
      const mediaArr = clientMedia.map((e) => UploadImage(e, "POST"));
      const mediaRes = (await Promise.all(mediaArr)) as any;

      const blurUrlPromises = await Promise.all(
        mediaRes.map((e: { secure_url: string }) => getBlurImage(e.secure_url)),
      );

      media = mediaRes.map(
        (
          e: {
            asset_id: string;
            public_id: string;
            secure_url: string;
          },
          i: number,
        ) => ({
          asset_id: e.asset_id,
          public_id: e.public_id,
          secure_url: e.secure_url,
          blur_url: blurUrlPromises[i].base64,
        }),
      );
    }

    const result = await PostModel.create({
      post_Type: "POST",
      caption,
      hashTags,
      location,
      isCommentOn,
      isLikesAndCommentVisible,
      media,
    });

    if (result) {
      user.posts.push(result._id);
      await user.save();

      return {
        ok: true,
        success: true,
        status: 301,
        message: "Post created successfully",
        error: "",
        data: (result._id as mongoose.Types.ObjectId).toString(),
      };
    }

    return {
      ok: false,
      success: false,
      status: 404,
      message: "",
      error: "Unable to update user | Something went wrong",
    };
  } catch (error: unknown) {
    return {
      ok: false,
      success: false,
      status: 500,
      message: "",
      error: getErrorMessage(error),
    };
  }
}

export async function fetchMoreHomePosts({
  page = 1,
}: {
  page?: number;
}): Promise<IPostStringified[] | []> {
  await dbConnect();

  const session = await serverSession();
  if (!session?.user._id) return [];

  const user = await UserModel.findById(session?.user._id);
  if (!user) return [];

  const posts = await PostModel.aggregate(
    postHomeAggregate(page, 3, new mongoose.Types.ObjectId(session?.user._id)),
  );

  return posts.length ? JSON.parse(JSON.stringify(posts)) : [];
}

export async function fetchMoreExplorePosts({
  page = 1,
}: {
  page?: number;
}): Promise<PostExplorerType[] | []> {
  await dbConnect();

  const session = await serverSession();
  if (!session?.user._id) return [];

  const user = await UserModel.findById(session?.user._id);
  if (!user) return [];

  // TODO: In sorting the data is changing random everytime without refresh
  const posts = await PostModel.aggregate(postExploreAggregate(page, 12));
  // .sort(() => Math.random() - 0.5);

  return posts.length ? JSON.parse(JSON.stringify(posts)) : [];
}

export async function fetchMoreProfilePosts({
  page = 1,
  userId,
}: {
  userId: string;
  page?: number;
}): Promise<ProfilePostsType[] | []> {
  await dbConnect();

  const session = await serverSession();
  if (!session?.user._id) return [];

  const user = await UserModel.findById(session?.user._id);
  if (!user) return [];

  const posts = await PostModel.aggregate(
    profilePostAggregate(page, 16, userId),
  );

  return posts.length ? JSON.parse(JSON.stringify(posts)) : [];
}
