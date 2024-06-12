"use client";

import {
  PaperclipIcon,
  PhoneIcon,
  Send,
  VideoIcon
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Page({ params }: { params: { chatId: string } }) {
  return (
    <div className="h-full w-full">
      <div className="flex h-16 w-full items-center gap-x-3 border-b-2 px-5">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="grow">
          <div>NAME</div>
          <p className="text-sm text-muted-foreground">09:00 am</p>
        </div>
        <div className="flex gap-x-2">
          <Button>
            <PhoneIcon />
          </Button>
          <Button>
            <VideoIcon />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[80vh] px-4">
        <div className="flex w-full flex-col gap-y-2 py-2">
          {/* Receiver */}
          <div className="w-fit self-end rounded-bl-md rounded-tl-md rounded-tr-md bg-primary-foreground p-2">
            How are you ?
          </div>
          {/* Sender */}
          <div className="w-fit self-start rounded-br-md rounded-tl-md rounded-tr-md bg-muted-foreground p-2">
            How are you ?
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <div className="mb-1 flex w-full items-center border-t-2 px-1">
        <form className="flex h-16 w-full items-center gap-x-2">
          <Button variant={"ghost"} className="h-12">
            <PaperclipIcon />
          </Button>
          <Input
            className="h-2/3 grow border-transparent outline-none"
            placeholder="Type your message..."
          />
          <Button variant={"ghost"} className="h-12">
            <Send className="h-6 w-6" />
          </Button>
        </form>
      </div>
    </div>
  );
}
