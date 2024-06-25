"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  cancelRequest,
  followUser,
  unfollowUser,
} from "@/actions/user-actions";

type UserRequests = { currentUserId: string; userId: string };

export function FollowButton({
  account_Type,
  isFollowing,
  hasRequested,
  currentUserID,
  profileID,
}: {
  account_Type: "PRIVATE" | "PUBLIC";
  isFollowing: boolean;
  hasRequested: boolean;
  currentUserID: string;
  profileID: string;
}) {
  const [isFollowingAcc, setIsFollowingAcc] = useState(isFollowing);
  const [hasFollowRequested, setHasFollowRequested] = useState(
    Boolean(hasRequested),
  );

  const followUserFn = useCallback(
    async ({
      account_Type,
      currentUserId,
      userId,
    }: UserRequests & { account_Type: "PRIVATE" | "PUBLIC" }) => {
      const res = await followUser({
        account_Type,
        currentUserId,
        userId,
      });
      return res;
    },
    [],
  );

  const unfollowUserFn = useCallback(
    async ({ currentUserId, userId }: UserRequests) => {
      const res = await unfollowUser({
        currentUserId,
        userId,
      });
      return res;
    },
    [],
  );

  const cancelRequestFn = useCallback(
    async ({ currentUserId, userId }: UserRequests) => {
      const res = await cancelRequest({
        currentUserId,
        userId,
      });
      return res;
    },
    [],
  );

  const { mutateAsync: followUserMutation } = useMutation({
    mutationFn: followUserFn,
    onSuccess: (data) => {
      if (account_Type === "PRIVATE") {
        setHasFollowRequested(data.isRequested);
      }
      if (account_Type === "PUBLIC") {
        setIsFollowingAcc(data.isFollowing);
      }
    },
  });

  const { mutateAsync: unfollowUserMutation } = useMutation({
    mutationFn: unfollowUserFn,
    onSuccess: (data) => {
      setIsFollowingAcc(data.isFollowing);
    },
  });

  const { mutateAsync: cancelRequestMutation } = useMutation({
    mutationFn: cancelRequestFn,
    onSuccess: (data) => {
      setIsFollowingAcc(data.isFollowing);
      setHasFollowRequested(data.isRequested);
    },
  });

  const toggleFollow = async () => {
    setIsFollowingAcc((prev) => !prev);
    if (!isFollowingAcc) {
      await followUserMutation({
        account_Type,
        currentUserId: currentUserID,
        userId: profileID,
      });
    } else {
      await unfollowUserMutation({
        currentUserId: currentUserID,
        userId: profileID,
      });
    }
  };

  const toggleRequest = async () => {
    setHasFollowRequested((prev) => !prev);
    if (!hasFollowRequested) {
      await followUserMutation({
        account_Type,
        currentUserId: currentUserID,
        userId: profileID,
      });
    } else {
      await cancelRequestMutation({
        currentUserId: currentUserID,
        userId: profileID,
      });
    }
  };

  const FollowingButton = ({ onClick }: { onClick: () => void }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"sm"} variant={"secondary"} onClick={onClick}>
          Following
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="text-red-500" onClick={onClick}>
          Unfollow
        </DropdownMenuItem>
        <DropdownMenuItem>Mute</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const FollowButtonComponent = ({ onClick }: { onClick: () => void }) => (
    <Button size={"sm"} onClick={onClick}>
      Follow
    </Button>
  );

  const FollowPendingComponent = ({ onClick }: { onClick: () => void }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"} variant={"secondary"}>
          Pending
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Follow Request</DialogTitle>
          <DialogDescription>
            Are you absolutely sure you want to cancel the follow request?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={"destructive"} onClick={onClick}>
            Yes
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              No
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (account_Type === "PRIVATE") {
    if (isFollowingAcc) {
      return <FollowingButton onClick={toggleFollow} />;
    } else if (hasFollowRequested) {
      return <FollowPendingComponent onClick={toggleRequest} />;
    } else {
      return <FollowButtonComponent onClick={toggleRequest} />;
    }
  }

  if (account_Type === "PUBLIC") {
    if (isFollowingAcc) {
      return <FollowingButton onClick={toggleFollow} />;
    } else {
      return <FollowButtonComponent onClick={toggleFollow} />;
    }
  }

  return <Button size={"sm"}>Follow User</Button>;
}
