import { redirect } from "next/navigation";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { serverSession } from "@/hooks/useServerSession";
import { postExploreAggregate } from "@/lib/aggregates";
import { dbConnect } from "@/lib/dbConnection";
import { toObjectId } from "@/lib/utils";
import { PostModel } from "@/models/post.model";
import { InfiniteExploreScroll } from "./_components/infinite-explore-scroll";

export default async function Page() {
  await dbConnect();
  const session = await serverSession();
  if (!session?.user) return redirect("/auth/sign-in");

  const posts = await PostModel.aggregate(
    postExploreAggregate(1, 12, toObjectId(session.user._id)),
  );

  const parsedPosts = JSON.parse(JSON.stringify(posts));

  if (!parsedPosts.length)
    return (
      <div className="h-full w-full p-10">
        Sorry looks like we doesn&apos;t have enough data
      </div>
    );
  
  else
    return (
      <ScrollArea className="h-[100vh] px-4">
        <div className="h-full w-full p-10">
          <div className="grid grid-cols-4 gap-4">
            <InfiniteExploreScroll initialPosts={parsedPosts} />
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    );
}
