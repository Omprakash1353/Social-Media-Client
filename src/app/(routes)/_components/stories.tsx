import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function Stories() {
  return (
    <ScrollArea className="mx-5 my-3 w-full whitespace-nowrap rounded-md border-none">
      <div className="flex w-max space-x-4 p-4 px-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((e) => (
          <Avatar key={e} className="shrink-0">
            <AvatarImage src="03.png" />
            <AvatarFallback>OM</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}