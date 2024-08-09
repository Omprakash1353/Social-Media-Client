"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { fetchMoreProfilePosts } from "@/actions/post-actions";
import { Icons } from "@/components/shared/icons";
import { InfiniteProfilePostsType } from "@/types/types";
import { PostDialog } from "@/components/specific/post-dialog";

export function InfiniteProfilePostScroll({
  initialPosts,
  userId,
  currentUserId,
}: {
  initialPosts: InfiniteProfilePostsType | [];
  userId: string;
  currentUserId: string;
}) {
  const [ref, inView] = useInView();

  const fetchPosts = async ({ pageParam = 1 }: { pageParam?: number }) => {
    const res = await fetchMoreProfilePosts({ page: pageParam, userId });
    return res;
  };

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [`${userId}-profile-page-posts`],
      queryFn: fetchPosts,
      initialPageParam: 2,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length ? allPages.length + 1 : undefined,
      initialData: {
        pageParams: [1],
        pages: [initialPosts],
      },
    });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  function getColumns(colIndex: number): InfiniteProfilePostsType {
    return data.pages.flatMap((page) =>
      page.filter((post, index) => index % 4 === colIndex),
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        {[getColumns(0), getColumns(1), getColumns(2), getColumns(3)].map(
          (column, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              {column.map((e) => (
                <PostDialog key={e._id} _id={e._id} media={e.media} />
                // <Link
                //   key={e.media.asset_id}
                //   href={`/p/${e._id}`}
                //   className="rounded-md bg-muted"
                // >
                //   <Image
                //     key={e.media.asset_id}
                //     src={e.media.secure_url}
                //     placeholder="blur"
                //     blurDataURL={e.media.blur_url}
                //     sizes="100vw"
                //     alt="image"
                //     height={300}
                //     width={500}
                //     className="rounded-md"
                //   />
                // </Link>
              ))}
            </div>
          ),
        )}
      </div>
      <div
        className="flex h-20 w-full items-center justify-center pb-32 pt-10"
        ref={ref}
      >
        {isFetchingNextPage && (
          <Icons.spinner className="mr-2 h-10 w-10 animate-spin" />
        )}
      </div>
    </>
  );
}
