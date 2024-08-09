import Link from "next/link";
import { redirect } from "next/navigation";

import { serverSession } from "@/hooks/useServerSession";
import { suggestBarAggregate } from "@/lib/aggregates";
import { dbConnect } from "@/lib/dbConnection";
import { toObjectId } from "@/lib/utils";
import { UserModel } from "@/models/user.model";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { FollowButton } from "./follow-button";

export async function SuggestionBar() {
  const session = await serverSession();
  if (!session?.user) return redirect("/auth/sign-in");

  await dbConnect();

  const users = await UserModel.aggregate(
    suggestBarAggregate(toObjectId(session.user._id)),
  );

  const parsedUser = JSON.parse(JSON.stringify(users)) as {
    _id: string;
    username: string;
    email: string;
    avatar: { secure_url: string };
    account_Type: "PRIVATE" | "PUBLIC";
    isFollowing: boolean;
    isRequested: boolean;
  }[];

  return (
    <Card className="border-none text-sm shadow-none outline-none">
      <CardHeader>
        <CardTitle>Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Avatar>
            <AvatarImage src={`${session.user.avatar?.secure_url}`} />
            <AvatarFallback>
              {session.user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">
              <Link href={`/${session.user.username}`}>
                {session.user.username}
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          {parsedUser.length > 0 && <h4 className="text-sm font-medium">People you may know</h4>}
          <div className="grid gap-6">
            {parsedUser.length > 0 &&
              parsedUser.map((e) => (
                <div
                  className="flex items-center justify-between"
                  key={e.username}
                >
                  <div className="flex items-center space-x-4">
                    <Link
                      href={`/${e.username}`}
                      className="flex cursor-pointer items-center justify-between space-x-4"
                    >
                      <Avatar>
                        <AvatarImage src={e.avatar?.secure_url} />
                        <AvatarFallback>
                          {e.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {e.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {e.email}
                        </p>
                      </div>
                    </Link>
                  </div>
                  <FollowButton
                    account_Type={e.account_Type}
                    currentUserID={session.user._id}
                    profileID={e._id}
                    hasRequested={e.isRequested}
                    isFollowing={e.isFollowing}
                  />
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
