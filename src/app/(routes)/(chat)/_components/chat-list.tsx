import mongoose from "mongoose";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { serverSession } from "@/hooks/useServerSession";
import { dbConnect } from "@/lib/dbConnection";
import { ChatModel } from "@/models/chat.model";
import { ChatListMenu } from "./chat-list-menu";

export async function ChatList() {
  const session = await serverSession();
  if (!session || !session.user) return redirect("/chat");

  await dbConnect();

  const currentUserObjectId = new mongoose.Types.ObjectId(session.user._id);

  const chatList = await ChatModel.aggregate([
    { $match: { members: currentUserObjectId } },
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
              $let: {
                vars: {
                  otherMember: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$members",
                          as: "member",
                          cond: {
                            $ne: [
                              "$$member._id",
                              currentUserObjectId,
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: "$$otherMember.username",
              },
            },
          },
        },
        formattedAvatar: {
          $cond: {
            if: { $eq: ["$groupChat", true] },
            then: null,
            else: {
              $let: {
                vars: {
                  otherMember: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$members",
                          as: "member",
                          cond: {
                            $ne: [
                              "$$member._id",
                              currentUserObjectId,
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: "$$otherMember.avatar",
              },
            },
          },
        },
      },
    },
    {
      $project: {
        name: "$formattedName",
        avatar: "$formattedAvatar",
        members: {
          $cond: {
            if: { $eq: ["$groupChat", true] },
            then: {
              $map: {
                input: {
                  $slice: [
                    {
                      $filter: {
                        input: "$members",
                        as: "member",
                        cond: {
                          $ne: [
                            "$$member._id",
                            currentUserObjectId,
                          ],
                        },
                      },
                    },
                    2,
                  ],
                },
                as: "member",
                in: "$$member.avatar",
              },
            },
            else: [],
          },
        },
        groupChat: 1,
      },
    },
  ]);

  const parsedChatList = JSON.parse(JSON.stringify(chatList)) as {
    _id: string;
    groupChat: boolean;
    name: string;
    avatar: { secure_url: string };
    members: { secure_url: string }[];
  }[];

  return (
    <Card className="h-full w-full p-2 lg:flex-none">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="pl-3 pt-3 text-2xl font-semibold tracking-tight">
          Chats
        </h1>
        <ChatListMenu />
      </div>
      <div className="flex h-full w-full flex-col items-center justify-start gap-2">
        <ScrollArea className="h-full w-full">
          {parsedChatList.length &&
            parsedChatList.map((e, i) => <Chats key={i} data={e} />)}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </Card>
  );
}

export function Chats({
  data,
}: {
    data: {
    _id: string
    groupChat: boolean;
    name: string;
    avatar: { secure_url: string };
    members: { secure_url: string }[];
  };
  }) {
  // console.log(data.members[0]);
  return (
    <Link href={`/chat/${data._id}`}>
      <Card className="my-2 flex h-20 w-full cursor-pointer items-center p-5">
        {data.groupChat ? (
          <div className="relative h-10 w-10">
            <Avatar className="absolute -left-2 -top-2">
              <AvatarImage src={data.members[0]?.secure_url} />
              <AvatarFallback>
                {data.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Avatar className="absolute -bottom-2 -right-2">
              <AvatarImage src={data.members[1]?.secure_url} />
              <AvatarFallback>
                {data.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <Avatar>
            <AvatarImage src={data.avatar?.secure_url} />
            <AvatarFallback>
              {data.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex w-full flex-col items-center p-4">
          <div className="flex w-full items-center justify-between">
            <div>{data.name}</div>
            <div className="text-sm text-muted-foreground">09:00 am</div>
          </div>
          <p className="w-52 self-start overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground">
            Lorem Lorem, ipsum dolorasdknalsd slknslkda
          </p>
        </div>
      </Card>
    </Link>
  );
}
