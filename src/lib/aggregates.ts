import { PipelineStage, Types } from "mongoose";

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
    $skip: (page - 1) * limit < 0 ? 0 : (page - 1) * limit,
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

export const suggestBarAggregate = (
  userId: Types.ObjectId,
): PipelineStage[] => [
  {
    $match: {
      _id: { $ne: userId },
      followers: { $nin: [userId] },
    },
  },
  {
    $lookup: {
      from: "requests",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$sender", userId],
                },
                { $eq: ["$receiver", "$$userId"] },
                { $eq: ["$requestType", "follow"] },
              ],
            },
          },
        },
      ],
      as: "requests",
    },
  },
  {
    $addFields: {
      isFollowing: {
        $in: [userId, { $ifNull: ["$followers", []] }],
      },
      isRequested: {
        $gt: [{ $size: "$requests" }, 0],
      },
    },
  },
  {
    $project: {
      username: 1,
      email: 1,
      avatar: 1,
      account_Type: 1,
      isFollowing: 1,
      isRequested: 1,
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
  currentUserId: Types.ObjectId,
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

export const profileData = (
  username: string,
  currentUserId: Types.ObjectId,
): PipelineStage[] => [
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
      account_Type: 1,
      followers: 1,
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
      account_Type: { $first: "$account_Type" },
      followers: { $first: "$followers" },
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
    $lookup: {
      from: "requests",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$sender", currentUserId] },
                { $eq: ["$receiver", "$$userId"] },
                { $eq: ["$requestType", "follow"] },
                { $eq: ["$status", "pending"] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            status: 1,
          },
        },
      ],
      as: "followRequest",
    },
  },
  {
    $addFields: {
      isFollowing: {
        $in: [currentUserId, { $ifNull: ["$followers", []] }],
      },
      hasRequested: {
        $cond: {
          if: { $gt: [{ $size: "$followRequest" }, 0] },
          then: true,
          else: false,
        },
      },
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
      account_Type: 1,
      followersCount: 1,
      followingsCount: 1,
      mediaCount: 1,
      isFollowing: 1,
      hasRequested: 1,
    },
  },
];

export const notificationAggregate = (
  currentUserId: Types.ObjectId,
): PipelineStage[] => [
  {
    $match: {
      receiver: currentUserId,
      status: "pending",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "sender",
      foreignField: "_id",
      as: "senderInfo",
    },
  },
  {
    $unwind: "$senderInfo",
  },
  {
    $lookup: {
      from: "requests",
      let: { senderId: "$sender" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$sender", currentUserId],
                },
                { $eq: ["$receiver", "$$senderId"] },
                { $eq: ["$requestType", "follow"] },
              ],
            },
          },
        },
      ],
      as: "userRequests",
    },
  },
  {
    $addFields: {
      "senderInfo.isFollowing": {
        $in: [currentUserId, { $ifNull: ["$senderInfo.followers", []] }],
      },
      "senderInfo.isRequested": {
        $gt: [{ $size: "$userRequests" }, 0],
      },
    },
  },
  {
    $project: {
      _id: 1,
      sender: 1,
      receiver: 1,
      status: 1,
      requestType: 1,
      createdAt: 1,
      updatedAt: 1,
      "senderInfo.username": 1,
      "senderInfo.email": 1,
      "senderInfo.avatar": 1,
      "senderInfo.account_Type": 1,
      "senderInfo.isFollowing": 1,
      "senderInfo.isRequested": 1,
    },
  },
];

export const chatDetailsAggregate = (
  chatObjectId: Types.ObjectId,
  currentUserObjectId: Types.ObjectId,
): PipelineStage[] => [
  { $match: { _id: chatObjectId } },
  {
    $lookup: {
      from: "users",
      localField: "members",
      foreignField: "_id",
      as: "members",
    },
  },
  {
    $addFields: {
      formattedName: {
        $cond: {
          if: { $eq: ["$groupChat", true] },
          then: "$name",
          else: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$members",
                      as: "member",
                      cond: {
                        $ne: ["$$member._id", currentUserObjectId],
                      },
                    },
                  },
                  as: "member",
                  in: "$$member.username",
                },
              },
              0,
            ],
          },
        },
      },
      formattedAvatar: {
        $cond: {
          if: { $eq: ["$groupChat", true] },
          then: {
            $map: {
              input: {
                $filter: {
                  input: "$members",
                  as: "member",
                  cond: {},
                },
              },
              as: "member",
              in: "$$member.avatar",
            },
          },
          else: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$members",
                      as: "member",
                      cond: {
                        $ne: ["$$member._id", currentUserObjectId],
                      },
                    },
                  },
                  as: "member",
                  in: "$$member.avatar",
                },
              },
              0,
            ],
          },
        },
      },
      memberDetails: {
        $map: {
          input: {
            $filter: {
              input: "$members",
              as: "member",
              cond: {},
            },
          },
          as: "member",
          in: {
            _id: "$$member._id",
            name: "$$member.username",
            avatar: "$$member.avatar",
          },
        },
      },
    },
  },
  {
    $project: {
      name: "$formattedName",
      avatar: "$formattedAvatar",
      groupChat: 1,
      members: "$memberDetails",
    },
  },
];

export const postAggregateById = (
  postId: Types.ObjectId,
  currentUserId: Types.ObjectId,
): PipelineStage[] => [
  {
    $match: {
      _id: postId,
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