import { redirect } from "next/navigation";

import { serverSession } from "@/hooks/useServerSession";
import { profilePostAggregate } from "@/lib/aggregates";
import { dbConnect } from "@/lib/dbConnection";
import { toObjectId } from "@/lib/utils";
import { PostModel } from "@/models/post.model";
import { UserModel } from "@/models/user.model";
import { ProfilePostsType } from "@/types/types";
import { InfiniteProfilePostScroll } from "../_components/infinite-post-scroll";

export default async function Page({ params }: { params: { userId: string } }) {
  await dbConnect();

  const session = await serverSession();
  if (!session?.user) return redirect("/auth/sign-in");

  const checkUserExists = await UserModel.find({ username: params.userId });
  if (!checkUserExists) return <div>Invalid User ID</div>;

  const posts = await PostModel.aggregate(
    profilePostAggregate(1, 16, params.userId, toObjectId(session.user._id)),
  );
  const initialPosts = JSON.parse(JSON.stringify(posts)) as ProfilePostsType;

  if (initialPosts[0].message)
    return (
      <div className="flex h-full w-auto items-center justify-center">
        {initialPosts[0].message}
      </div>
    );

  return (
    <InfiniteProfilePostScroll
      initialPosts={initialPosts[0].posts}
      currentUserId={session.user._id}
      userId={params.userId}
    />
  );
}
