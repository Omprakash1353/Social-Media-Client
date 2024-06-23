"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export function Notifications() {
  return (
    <Card className="mb-4 p-4 text-sm">
      <h1 className="mb-2 text-base">Lorem, ipsum dolor.</h1>
      <p className="mb-2 text-muted-foreground">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint asperiores
        quibusdam tempora unde quod iusto illo perferendis iste numquam eius,
        excepturi repellat autem nam, minima eaque laudantium voluptates quam
        delectus error. Porro harum, nihil rem
      </p>
      <div>
        <Button size={"sm"}>Click Me !</Button>
      </div>
    </Card>
  );
}

export function RequestNotifications() {
  async function handleAccept() {}
  async function handleDecline() {}
  return (
    <Card className="mb-4 flex gap-4 p-4 text-sm">
      <div className="grow">
        <h1 className="mb-2 text-sm">New Follow Request</h1>
        <p className="mb-2 text-xs text-muted-foreground">
          {"username"} has request to follow you !
        </p>
      </div>
      <div className="flex gap-2 self-center">
        <Button size={"sm"} onClick={handleAccept}>
          Accept
        </Button>
        <Button size={"sm"} variant={"destructive"} onClick={handleDecline}>
          Decline
        </Button>
      </div>
    </Card>
  );
}

export function NewPostNotifications() {
  return (
    <Card className="mb-4 flex gap-4 p-4 text-sm">
      <div className="grow">
        <h1 className="mb-2 text-sm">
          {" "}
          New Post from <Link href={`/${"username"}`}>{"username"}</Link>
        </h1>
        <p className="mb-2 text-xs text-muted-foreground">
          {"username"} just posted a new post. See what they have posted
        </p>
      </div>
      <div className="flex gap-2 self-center">
        <Button size={"sm"} asChild>
          <Link href={"#"}>Visit</Link>
        </Button>
      </div>
    </Card>
  );
}
