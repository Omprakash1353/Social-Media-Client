import { dbConnect } from "@/lib/dbConnection";
import { PostModel } from "@/models/post.model";
import { postExploreAggregate } from "@/lib/aggregates";
import { PostExplorerType } from "@/types/types";
import { InfiniteExploreScroll } from "./_components/infinite-explore-scroll";

export default async function Page() {
  await dbConnect();
  const posts = await PostModel.aggregate(postExploreAggregate(1, 12));

  const parsedPosts = JSON.parse(JSON.stringify(posts));

  // if (!parsedPosts.length)
  //   return (
  //     <div className="h-full w-full p-10">
  //       Sorry looks like we doesn't have enough data
  //     </div>
  //   );

  return (
    <div className="h-full w-full p-10">
      <div className="grid grid-cols-3 gap-4">
        {/* <InfiniteExploreScroll initialPosts={parsedPosts} /> */}
      </div>
    </div>
  );
}
