import { CheckApi } from "@/components/specific/check-api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { serverSession } from "@/hooks/useServerSession";
import { dbConnect } from "@/lib/dbConnection";
import { RequestModel } from "@/models/request.model";
import mongoose from "mongoose";
import { redirect } from "next/navigation";

export default async function Page() {
  await dbConnect();
  const session = await serverSession();
  if (!session || !session.user) return redirect("/auth/sign-in");
  
  const notifications = await RequestModel.aggregate([
    {
      $match: {
        receiver: new mongoose.Types.ObjectId(session.user._id),
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
                    $eq: [
                      "$sender",
                      new mongoose.Types.ObjectId(session.user._id),
                    ],
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
          $in: [
            new mongoose.Types.ObjectId(session.user._id),
            { $ifNull: ["$senderInfo.followers", []] },
          ],
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
        "senderInfo.username": 1,
        "senderInfo.email": 1,
        "senderInfo.avatar": 1,
        "senderInfo.account_Type": 1,
        "senderInfo.isFollowing": 1,
        "senderInfo.isRequested": 1,
      },
    },
  ]);

  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full w-full p-5">
        <CheckApi data={notifications} />
        <div className="h-[90vh] w-full"></div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
