"use client";

import { SettingsIcon } from "lucide-react";
import Link from "next/link";

import { FollowButton } from "@/components/shared/follow-button";
import { Button } from "@/components/ui/button";

export function ProfileActions({
  username,
  currentUser,
  account_Type,
  isFollowing,
  hasRequested,
}: {
  username: string;
  currentUser: string;
  account_Type: "PUBLIC" | "PRIVATE";
  isFollowing: boolean;
  hasRequested: boolean;
}) {
  return (
    <div className="flex items-center gap-x-3">
      {currentUser !== username && (
        <FollowButton
          currentUserID={currentUser}
          profileID={username}
          account_Type={account_Type}
          isFollowing={isFollowing}
          hasRequested={hasRequested}
        />
      )}
      {currentUser !== username && (
        <Button size={"sm"} variant={"secondary"} asChild>
          <Link href={`/chat/${username}`}>Message</Link>
        </Button>
      )}
      {currentUser === username && (
        <Button size={"sm"} asChild>
          <Link href={"/archived"}>View Archive</Link>
        </Button>
      )}
      {currentUser === username && (
        <Link href="settings/edit">
          <SettingsIcon className="h-6 w-6 cursor-pointer" />
        </Link>
      )}
    </div>
  );
}
