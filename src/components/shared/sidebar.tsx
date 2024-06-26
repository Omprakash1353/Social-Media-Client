import {
  Compass,
  Heart,
  Home,
  PlusSquare,
  Send,
  Settings,
  Users,
} from "lucide-react";

import { Separator } from "../ui/separator";
import { Nav } from "./nav";
import { SignOut } from "../specific/logout";

export function Sidebar({ myProfileId }: { myProfileId: string }) {
  return (
    <>
      {" "}
      <div className={"flex h-[52px] items-center justify-center px-2"}>
        <h1></h1>
      </div>
      <Separator />
      <Nav
        links={[
          {
            title: "Home",
            label: "",
            icon: Home,
            variant: "ghost",
            href: "/",
          },
          {
            title: "Explore",
            label: "",
            icon: Compass,
            variant: "ghost",
            href: "/explore",
          },
          {
            title: "Notification",
            label: "",
            icon: Heart,
            variant: "ghost",
            href: "/notifications",
          },
          {
            title: "Chat",
            label: "",
            icon: Send,
            variant: "ghost",
            href: "/chat",
          },
          {
            title: "Create",
            label: "",
            icon: PlusSquare,
            variant: "ghost",
            href: "/create/story",
          },
          {
            title: "Profile",
            label: "",
            icon: Users,
            variant: "ghost",
            href: `/${myProfileId}`,
          },
        ]}
      />
      <Separator />
      <Nav
        links={[
          {
            title: "Settings",
            label: "",
            icon: Settings,
            variant: "ghost",
            href: "/settings/edit",
          },
        ]}
      />
      <SignOut />
    </>
  );
}
