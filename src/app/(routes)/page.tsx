import { ScrollArea } from "@/components/ui/scroll-area";
import { dbConnect } from "@/lib/dbConnection";
import { PostModel } from "@/models/post.model";
import { IPostStringified } from "@/types/types";
import { PostsScroll } from "./_components/posts";
import { Stories } from "./_components/stories";
import { postAggregate } from "@/lib/aggregates";

export default async function Page() {
  await dbConnect();

  const posts = await PostModel.aggregate(postAggregate(1, 3));
  const ParsedPosts = JSON.parse(JSON.stringify(posts)) as IPostStringified[];

  return (
    <div className="mr-5 flex w-full flex-col items-center justify-center gap-3">
      <Stories />
      <ScrollArea className="flex h-[1000px] flex-col items-center justify-center gap-y-3">
        <PostsScroll initialPosts={ParsedPosts} />
        <div className="h-36" />
      </ScrollArea>
    </div>
  );
}
