import { IPost } from "@/models/post.model";

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
    _id: string;
    media: {
      secure_url: string;
      blur_url: string;
      asset_id: string;
      _id: string;
    };
  };