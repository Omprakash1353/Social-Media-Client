"use client";

import { acceptRequest, rejectRequest } from "@/actions/user-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTime } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, CircleX } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

export function Notifications() {
  return (
    <Card className="mb-4 p-4 text-sm">
      <h1 className="mb-2 text-base">Lorem, ipsum dolor.</h1>
      <p className="mb-2 text-muted-foreground">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint asperiores
        quibusdam tempora unde quod iusto illo perferendis iste numquam eius,
        excepturi repellat autem nam, minima eaque laudantium voluptates quam
        delectus error. Porro harum, nihil rem
      </p>
      <div>
        <Button size={"sm"}>Click Me !</Button>
      </div>
    </Card>
  );
}

export function RequestNotifications({
  senderID,
  receiverID,
  senderUsername,
  senderAvatar,
  isFollowing,
  isRequested,
  updatedAt,
}: {
  senderID: string;
  receiverID: string;
  senderUsername: string;
  senderAvatar: { secure_url: string };
  isFollowing: boolean;
  isRequested: boolean;
  updatedAt: Date;
  status: "pending" | "accepted" | "rejected";
}) {
  const [hasAccepted, setHasAccpeted] = useState<
    "accepted" | "pending" | "rejected"
  >("pending");

  const handleAccept = useCallback(
    async ({
      currentUserId,
      userId,
    }: {
      currentUserId: string;
      userId: string;
    }) => {
      const res = await acceptRequest({
        currentUserId,
        userId,
      });
      return res;
    },
    [],
  );

  const handleDecline = useCallback(
    async ({
      currentUserId,
      userId,
    }: {
      currentUserId: string;
      userId: string;
    }) => {
      const res = await rejectRequest({
        currentUserId,
        userId,
      });
      return res;
    },
    [],
  );

  const { mutateAsync: acceptRequestMutation } = useMutation({
    mutationFn: handleAccept,
    onSuccess: (data) => {
      setHasAccpeted(data.status);
    },
  });
  const { mutateAsync: rejectRequestMutation } = useMutation({
    mutationFn: handleDecline,
    onSuccess: (data) => {
      setHasAccpeted(data.status);
    },
  });

  const acceptClick = async () => {
    setHasAccpeted("accepted");
    await acceptRequestMutation({
      currentUserId: receiverID,
      userId: senderID,
    });
  };
  const declineClick = async () => {
    setHasAccpeted("rejected");
    await rejectRequestMutation({
      currentUserId: receiverID,
      userId: senderID,
    });
  };

  return (
    <Card className="mb-4 flex gap-4 p-4 text-sm">
      {hasAccepted === "pending" && (
        <>
          <Avatar>
            <AvatarImage src={senderAvatar?.secure_url} />
            <AvatarFallback>
              {senderUsername.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grow">
            <h1 className="mb-2 text-sm">
              New Follow Request • {getTime(updatedAt)}
            </h1>
            <p className="mb-2 text-xs text-muted-foreground">
              {senderUsername} has request to follow you !
            </p>
          </div>
          <div className="flex gap-2 self-center">
            <Button size={"sm"} onClick={acceptClick}>
              Accept
            </Button>
            <Button size={"sm"} variant={"destructive"} onClick={declineClick}>
              Decline
            </Button>
          </div>
        </>
      )}
      {hasAccepted === "accepted" && (
        <div className="flex items-center gap-5">
          <BadgeCheck className="h-10 w-10 text-emerald-500" />
          Accepted follow request of {senderUsername}
        </div>
      )}
      {hasAccepted === "rejected" && (
        <div className="flex items-center gap-5">
          <CircleX className="h-10 w-10 text-red-500" />
          Rejected follow request of {senderUsername}
        </div>
      )}
    </Card>
  );
}

export function NewPostNotifications() {
  return (
    <Card className="mb-4 flex gap-4 p-4 text-sm">
      <div className="grow">
        <h1 className="mb-2 text-sm">
          {" "}
          New Post from <Link href={`/${"username"}`}>{"username"}</Link>
        </h1>
        <p className="mb-2 text-xs text-muted-foreground">
          {"username"} just posted a new post. See what they have posted
        </p>
      </div>
      <div className="flex gap-2 self-center">
        <Button size={"sm"} asChild>
          <Link href={"#"}>Visit</Link>
        </Button>
      </div>
    </Card>
  );
}
