import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { serverSession } from "@/hooks/useServerSession";
import { postHomeAggregate } from "@/lib/aggregates";
import { dbConnect } from "@/lib/dbConnection";
import { toObjectId } from "@/lib/utils";
import { PostModel } from "@/models/post.model";
import { IPostStringified } from "@/types/types";
import { PostsScroll } from "../_components/posts";
import { Stories } from "../_components/stories";

export default async function Page() {
  await dbConnect();

  const session = await serverSession();
  if (!session || !session.user) return redirect("/auth/sign-in");

  const posts = await PostModel.aggregate(
    postHomeAggregate(1, 3, toObjectId(session?.user._id)),
  );

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
