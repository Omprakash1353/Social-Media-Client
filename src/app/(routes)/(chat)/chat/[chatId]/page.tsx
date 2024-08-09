import { serverSession } from "@/hooks/useServerSession";
import { chatDetailsAggregate } from "@/lib/aggregates";
import { dbConnect } from "@/lib/dbConnection";
import { toObjectId } from "@/lib/utils";
import { ChatModel } from "@/models/chat.model";
import { Chat } from "../../_components/chat";
import { MessageModel } from "@/models/message.model";
import { revalidatePath } from "next/cache";
import { Member, Message } from "@/types/types";
import { UserModel } from "@/models/user.model";

type MessageQueryType = {
  content: string;
  sender: string;
  attachment: { secure_url: string }[];
  updatedAt: Date;
}[];

type ChatQueryType = {
  _id: string;
  groupChat: boolean;
  name: string;
  avatar: { secure_url: string }[] | { secure_url: string };
  members: { _id: string; name: string; avatar: { secure_url: string } }[];
};

export default async function Page({ params }: { params: { chatId: string } }) {
  await dbConnect();
  const session = await serverSession();
  if (!session || !session.user)
    return (
      <div className="flex h-full w-full items-center justify-center">
        User unauthorized
      </div>
    );

  const [chat, message] = await Promise.all([
    ChatModel.aggregate(
      chatDetailsAggregate(
        toObjectId(params.chatId),
        toObjectId(session.user._id),
      ),
    ),
    MessageModel.find({ chat: params.chatId })
      .sort({
        createdAt: 1,
      })
      .select("content sender attachments updatedAt"),
  ]);

  const parsedChat = JSON.parse(JSON.stringify(chat[0])) as ChatQueryType;

  const parsedMessages = JSON.parse(
    JSON.stringify(message),
  ) as MessageQueryType;

  function renderMessages(
    parsedMessages: MessageQueryType,
    currentUserId: string,
    members: Member[],
  ): Message[] {
    return parsedMessages.map((msg) => {
      const isSender = msg.sender === currentUserId;
      const sender = members.find((member) => member._id === msg.sender);

      return isSender
        ? { type: "sender", message: msg.content }
        : {
            type: "receiver",
            message: msg.content,
            senderName: sender?.name || "Unknown",
          };
    });
  }

  let lastOnlineTime: Date | undefined;
  if (!parsedChat.groupChat) {
    const user = await UserModel.findOne({ name: parsedChat.name }) as any;
    if (user && user.lastOnlineTime) lastOnlineTime = user.lastOnlineTime;
  }

  const renderMessagesArr = renderMessages(
    parsedMessages,
    session.user._id,
    parsedChat.members,
  );

  if (!parsedChat)
    return (
      <div className="flex h-full w-full items-center justify-center">
        Chat Not Found
      </div>
    );

  revalidatePath("/chat");

  return (
    <Chat
      currentUserId={session.user._id}
      chatId={parsedChat._id}
      username={parsedChat.name}
      avatar={parsedChat?.avatar}
      members={parsedChat?.members}
      groupChat={parsedChat.groupChat}
      initialMessages={renderMessagesArr}
      lastOnlineTime={lastOnlineTime}
    />
  );
}
