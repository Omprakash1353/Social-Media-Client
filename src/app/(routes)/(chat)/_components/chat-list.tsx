import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function ChatList() {
  return (
    <Card className="h-full w-full p-2 lg:flex-none">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="pl-3 pt-3 text-2xl font-semibold tracking-tight">
          Chats
        </h1>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-start gap-2">
        <ScrollArea className="h-full w-full">
          {[1, 2, 3].map((e, i) => (
            <Chats key={i} />
          ))}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </Card>
  );
}

export function Chats() {
  return (
    <Card className="my-2 flex h-20 w-full cursor-pointer items-center p-5">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex w-full flex-col items-center p-4">
        <div className="flex w-full items-center justify-between">
          <div>NAME</div>
          <div className="text-sm text-muted-foreground">09:00 am</div>
        </div>
        <p className="w-52 self-start overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground">
          Lorem Lorem, ipsum dolorasdknalsd slknslkda
        </p>
      </div>
    </Card>
  );
}
