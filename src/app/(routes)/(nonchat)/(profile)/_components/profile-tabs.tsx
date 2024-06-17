"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProfileTabs() {
  const pathname = usePathname();
  const userId = pathname.split("/")[1];

  return (
    <Tabs
      className="w-full pb-5"
      defaultValue={pathname.split("/")[2] ? pathname.split("/")[2] : "post"}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="post" asChild>
          <Link href={`/${userId}`}>Posts</Link>
        </TabsTrigger>
        <TabsTrigger value="saved" asChild>
          <Link href={`/${userId}/saved`}>Saved</Link>
        </TabsTrigger>
        <TabsTrigger value="tagged" asChild>
          <Link href={`/${userId}/tagged`}>Tagged</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
