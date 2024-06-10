import { PipelineStage } from "mongoose";

export const postAggregate = (page: number, limit: number): PipelineStage[] => [
  {
    $lookup: {
      from: "users",
      let: { postId: "$_id" },
      pipeline: [
        { $match: { $expr: { $in: ["$$postId", "$posts"] } } },
        {
          $project: { _id: 1, name: 1, email: 1, username: 1, account_Type: 1 },
        },
      ],
      as: "user",
    },
  },
  {
    $unwind: "$user",
  },
  {
    $sort: {
      createdAt: -1,
    },
  },
  {
    $skip: (page - 1) * limit,
  },
  {
    $limit: limit,
  },
  {
    $project: {
      post_Type: 1,
      caption: 1,
      location: 1,
      media: 1,
      hashTags: 1,
      likes: 1,
      saved: 1,
      tagged: 1,
      isCommentOn: 1,
      isLikesAndCommentVisible: 1,
      comments: 1,
      expiryTime: 1,
      isArchived: 1,
      createdAt: 1,
      updatedAt: 1,
      user: 1,
    },
  },
];
