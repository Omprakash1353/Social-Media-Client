"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

export function SuggestionBar() {
  const { data: session } = useSession();
  if (!session?.user) return <div className="w-full h-full flex justify-center items-center">Loading... !!!</div>;

  return (
    <Card className="border-none text-sm shadow-none outline-none">
      <CardHeader>
        <CardTitle>Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Avatar>
            <AvatarImage src={`${session.user.avatar?.secure_url}`} />
            <AvatarFallback>{session.user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">
              <Link href={`/${session.user.username}`}>{session.user.username}</Link>
            </p>
            <p className="text-sm text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          <h4 className="text-sm font-medium">People you may know</h4>
          <div className="grid gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((q, i) => (
              <Link
                href={"/Olivia Martin"}
                className="flex cursor-pointer items-center justify-between space-x-4"
                key={i}
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/avatars/03.png" />
                    <AvatarFallback>OM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      Olivia Martin
                    </p>
                    <p className="text-sm text-muted-foreground">
                      m@example.com
                    </p>
                  </div>
                </div>
                <Button size={"sm"}>Follow</Button>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
