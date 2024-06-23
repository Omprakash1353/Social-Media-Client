"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { CommandItem } from "cmdk";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getSearchedUsers } from "@/actions/user-actions";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../specific/toggle-mode";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "../ui/command";
import { Separator } from "../ui/separator";

export function Searchbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedValue = useDebounce(search, 500);

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

  const { isLoading, data } = useQuery({
    queryKey: ["search", debouncedValue],
    queryFn: async () => {
      if (debouncedValue === "") return [];
      const res = await getSearchedUsers(debouncedValue);
      return res;
    },
    enabled: debouncedValue !== "",
  });

  const handleSelect = () => {
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      <div className="flex items-center gap-x-5 px-4 py-2">
        <h1 className="text-xl font-bold capitalize">{title}</h1>
        <div className="grow bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <form>
            <div className="relative">
              <Button
                variant="outline"
                className={cn(
                  "relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64",
                )}
                onClick={(e) => {
                  setOpen(true);
                  e.preventDefault();
                }}
              >
                <span className="hidden lg:inline-flex">Search others...</span>
                <span className="inline-flex lg:hidden">Search...</span>
              </Button>
              <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                  placeholder="Type a command or search..."
                  onValueChange={setSearch}
                  value={search}
                />
                <CommandList>
                  <CommandEmpty>
                    {(isLoading && "Loading...") ||
                      (!data?.length && "No results")}
                  </CommandEmpty>
                  <CommandGroup heading="Search Results">
                    {data?.length &&
                      data?.map((e) => (
                        <CommandItem
                          value={e.username}
                          key={e.username}
                          asChild
                          onSelect={handleSelect}
                        >
                          <Link key={e.username} href={`/${e.username}`}>
                            <div className="flex items-center justify-center">
                              <div className="flex items-center space-x-4">
                                <Avatar>
                                  <AvatarImage src={e.avatar?.secure_url} />
                                  <AvatarFallback>
                                    {e.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-medium leading-none">
                                  {e.username}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </CommandDialog>
            </div>
          </form>
        </div>
        <ModeToggle />
      </div>
      <Separator />
    </>
  );
}
