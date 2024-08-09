"use server";

import { ChatModel } from "@/models/chat.model";
import mongoose from "mongoose";

export async function createOrRetrieveChat({
  userId1,
  userId2,
}: {
  userId1: string;
  userId2: string;
}) {
  const user1ObjectId = new mongoose.Types.ObjectId(userId1);
  const user2ObjectId = new mongoose.Types.ObjectId(userId2);

  const chatName =
    userId1 < userId2 ? `${userId1}-${userId2}` : `${userId2}-${userId1}`;

  const chat = await ChatModel.findOne({
    name: chatName,
    members: { $all: [user1ObjectId, user2ObjectId] },
  });

  if (chat) {
    return;
  }

  await ChatModel.create({
    name: chatName,
    groupChat: false,
    members: [user1ObjectId, user2ObjectId],
  });
}
