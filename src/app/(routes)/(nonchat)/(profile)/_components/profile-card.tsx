"use client";

import { useQuery } from "@tanstack/react-query";
import { BellIcon, SettingsIcon, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getUserData } from "@/actions/user-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
            {session?.user.username === data?.username && (
              <Button size={"sm"}>View Archive</Button>
            )}
            {session?.user.username !== data?.username && (
              <Button size={"sm"}>
                <BellIcon className="h-4 w-4" />
              </Button>
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
