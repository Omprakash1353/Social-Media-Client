"use client";

import {
  PaperclipIcon,
  Phone,
  PhoneIcon,
  PhoneOff,
  Send,
  VideoIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSocket } from "@/context/socket-provider";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import { Member, Message } from "@/types/types";
import { GroupComponents } from "./group-components";
import { getTime } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { setRemoteUserSocketId } from "@/redux/reducers/video-call";

type ChatProps = {
  currentUserId: string;
  chatId: string;
  username: string;
  avatar: { secure_url: string }[] | { secure_url: string };
  groupChat: boolean;
  members: Member[];
  initialMessages: Message[];
  lastOnlineTime?: Date;
};

type TypingMessageType = {
  chatId: string;
  sender: { _id: string; name: string };
};

type NewMessageType = TypingMessageType & {
  content: string;
};

type Accumulator = {
  sessionUser: Member | null;
  otherMembers: Member[];
};

export function Chat({
  currentUserId,
  chatId,
  username,
  avatar,
  groupChat,
  members,
  initialMessages,
  lastOnlineTime,
}: ChatProps) {
  const { socket } = useSocket();
  const { data: session } = useSession();
  const router = useRouter();
  const [remoteUserTyping, setRemoteUserTyping] = useState<boolean>(false);
  const [currentUserTyping, setCurrentUserTyping] = useState<boolean>(false);
  const [remoteUserOnline, setRemoteUserOnline] = useState(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [sender, setSender] = useState("");
  const [openChatDetails, setOpenChatDetails] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [leftTime, setLeftTime] = useState<string | null>(null);
  const endMessageRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch();

  const sendMembers = useMemo(
    () => members.filter((e) => e._id !== currentUserId).map((e) => e._id),
    [members, currentUserId],
  );

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messageOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!currentUserTyping) {
      socket.emit("start:typing", {
        members: sendMembers,
        chatId,
      });
      setCurrentUserTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop:typing", {
        members: sendMembers,
        chatId,
      });
      setCurrentUserTyping(false);
    }, 1000);
  };

  const startTypingListener = useCallback(
    (data: TypingMessageType) => {
      if (data.chatId !== chatId) return;
      setRemoteUserTyping(true);
      setSender(data.sender.name);
    },
    [chatId],
  );

  const stopTypingListener = useCallback(
    (data: TypingMessageType) => {
      if (data.chatId !== chatId) return;
      setRemoteUserTyping(false);
      setSender(data.sender.name);
    },
    [chatId],
  );

  const newMessagesListener = useCallback(
    (data: NewMessageType) => {
      if (data.chatId !== chatId) return;

      setMessages((prev) => [
        ...prev,
        {
          type: "receiver",
          message: data.content,
          senderName: data.sender.name,
        },
      ]);
    },
    [chatId],
  );

  const handleVideoClick = () => {
    socket.emit("room:join", {
      userId: currentUserId,
      callId: chatId,
      members: sendMembers,
    });
    console.log("CHAT:ROOM:JOIN");
    router.push(`/call/${chatId}`);
  };

  const handleJoinRoom = useCallback(
    (data: { userId: string; callId: string }) => {
      const { userId, callId } = data;
      router.push(`/call/${callId}`);
    },
    [router],
  );

  const handleUserJoined = useCallback(
    (data: { userId: string; id: string }) => {
      setOpenDialog(true);
      dispatch(setRemoteUserSocketId(data.userId));
    },
    [],
  );

  const remoteUserStatus = useCallback(
    (data: { status: boolean; remoteSocketId: string; time: Date }) => {
      console.log("remote:user:status", data, socket.id, data.remoteSocketId);
      setRemoteUserOnline(data.status);
      setLeftTime(getTime(new Date(data.time)));
    },
    [socket],
  );

  const handleUserStatus = useCallback(
    (data: { status: boolean; userId: string }) => {
      console.log(data);
      if (members.some((member) => member._id === data.userId)) {
        setRemoteUserOnline(data.status);
      }
    },
    [members],
  );

  const eventHandler = {
    ["new:message"]: newMessagesListener,
    ["start:typing"]: startTypingListener,
    ["stop:typing"]: stopTypingListener,
    ["remote:user:status"]: remoteUserStatus,
    ["user:status"]: handleUserStatus,
    ["room:join"]: handleJoinRoom,
    ["user:joined"]: handleUserJoined,
  };

  useSocketEvents(socket, eventHandler);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    socket.emit("new:message", {
      members: sendMembers,
      chatId,
      message: newMessage,
    });
    setMessages((prev) => [...prev, { type: "sender", message: newMessage }]);
    setNewMessage("");
  };

  useEffect(() => {
    endMessageRef.current?.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    if (socket && !groupChat && members.length > 0)
      socket.emit("remote:user:status", { member: sendMembers[0] });
  }, [socket, groupChat, members, sendMembers]);

  const { sessionUser, otherMembers } = members.reduce<Accumulator>(
    (acc, member) => {
      if (member.name === session?.user.username) {
        acc.sessionUser = member;
      } else {
        acc.otherMembers.push(member);
      }
      return acc;
    },
    { sessionUser: null, otherMembers: [] },
  );

  return (
    <div className="h-[95%] w-full">
      <div className="flex h-20 w-full items-center gap-x-3 border-b-2 px-5 pt-2">
        <div
          className="flex grow cursor-pointer gap-3"
          onClick={() => setOpenChatDetails(true)}
        >
          {groupChat ? (
            <div className="relative mr-3 h-10 w-10">
              <Avatar className="absolute -left-2 -top-2">
                <AvatarImage
                  src={Array.isArray(avatar) ? avatar[0]?.secure_url : ""}
                />
                <AvatarFallback>
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Avatar className="absolute -bottom-2 -right-2">
                <AvatarImage
                  src={Array.isArray(avatar) ? avatar[1]?.secure_url : ""}
                />
                <AvatarFallback>
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Avatar>
              <AvatarImage
                src={!Array.isArray(avatar) ? avatar?.secure_url : ""}
              />
              <AvatarFallback>
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="grow">
            <div>{username}</div>
            <p
              className={`text-sm ${
                remoteUserTyping ? "text-emerald-500" : "text-muted-foreground"
              }`}
            >
              {remoteUserTyping
                ? groupChat
                  ? `${sender} is typing`
                  : "Typing..."
                : groupChat
                  ? members.map((e) => <span key={e._id}>{e.name}, </span>)
                  : remoteUserOnline
                    ? "online"
                    : leftTime && `Last seen ${leftTime}`}
            </p>
          </div>
        </div>
        {groupChat && (
          <GroupComponents
            open={openChatDetails}
            setOpen={setOpenChatDetails}
            chatId={chatId}
            username={username}
            sessionUser={sessionUser}
            otherMembers={otherMembers}
          />
        )}
        <div className="flex items-center justify-center gap-x-2">
          <Button>
            <PhoneIcon size={"sm"} />
          </Button>
          <Button onClick={handleVideoClick}>
            <VideoIcon size={"sm"} />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[90%] px-4">
        <div className="flex w-full flex-col gap-y-2 py-2 text-sm">
          {messages.map((msg, index) =>
            msg.type === "sender" ? (
              <Sender key={index} message={msg.message} />
            ) : (
              <Receiver
                key={index}
                message={msg.message}
                groupChat={groupChat}
                username={msg.senderName}
              />
            ),
          )}
          <div ref={endMessageRef} />
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          {/* Call from Remote User */}
          <div>Call from</div>
          <div className="flex items-center justify-center gap-5">
            <Button variant={"ghost"} className="rounded-full bg-green-500">
              <Link href={`/call/${chatId}`}>
                <Phone className="text-white" />
              </Link>
            </Button>
            <Button variant={"ghost"} className="rounded-full bg-red-500">
              <PhoneOff className="text-white" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex w-full items-center border-t-2 px-1">
        <form
          className="flex h-16 w-full items-center gap-x-2"
          onSubmit={handleSubmit}
        >
          <Button variant={"ghost"} className="h-12">
            <PaperclipIcon />
          </Button>
          {session?.user && (
            <Input
              className="focus-visible h-2/3 grow border-none bg-transparent text-sm outline-none focus:border-none focus-visible:outline-none focus-visible:ring-0"
              placeholder="Type your message..."
              value={newMessage}
              onChange={messageOnChange}
            />
          )}
          <Button variant={"ghost"} className="h-12" type="submit">
            <Send className="h-6 w-6" />
          </Button>
        </form>
      </div>
    </div>
  );
}

const Sender = ({ message }: { message: string }) => (
  <div className="w-fit self-end rounded-bl-md rounded-tl-md rounded-tr-md bg-primary-foreground p-2">
    {message}
  </div>
);

const Receiver = ({
  message,
  username,
  groupChat,
}: {
  message: string;
  username: string;
  groupChat: boolean;
}) => (
  <div className="w-fit self-start rounded-br-md rounded-tl-md rounded-tr-md bg-muted-foreground p-2">
    {groupChat === true && <div className="text-[10px]">{username}</div>}
    {message}
  </div>
);
