"use client";

import { useQuery } from "@tanstack/react-query";
import { SettingsIcon, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getUserData } from "@/actions/user-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ProfileCard() {
  const pathname = usePathname();
  const userid = pathname.split("/")[1];
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: [`profile-${userid}`],
    queryFn: () => getUserData(userid),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Card className="relative flex h-auto w-full items-center justify-center gap-x-10 border-none p-5 shadow-none">
      <Avatar className="h-32 w-32 self-start">
        <AvatarImage
          src={
            data && data.avatar?.secure_url
              ? data.avatar?.secure_url
              : "https://github.com/shadcn.png"
          }
          className="object-cover object-center"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex w-[500px] flex-col p-5">
        <div className="flex items-center justify-between gap-x-4">
          <div>
            <h1>{userid}</h1>
            <h4 className="text-sm text-muted-foreground">{data?.email}</h4>
          </div>
          <div className="flex items-center gap-x-3">
            {session?.user.username !== data?.username && (
              <Button size={"sm"}>Follow</Button>
            )}
            {session?.user.username !== data?.username && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size={"sm"} variant={"secondary"}>Pending</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Follow Request</DialogTitle>
                    <DialogDescription>
                      Are you absolutely sure you want to cancel follow request
                      ?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant={"destructive"}>
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
            )}
            {session?.user.username !== data?.username && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size={"sm"} variant={"secondary"}>Following</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="text-red-500">
                    Unfollow
                  </DropdownMenuItem>
                  <DropdownMenuItem>Mute</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {session?.user.username !== data?.username && (
              <Button size={"sm"} variant={"secondary"}>Message</Button>
            )}
            {session?.user.username === data?.username && (
              <Button size={"sm"}>View Archive</Button>
            )}
            {session?.user.username === data?.username && (
              <Link href="settings/edit">
                <SettingsIcon className="h-6 w-6 cursor-pointer" />
              </Link>
            )}
          </div>
        </div>
        <div className="my-4 grid grid-cols-3 gap-x-4">
          <div>{data?.mediaCount} posts</div>
          <div>{data?.followersCount} Followers</div>
          <div>{data?.followingsCount} Followings</div>
        </div>
        <p className="h-auto w-full font-inter text-sm">{data?.bio}</p>
      </div>
      <Share2 className="absolute right-4 top-4 h-5 w-5 cursor-pointer" />
    </Card>
  );
}
