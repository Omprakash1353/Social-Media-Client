"use client";

import { SettingsIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileActions({
  username,
  currentUser,
}: {
  username: string;
  currentUser: string;
}) {
  return (
    <div className="flex items-center gap-x-3">
      {currentUser !== username && <Button size={"sm"}>Follow</Button>}
      {currentUser !== username && (
        <Dialog>
          <DialogTrigger asChild>
            <Button size={"sm"} variant={"secondary"}>
              Pending
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Follow Request</DialogTitle>
              <DialogDescription>
                Are you absolutely sure you want to cancel follow request ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant={"destructive"}>Yes</Button>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  No
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {currentUser !== username && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"sm"} variant={"secondary"}>
              Following
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="text-red-500">
              Unfollow
            </DropdownMenuItem>
            <DropdownMenuItem>Mute</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {currentUser !== username && (
        <Button size={"sm"} variant={"secondary"}>
          Message
        </Button>
      )}
      {currentUser === username && (
        <Button size={"sm"} asChild>
          <Link href={"/archived"}>View Archive</Link>
        </Button>
      )}
      {currentUser === username && (
        <Link href="settings/edit">
          <SettingsIcon className="h-6 w-6 cursor-pointer" />
        </Link>
      )}
    </div>
  );
}
