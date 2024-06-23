import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { NewPostNotifications, Notifications, RequestNotifications } from "./_components/notification-card";

export default function Page() {
  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full w-full p-5">
        <div className="h-[90vh] w-full">
          <Notifications />
          <RequestNotifications />
          <NewPostNotifications />
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
