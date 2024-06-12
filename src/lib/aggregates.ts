import { PipelineStage } from "mongoose";
import { Types } from "mongoose";

export const postHomeAggregate = (
  page: number,
  limit: number,
  currentUserId: Types.ObjectId,
): PipelineStage[] => [
  {
    $match: {
      post_Type: "POST",
      isArchived: false,
    },
  },
  {
    $lookup: {
      from: "users",
      let: { postId: "$_id" },
      pipeline: [
        { $match: { $expr: { $in: ["$$postId", "$posts"] } } },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            username: 1,
            account_Type: 1,
            followers: 1,
          },
        },
      ],
      as: "user",
    },
  },
  {
    $unwind: "$user",
  },
  {
    $addFields: {
      isCurrentUserFollowing: {
        $cond: {
          if: { $eq: ["$user.account_Type", "PRIVATE"] },
          then: { $in: [currentUserId, "$user.followers"] },
          else: true,
        },
      },
    },
  },
  {
    $match: {
      isCurrentUserFollowing: true,
    },
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
      user: {
        _id: 1,
        name: 1,
        email: 1,
        username: 1,
        account_Type: 1,
      },
    },
  },
];

// TODO: post_Type must be POST | REEL and also make the change in the infinite scroll page it takes only the Image later it must take video as well post_Type is pasted in the aggregate result
export const postExploreAggregate = (
  page: number,
  limit: number,
): PipelineStage[] => [
  {
    $match: {
      post_Type: "POST",
      isArchived: false,
      media: { $exists: true, $ne: [] },
    },
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
      media: { $arrayElemAt: ["$media", 0] },
      createdAt: 1,
    },
  },
];
