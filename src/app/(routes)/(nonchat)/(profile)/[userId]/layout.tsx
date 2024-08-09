import { Share2 } from "lucide-react";

import { ShareDialogButton } from "@/components/specific/share-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DOMAIN_NAME } from "@/constants/config";
import { serverSession } from "@/hooks/useServerSession";
import { profileData } from "@/lib/aggregates";
import { dbConnect } from "@/lib/dbConnection";
import { toObjectId } from "@/lib/utils";
import { UserModel } from "@/models/user.model";
import { UserCardType } from "@/types/types";
import { redirect } from "next/navigation";
import { ProfileActions } from "../_components/profile-actions";
import { ProfileTabs } from "../_components/profile-tabs";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    userId: string;
  };
}) {
  await dbConnect();
  const session = await serverSession();
  if (!session || !session.user) return redirect("/auth/sign-in");

  const user = await UserModel.findOne({ username: params.userId }).select(
    "username",
  );

  const userData = await UserModel.aggregate(
    profileData(params.userId, toObjectId(session.user._id)),
  );

  const parsedUser = JSON.parse(JSON.stringify(user));

  if (!userData.length)
    return (
      <div className="flex h-full w-full items-center justify-center">
        User not found !
      </div>
    );

  if (!session?.user || !session.user.username)
    return (
      <div className="flex h-full w-full items-center justify-center">
        Something went wrong !
      </div>
    );

  const parsedData = JSON.parse(JSON.stringify(userData[0])) as UserCardType;

  return (
    <ScrollArea>
      <div className="h-[950px] w-full p-4">
        <Card className="relative flex h-auto w-full items-center justify-center gap-x-10 border-none p-5 shadow-none">
          <Avatar className="h-32 w-32 self-start">
            <AvatarImage
              src={
                parsedData.avatar?.secure_url
                  ? parsedData.avatar?.secure_url
                  : "https://github.com/shadcn.png"
              }
              className="object-cover object-center"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex w-[500px] flex-col p-5">
            <div className="flex items-center justify-between gap-x-4">
              <div>
                <h1>{params.userId}</h1>
                <h4 className="text-sm text-muted-foreground">
                  {parsedData.email}
                </h4>
              </div>
              <ProfileActions
                username={parsedUser._id}
                currentUser={session.user._id}
                account_Type={parsedData.account_Type}
                isFollowing={parsedData.isFollowing}
                hasRequested={parsedData.hasRequested}
              />
            </div>
            <div className="my-4 grid grid-cols-3 gap-x-4">
              <div>{parsedData.mediaCount} posts</div>
              <div>{parsedData.followersCount} Followers</div>
              <div>{parsedData.followingsCount} Followings</div>
            </div>
            <p className="h-auto w-full font-inter text-sm">{parsedData.bio}</p>
          </div>
          <ShareDialogButton url={`${DOMAIN_NAME}/${parsedData.username}`}>
            <Share2 className="absolute right-4 top-4 h-5 w-5 cursor-pointer" />
          </ShareDialogButton>
        </Card>
        <ProfileTabs />
        <div className="h-full w-full">{children}</div>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
