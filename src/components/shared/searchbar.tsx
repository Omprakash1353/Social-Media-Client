"use client";

import { Search } from "lucide-react";

import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { ModeToggle } from "../specific/toggle-mode";

export function Searchbar() {
  const pathname = usePathname();

  let title;

  if (pathname === "/") {
    title = "Home";
  } else if (
    pathname.includes("/explore") ||
    pathname.includes("/chat") ||
    pathname.includes("/notifications") ||
    pathname.includes("/create-post") ||
    pathname.includes("/settings")
  ) {
    title = pathname.split("/")[1];
  } else {
    title = "Profile";
  }

  return (
    <>
      <div className="flex items-center gap-x-5 px-4 py-2">
        <h1 className="text-xl font-bold capitalize">{title}</h1>
        <div className="grow bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <form>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search" className="pl-8" />
            </div>
          </form>
        </div>
        <ModeToggle />
      </div>
      <Separator />
    </>
  );
}
