import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ProfileCard } from "../_components/profile-card";
import { ProfileTabs } from "../_components/profile-tabs";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ScrollArea>
      <div className="h-[950px] w-full p-4">
        <ProfileCard />
        <ProfileTabs />
        <div className="h-full w-full">{children}</div>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
