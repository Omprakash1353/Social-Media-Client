import { serverSession } from "@/hooks/useServerSession";
import { profilePostAggregate } from "@/lib/aggregates";
import { dbConnect } from "@/lib/dbConnection";
import { PostModel } from "@/models/post.model";
import { ProfilePostsType } from "@/types/types";
import { InfiniteProfilePostScroll } from "../_components/infinite-post-scroll";

import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { userId: string } }) {
  await dbConnect();

  const session = await serverSession();
  if (!session?.user) return redirect("/auth/sign-in");

  const posts = await PostModel.aggregate(profilePostAggregate(1, 16, params.userId));

  if (!posts.length)
    return (
      <div className="h-full w-full p-10">
        Looks like you haven&apos;t posted
      </div>
    );

  const initialPosts = JSON.parse(JSON.stringify(posts)) as ProfilePostsType[];

  return (
    <div className="grid grid-cols-4 items-center justify-center gap-3">
      <InfiniteProfilePostScroll initialPosts={initialPosts} currentUserId={session.user._id} userId={params.userId} />
    </div>
  );
}
