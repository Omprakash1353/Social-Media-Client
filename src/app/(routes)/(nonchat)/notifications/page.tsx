import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
