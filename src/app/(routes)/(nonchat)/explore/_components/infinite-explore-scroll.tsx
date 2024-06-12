// "use client";

// import { useEffect } from "react";
// import Image from "next/image";
// import { useInView } from "react-intersection-observer";
// import { useInfiniteQuery } from "@tanstack/react-query";

// import { PostExplorerType } from "@/types/types";
// import { fetchMoreExplorePosts } from "@/actions/post-actions";
// import { Icons } from "@/components/shared/icons";

// export function InfiniteExploreScroll({
//   initialPosts,
// }: {
//   initialPosts: PostExplorerType[] | [];
// }) {
//   const [ref, inView] = useInView();

//   const fetchPosts = async ({ pageParam = 1 }: { pageParam?: number }) => {
//     const res = await fetchMoreExplorePosts({ page: pageParam });
//     return res;
//   };

//   const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
//     useInfiniteQuery({
//       queryKey: ["explore-page-posts"],
//       queryFn: fetchPosts,
//       initialPageParam: 2,
//       getNextPageParam: (lastPage, allPages) =>
//         lastPage.length ? allPages.length + 1 : undefined,
//       initialData: {
//         pageParams: [1],
//         pages: [initialPosts],
//       },
//     });

//   useEffect(() => {
//     if (inView && hasNextPage) {
//       fetchNextPage();
//     }
//   }, [inView, hasNextPage, fetchNextPage]);

//   function getColumns(colIndex: number): PostExplorerType[] {
//     return data.pages.flatMap((page) =>
//       page.filter((post, index) => index % 3 === colIndex),
//     );
//   }

//   return (
//     <>
//       {[getColumns(0), getColumns(1), getColumns(2)].map((column, idx) => (
//         <div key={idx} className="flex flex-col gap-4">
//           {column.map((e) => (
//             <Image
//               key={e.media.asset_id}
//               src={e.media.secure_url}
//               placeholder="blur"
//               blurDataURL={e.media.blur_url}
//               sizes="100vw"
//               alt="image"
//               height={300}
//               width={500}
//             />
//           ))}
//         </div>
//       ))}

//       <div
//         className="flex h-20 w-full items-center justify-center pb-32 pt-10"
//         ref={ref}
//       >
//         {isFetchingNextPage && (
//           <Icons.spinner className="mr-2 h-10 w-10 animate-spin" />
//         )}
//       </div>
//     </>
//   );
// }
