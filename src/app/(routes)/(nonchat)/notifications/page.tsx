import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Notifications } from "./_components/notification-card";

export default function Page() {
  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full w-full p-5">
        <div className="h-[90vh] w-full">
          <Notifications />
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
