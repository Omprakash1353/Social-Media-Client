"use client";

import {
  Bookmark,
  EllipsisVertical,
  Heart,
  MessageCircle,
  Pencil,
  Send,
  Trash,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { getTime } from "@/lib/utils";
import { IPostStringified } from "@/types/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

export function PostCard({ postData }: { postData: IPostStringified }) {
  const { data: session } = useSession();

  const [likes, setLikes] = useState<number>(postData?.likes?.length || 0);

  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDoubleClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsAnimating(true);

    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const pastTime = useMemo(
    () => getTime(postData?.createdAt),
    [postData?.createdAt],
  );

  return (
    <div className="post-card m-5">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${postData?.user?.username}`}>
            <Avatar>
              <AvatarImage src="/avatars/03.png" />
              <AvatarFallback>
                {postData?.user?.username.toUpperCase().substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex flex-col">
            <p className="text-base">
              <Link href={`/${postData?.user?.username}`}>
                {postData?.user?.username}{" "}
              </Link>
              • <span className="text-sm text-stone-600">{pastTime} ago</span>
            </p>
            <div className="flex-center gap-2">
              <p className="text-xs text-muted-foreground">
                {postData.location && postData.location}
              </p>
            </div>
          </div>
        </div>
        <PostDropdown
          post_id={postData._id}
          isOwnersPost={session?.user._id === postData?.user?._id}
        />
      </div>

      <div className="py-5 lg:text-sm">
        {postData.caption && (
          <pre className="w-full flex-wrap whitespace-pre-wrap font-inter">
            {postData.caption}
          </pre>
        )}
        <ul className="mt-2 flex flex-wrap gap-1">
          {postData.hashTags &&
            postData.hashTags.map((tag: string, index: number) => (
              <li key={`${tag}${index}`} className="text-sm text-blue-700">
                <Link href={`hashTag/${tag.substring(1, tag.length - 1)}`}>
                  {tag} &nbsp;
                </Link>
              </li>
            ))}
        </ul>
      </div>

      {postData.media && postData.media.length === 1 && (
        <div
          className="relative flex items-center justify-center"
          onDoubleClick={handleDoubleClick}
        >
          <Image
            src={postData.media[0].secure_url}
            alt="post image"
            className="cursor-pointer select-none object-contain object-center"
            width={582}
            height={382}
            sizes="100vw 100vh"
            loading="lazy"
            placeholder={postData.media[0].blur_url ? "blur" : "empty"}
            blurDataURL={postData.media[0].blur_url || ""}
          />
          <Heart
            className={`absolute cursor-pointer ${
              isAnimating ? "heart-animation" : "opacity-0"
            }`}
            style={{
              width: "100px",
              height: "100px",
              color: "red",
              fill: "red",
            }} // Adjust the size and color as needed
          />
        </div>
      )}

      {postData.media && postData.media.length > 1 && (
        <PostCarousel
          isAnimating={isAnimating}
          handleDoubleClick={handleDoubleClick}
          media={postData.media.map((mediaItem) => ({
            ...mediaItem,
          }))}
        />
      )}

      <div className={`z-20 flex items-center justify-between py-3`}>
        <div className="flex items-center gap-4">
          <Heart size={20} />
          <MessageCircle size={20} />
          <Send size={20} />
        </div>

        <div className="flex gap-2">
          <Bookmark size={20} />
        </div>
      </div>
      <span className="text-sm">{likes > 0 && <span>{likes} Likes</span>}</span>
      <div>
        <Input type="text" placeholder="Add comment" />
      </div>
    </div>
  );
}

function PostCarousel({
  media,
  isAnimating,
  handleDoubleClick,
}: {
  media: {
    secure_url: string;
    public_id: string;
    asset_id: string;
    blur_url?: string;
  }[];
  isAnimating: boolean;
  handleDoubleClick: () => void;
}) {
  return (
    <Carousel className="relative w-full" onDoubleClick={handleDoubleClick}>
      <CarouselContent className="relative w-full">
        {media.map((url, index) => (
          <CarouselItem className="w-full" key={url.public_id}>
            <Image
              key={index}
              src={url.secure_url}
              alt="slides"
              className="cursor-pointer select-none object-contain object-center"
              loading="lazy"
              sizes="100vw"
              width={582}
              height={300}
              placeholder={url.blur_url ? "blur" : "empty"}
              blurDataURL={url.blur_url || ""}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <Heart
        className={`absolute left-[40%] top-[40%] cursor-pointer ${isAnimating ? "heart-animation" : "opacity-0"}`}
        style={{
          width: "100px",
          height: "100px",
          color: "red",
          fill: "red",
        }}
      />
      <CarouselPrevious className="absolute left-4 top-2/4" />
      <CarouselNext className="absolute right-4 top-2/4" />
    </Carousel>
  );
}

function PostDropdown({
  post_id,
  isOwnersPost,
}: {
  post_id: string;
  isOwnersPost: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EllipsisVertical size={20} className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuItem className="cursor-pointer">
          <Pencil className="mr-5 h-4 w-4" /> Edit
        </DropdownMenuItem>
        {isOwnersPost && (
          <DropdownMenuItem className="cursor-pointer text-red-500">
            <Trash className="mr-5 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
