import { IPost } from "@/models/post.model";
import mongoose from "mongoose";

export type IPostStringified = Omit<
  IPost,
  "likes" | "saved" | "tagged" | "comments"
> & {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    username: string;
    account_Type: "PUBLIC" | "PRIVATE" | "BUSINESS";
    avatar: {
      secure_url: string;
      asset_id: string;
      blur_url: string;
      public_id: string;
    };
  };
  likes: string[];
  saved: string[];
  tagged: string[];
  comments: {
    parentId: string;
    children: string[];
    content: string;
  }[];
};

export type PostExplorerType = {
  post_Type: string;
  media: {
    secure_url: string;
    asset_id: string;
    blur_url: string;
    public_id: string;
  };
  createdAt: Date;
};

export type ProfilePostsType = {
  message: string | null;
  userInfo: {
    account_Type: "PRIVATE" | "PUBLIC";
    isFollower: boolean;
    isCurrentUser: boolean;
    isPublic: boolean;
    _id: string;
  };
  posts: {
    _id: string;
    media: {
      asset_id: string;
      blur_url: string;
      secure_url: string;
      public_id: string;
      _id: string;
    };
  }[];
}[];

export type InfiniteProfilePostsType = ProfilePostsType[0]["posts"];

export type ObjectType = mongoose.Types.ObjectId;

export type UserCardType = {
  bio: string;
  avatar: { asset_id: string; secure_url: string; blur_url: string };
  name: string;
  username: string;
  email: string;
  followersCount: number;
  followingsCount: number;
  mediaCount: number;
  account_Type: "PRIVATE" | "PUBLIC";
  isFollowing: boolean;
  hasRequested: boolean;
};

export type PostReactionType = { user_id: string; post_id: string };

export type SearchedUser = {
  avatar: { secure_url: string; asset_id: string; blur_url: string };
  username: string;
  _id: string;
}[];

export type NotificationInfoType = {
  _id: string;
  requestType: "follow";
  status: "pending" | "accepted" | "rejected";
  sender: string;
  receiver: string;
  createdAt: Date;
  updatedAt: Date;
  senderInfo: {
    email: string;
    username: string;
    account_Type: "PUBLIC";
    avatar: { secure_url: string; asset_id: string };
    isFollowing: boolean;
    isRequested: boolean;
  };
}[];

export type Member = {
  _id: string;
  name: string;
  avatar: { secure_url: string };
};

export type Message = {
  type: "sender" | "receiver";
  message: string;
} & ({ type: "sender" } | { type: "receiver"; senderName: string });
