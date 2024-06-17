"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BellIcon, SettingsIcon, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function ProfileCard() {
  const pathname = usePathname();
  const userid = pathname.split("/")[1];
  const session = useSession();

  async function getUserData(username: string) {
    const response = await fetch(`/api/users/${userid}`);
  }

  return (
    <Card className="relative flex h-auto w-full items-center justify-center gap-x-10 border-none p-5 shadow-none">
      <Avatar className="h-32 w-32 self-start">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex w-[500px] flex-col p-5">
        <div className="flex items-center justify-center gap-x-4">
          <div>
            <h1>{userid}</h1>
            <h4 className="text-sm text-muted-foreground">
              {session.data?.user.email}
            </h4>
          </div>
          <div className="flex items-center gap-x-3">
            <Button size={"sm"}>Follow</Button>
            <Button size={"sm"}>View Archive</Button>
            <Button size={"sm"}>
              <BellIcon className="h-4 w-4" />
            </Button>
            <SettingsIcon className="h-6 w-6 cursor-pointer" />
          </div>
        </div>
        <div className="my-4 grid grid-cols-3 gap-x-4">
          <div>10 posts</div>
          <div>10 Followers</div>
          <div>10 Followings</div>
        </div>
        <p className="h-auto w-full font-inter text-sm">
          Lorem ipsum dolor sit amet, consectetur {"\n"} adipisicing elit.
          Voluptate corrupti{"\n"} doloremque sunt perferendis enim quam quasi
          {"\n"}
          omnis totam laudantium sed.
        </p>
      </div>
      <Share2 className="absolute right-4 top-4 h-5 w-5 cursor-pointer" />
    </Card>
  );
}
