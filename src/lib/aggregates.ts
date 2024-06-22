import mongoose, { PipelineStage, Types } from "mongoose";

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
            avatar: 1,
            followers: { $ifNull: ["$followers", []] },
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
          if: {
            $or: [
              { $eq: ["$user.account_Type", "PUBLIC"] },
              { $eq: ["$user._id", currentUserId] },
            ],
          },
          then: true,
          else: { $in: [currentUserId, "$user.followers"] },
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
        avatar: 1,
        account_Type: 1,
      },
    },
  },
];

// TODO: post_Type must be POST | REEL and also make the change in the infinite scroll page it takes only the Image later it must take video as well post_Type is pasted in the aggregate result

export const postExploreAggregate = (
  page: number,
  limit: number,
  currentUserId: Types.ObjectId,
): PipelineStage[] => [
  {
    $match: {
      post_Type: "POST",
      isArchived: false,
      media: { $exists: true, $ne: [] },
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
            account_Type: 1,
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
    $match: {
      "user.account_Type": "PUBLIC",
      "user._id": { $ne: currentUserId },
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

export const profilePostAggregate = (
  page: number,
  limit: number,
  username: string,
  currentUserId: mongoose.Types.ObjectId,
): PipelineStage[] => [
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "posts",
      as: "userPosts",
    },
  },
  {
    $unwind: "$userPosts",
  },
  {
    $match: {
      "userPosts.username": username,
      isArchived: false,
      post_Type: { $in: ["POST", "REEL"] },
    },
  },
  {
    $addFields: {
      isCurrentUser: {
        $eq: ["$userPosts._id", currentUserId],
      },
      isFollower: {
        $in: [
          currentUserId,
          {
            $ifNull: ["$userPosts.followers", []],
          },
        ],
      },
      isPublic: {
        $eq: ["$userPosts.account_Type", "PUBLIC"],
      },
    },
  },
  {
    $facet: {
      posts: [
        {
          $match: {
            $or: [
              { isCurrentUser: true },
              { isPublic: true },
              { isFollower: true },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            media: {
              $arrayElemAt: ["$media", 0],
            },
          },
        },
      ],
      userInfo: [
        {
          $project: {
            account_Type: "$userPosts.account_Type",
            isCurrentUser: 1,
            isFollower: 1,
            isPublic: 1,
          },
        },
      ],
    },
  },
  {
    $addFields: {
      message: {
        $cond: [
          { $eq: [{ $size: "$userInfo" }, 0] },
          "Posts not found",
          {
            $cond: [
              {
                $and: [
                  {
                    $eq: [
                      {
                        $arrayElemAt: ["$userInfo.account_Type", 0],
                      },
                      "PRIVATE",
                    ],
                  },
                  {
                    $ne: [
                      {
                        $arrayElemAt: ["$userInfo.isCurrentUser", 0],
                      },
                      true,
                    ],
                  },
                  {
                    $ne: [
                      {
                        $arrayElemAt: ["$userInfo.isFollower", 0],
                      },
                      true,
                    ],
                  },
                ],
              },
              "Account is private",
              {
                $cond: [
                  {
                    $eq: [{ $size: "$posts" }, 0],
                  },
                  {
                    $cond: [
                      {
                        $eq: [
                          {
                            $arrayElemAt: ["$userInfo.account_Type", 0],
                          },
                          "PUBLIC",
                        ],
                      },
                      "User hasn't posted yet",
                      {
                        $cond: [
                          {
                            $or: [
                              {
                                $arrayElemAt: ["$userInfo.isCurrentUser", 0],
                              },
                              {
                                $arrayElemAt: ["$userInfo.isFollower", 0],
                              },
                            ],
                          },
                          "User hasn't posted yet",
                          "Account is private",
                        ],
                      },
                    ],
                  },
                  null,
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    $project: {
      posts: 1,
      userInfo: {
        $arrayElemAt: ["$userInfo", 0],
      },
      message: 1,
    },
  },
];

export const profileData = (username: string) => [
  {
    $match: {
      username,
    },
  },
  {
    $project: {
      bio: 1,
      avatar: 1,
      name: 1,
      username: 1,
      email: 1,
      followersCount: {
        $size: { $ifNull: ["$followers", []] },
      },
      followingsCount: {
        $size: { $ifNull: ["$followings", []] },
      },
      posts: 1,
    },
  },
  {
    $lookup: {
      from: "posts",
      localField: "posts",
      foreignField: "_id",
      as: "posts",
    },
  },
  {
    $unwind: {
      path: "$posts",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      postMediaCount: {
        $size: { $ifNull: ["$posts.media", []] },
      },
    },
  },
  {
    $group: {
      _id: "$_id",
      bio: { $first: "$bio" },
      avatar: { $first: "$avatar" },
      name: { $first: "$name" },
      email: { $first: "$email" },
      username: { $first: "$username" },
      followersCount: {
        $first: "$followersCount",
      },
      followingsCount: {
        $first: "$followingsCount",
      },
      mediaCount: { $sum: "$postMediaCount" },
    },
  },
  {
    $project: {
      _id: 0,
      bio: 1,
      avatar: 1,
      name: 1,
      email: 1,
      username: 1,
      followersCount: 1,
      followingsCount: 1,
      mediaCount: 1,
    },
  },
];
