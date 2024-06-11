"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";

export function CreateStoryForm() {
  const [img, setImg] = useState<File | null>();
  return (
    <>
      <div className="h-full w-96 border-[1px] border-[#292524]">
        <Image
          src={
            "https://images.unsplash.com/photo-1714138667818-b545353d768a?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt={"preview"}
          height={1000}
          width={1000}
          className="h-full w-full object-contain object-center p-1"
        />
      </div>
      <Card className="flex flex-col border-none">
        <CardHeader>
          <CardTitle>Post Story</CardTitle>
          <CardDescription>Upload media to post story</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="aspect-square h-[400px] border-[1px] border-[#292524]"></div>
        </CardContent>
        <CardFooter className="self-center">
          <Button>Post Story</Button>
        </CardFooter>
      </Card>
    </>
  );
}
