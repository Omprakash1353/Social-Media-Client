"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Icons } from "@/components/shared/icons";
import { PostCard } from "@/components/specific/post-card";
import { IPostStringified } from "@/types/types";
import { fetchMorePosts } from "@/actions/post-actions";

export function PostsScroll({
  initialPosts,
}: {
  initialPosts: IPostStringified[];
}) {
  const [ref, inView] = useInView();

  const fetchPosts = async ({ pageParam = 1 }: { pageParam?: number }) => {
    const res = await fetchMorePosts({ page: pageParam });
    return res;
  };

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
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

  return (
    <>
      {data.pages.map((page: IPostStringified[]) =>
        page.map((post: IPostStringified) => (
          <PostCard key={post._id} postData={post} />
        )),
      )}

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
