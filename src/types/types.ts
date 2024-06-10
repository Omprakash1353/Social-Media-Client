import { IPost } from "@/models/post.model";

export type IPostStringified = Omit<
  IPost,
  "likes" | "saved" | "tagged" | "comments"
> & {
  _id: string;
  user: {
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
