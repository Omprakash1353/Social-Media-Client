import { redirect } from "next/navigation";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { serverSession } from "@/hooks/useServerSession";
import { dbConnect } from "@/lib/dbConnection";
import { RequestModel } from "@/models/request.model";
import { RequestNotifications } from "./_components/notification-card";
import { NotificationInfoType } from "@/types/types";
import { notificationAggregate } from "@/lib/aggregates";

export default async function Page() {
  await dbConnect();
  const session = await serverSession();
  if (!session || !session.user) return redirect("/auth/sign-in");

  const requestNotifications = await RequestModel.aggregate(
    notificationAggregate(session.user._id),
  );

  const parsedRequestNotification = JSON.parse(
    JSON.stringify(requestNotifications),
  ) as NotificationInfoType;

  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full w-full p-5">
        <div className="h-[90vh] w-full">
          {parsedRequestNotification &&
            parsedRequestNotification.length > 0 &&
            parsedRequestNotification.map((e) => (
              <RequestNotifications
                key={e.senderInfo.avatar?.asset_id || e._id}
                senderID={e.sender}
                receiverID={e.receiver}
                senderUsername={e.senderInfo.username}
                senderAvatar={e.senderInfo.avatar}
                isFollowing={e.senderInfo.isFollowing}
                isRequested={e.senderInfo.isRequested}
                updatedAt={e.updatedAt}
                status={e.status}
              />
            ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
