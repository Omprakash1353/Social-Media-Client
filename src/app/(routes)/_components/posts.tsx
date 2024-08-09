"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Icons } from "@/components/shared/icons";
import { PostCard } from "@/components/specific/post-card";
import { IPostStringified } from "@/types/types";
import { fetchMoreHomePosts } from "@/actions/post-actions";
import { useSession } from "next-auth/react";

export function PostsScroll({
  initialPosts,
}: {
  initialPosts: IPostStringified[];
}) {
  const { data: session } = useSession();
  const [ref, inView] = useInView();

  const fetchPosts = async ({ pageParam = 1 }: { pageParam?: number }) => {
    const res = await fetchMoreHomePosts({ page: pageParam });
    return res;
  };

  // Initial data coming from server

  // const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
  //   useInfiniteQuery({
  //     queryKey: ["home-page-posts"],
  //     queryFn: fetchPosts,
  //     initialPageParam: 2,
  //     getNextPageParam: (lastPage, allPages) =>
  //       lastPage.length ? allPages.length + 1 : undefined,
  //     initialData: {
  //       pageParams: [1],
  //       pages: [initialPosts],
  //     },
  //   });

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["home-page-posts"],
      queryFn: fetchPosts,
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length > 0 ? allPages.length + 1 : undefined,
    });

  async function setUpCookies(user_id: string) {
    try {
      const cookieResponse = await fetch("http://localhost:4000/api/v1/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: user_id }),
      });
      if (cookieResponse.ok) {
        console.log("Cookie setup successful");
      } else {
        console.error("Failed to set up cookie", await cookieResponse.text());
      }
    } catch (error) {
      console.error("Failed to fetch", error);
    }
  }

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (session && session.user) {
      setUpCookies(session.user._id as string);
    }
  }, [session?.user._id]);

  return (
    <>
      {data &&
        data?.pages.length > 1 &&
        data.pages.map((page: IPostStringified[]) =>
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
