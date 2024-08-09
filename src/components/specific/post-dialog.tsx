import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPostByID } from "@/actions/post-actions";
import { PostCard } from "./post-card";

export function PostDialog({
  _id,
  media,
}: {
  _id: string;
  media: { asset_id: string; secure_url: string; blur_url: string };
}) {
  const { isLoading, data } = useQuery({
    queryKey: [`post-${_id}`],
    queryFn: async () => {
      const res = await getPostByID(_id);
      return res;
    },
  });

  return (
    <Dialog>
      <DialogTrigger>
        <Image
          key={media.asset_id}
          src={media.secure_url}
          placeholder="blur"
          blurDataURL={media.blur_url}
          sizes="100vw"
          alt="image"
          height={300}
          width={500}
          className="rounded-md"
        />
      </DialogTrigger>
      <DialogContent>
        {isLoading ? (
          "Loading..."
        ) : (
          <div className="grid grid-cols-2 gap-10">
            <PostCard postData={data} />
            <div className="">Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis, ipsam!</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
