"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NavTab() {
  const pathname = usePathname();

  return (
    <Tabs className="w-full pb-5" defaultValue={pathname.split("/")[2]}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="post" asChild>
          <Link href={"/create/post"}>Post</Link>
        </TabsTrigger>
        <TabsTrigger value="story" asChild>
          <Link href={"/create/story"}>Story</Link>
        </TabsTrigger>
        <TabsTrigger value="reel" asChild>
          <Link href={"/create/reel"}>Reel</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
