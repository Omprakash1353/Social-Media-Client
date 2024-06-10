"use client";

import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { fetchMorePosts } from "@/actions/post-actions";
import { Icons } from "@/components/shared/icons";
import { PostCard } from "@/components/specific/post-card";
import { IPostStringified } from "@/types/types";

export function PostsScroll({
  posts: initialPosts,
}: {
  posts: IPostStringified[];
}) {
  const [ref, inView] = useInView();
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState(initialPosts);

  const loadMorePosts = useCallback(async () => {
    const next = page + 1;
    const { ok, posts } = await fetchMorePosts({
      page: next,
    });
    if (ok && posts.length) {
      setPage(next);
      setPosts((prevPosts) => [
        ...(prevPosts.length ? prevPosts : []),
        ...(posts as IPostStringified[]),
      ]);
    }
  }, [posts]);

  useEffect(() => {
    if (inView) {
      loadMorePosts();
    }
  }, [inView]);

  return (
    <>
      {posts.map((e: IPostStringified) => (
        <PostCard key={e._id} postData={e} />
      ))}

      <div
        className="flex h-20 w-full items-center justify-center pb-32 pt-10"
        ref={ref}
      >
        <Icons.spinner className="mr-2 h-10 w-10 animate-spin" />
      </div>
    </>
  );
}
