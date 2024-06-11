"use client";

import Image from "next/image";
import { KeyboardEvent, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CircleX, CloudUpload } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PostFormSchema, PostFormSchemaType } from "@/schemas";
import { createPostAction } from "@/actions/post-actions";
import { getErrorMessage } from "@/helpers/errorMessageHandler";

interface CreatePostFormProps {
  className?: string;
}

interface FileWithPreview extends File {
  preview: string;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
  className,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<PostFormSchemaType>({
    resolver: zodResolver(PostFormSchema),
    defaultValues: {
      caption: "",
      location: "",
      isCommentOn: true,
      isLikesAndCommentVisible: true,
      hashTags: [],
      media: [],
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      if (inputValue.trim().startsWith("#"))
        setTags([...tags, inputValue.trim()]);
      else setTags([...tags, `#${inputValue.trim()}`]);
      setValue("hashTags", [...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = useCallback(
    (tag: string) => {
      const newTags = tags.filter((t) => t !== tag);
      setTags(newTags);
      setValue("hashTags", newTags);
    },
    [tags, setValue],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length && acceptedFiles?.length < 6) {
        setFiles((previousFiles) => [
          ...previousFiles,
          ...acceptedFiles.map((file) =>
            Object.assign(file, { preview: URL.createObjectURL(file) }),
          ),
        ]);
        setValue("media", [...(watch("media") || []), ...acceptedFiles]);
      } else {
        console.error("File to large to upload");
      }
    },
    [setValue, watch],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxSize: 1024 * 1000,
    maxFiles: 1,
    onDrop,
  });

  useEffect(() => {
    // Revoke the data uris to avoid memory leaks
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const removeFile = (name: string) => {
    const newFiles = files.filter((file) => file.name !== name);
    setFiles(newFiles);
    setValue("media", newFiles);
  };

  const removeAll = () => {
    setFiles([]);
    setValue("media", []);
  };

  const onSubmit = async (data: PostFormSchemaType) => {
    try {
      const formData = new FormData();
      formData.set("caption", data.caption as string);
      formData.set("location", data.location as string);
      formData.set("isCommentOn", data.isCommentOn ? "true" : "false");
      formData.set(
        "isLikesAndCommentVisible",
        data.isLikesAndCommentVisible ? "true" : "false",
      );
      data.hashTags?.forEach((hashTag) => formData.append("hashTags", hashTag));
      data.media?.forEach((file) => formData.append("media", file));

      const result = await createPostAction(formData);
      if (result.ok) {
        toast(result.message, {
          description: `Post created ${result?.data} | ${result.status}`,
        });
      } else {
        console.error(result.error);
        toast("Error", {
          description: `${result.error} | ${result.status}`,
        });
      }
    } catch (error: unknown) {
      const errMessage = getErrorMessage(error);
      console.error(errMessage);
      toast("Error", {
        description: `${errMessage}`,
      });
    }

    removeAll();
    setTags([]);
    reset();
  };

  return (
    <ScrollArea className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full p-5">
        <div
          {...getRootProps({
            className: className,
          })}
        >
          <input {...getInputProps({ name: "file" })} />
          <div className="flex flex-col items-center justify-center gap-4 border-2 border-dashed p-10 text-sm">
            <CloudUpload className="h-10 w-10" />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag & drop files here, or click to select files</p>
            )}
          </div>
        </div>

        {/* Preview */}
        <section className="mt-10 h-auto">
          <div className="flex items-center justify-center">
            <Button type="button" onClick={removeAll}>
              Remove all files
            </Button>
          </div>

          {/* Accepted files */}
          <ul className="mb-5 mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-8">
            {files.map((file) => (
              <li
                key={file.name}
                className="relative h-32 rounded-md shadow-lg"
              >
                <Image
                  src={file.preview}
                  alt={file.name}
                  width={100}
                  height={100}
                  onLoad={() => {
                    URL.revokeObjectURL(file.preview);
                  }}
                  className="h-full w-auto rounded-md object-contain"
                />
                <button
                  type="button"
                  className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-white"
                  onClick={() => removeFile(file.name)}
                >
                  <CircleX className="h-5 w-5 transition-all duration-150 hover:fill-red-500" />
                </button>
                <p className="mt-2 text-[12px] font-medium text-stone-500">
                  {file.name}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex w-full flex-col gap-5">
          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              placeholder="Write a caption..."
              {...register("caption")}
              id="caption"
            />
            {errors.caption && (
              <p className="text-red-500">{errors.caption.message}</p>
            )}
          </div>
          <div className="flex w-full flex-col gap-2">
            <Label>Location</Label>
            <Input placeholder="Add location" {...register("location")} />
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-col gap-2">
              <Label>Tag</Label>
              <Input
                placeholder="Add Tag"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              {tags &&
                tags.map((tag, index) => (
                  <Badge key={index}>
                    <span>{tag}</span> &nbsp;
                    <CircleX
                      onClick={() => removeTag(tag)}
                      className="h-4 cursor-pointer text-xs font-bold text-muted"
                    />
                  </Badge>
                ))}
            </div>
          </div>
          <div className="flex w-full justify-between">
            <Label>Hide like and view counts on this post</Label>
            <Switch
              {...register("isLikesAndCommentVisible")}
              onCheckedChange={(value) =>
                setValue("isLikesAndCommentVisible", !value)
              }
            />
          </div>
          <div className="flex w-full justify-between">
            <Label>Turn off commenting</Label>
            <Switch
              {...register("isCommentOn")}
              onCheckedChange={(value) => setValue("isCommentOn", !value)}
            />
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Create Post"}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};
