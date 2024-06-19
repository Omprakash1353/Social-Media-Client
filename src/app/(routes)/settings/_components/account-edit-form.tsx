"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/helpers/errorMessageHandler";
import { User } from "@/models/user.model";
import { AccountFormValues, accountFormSchema } from "@/schemas";
import { editUserData } from "@/actions/user-actions";

interface FileWithPreview extends File {
  preview: string;
}

type EditableUserProfileData = Pick<User, "username"> &
  Partial<Pick<User, "avatar" | "bio" | "gender">>;

export function AccountEditForm({
  defaultValues,
}: {
  defaultValues: EditableUserProfileData;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    defaultValues.avatar?.secure_url || null,
  );
  const [files, setFiles] = useState<FileWithPreview | null>(null);
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      username: defaultValues.username,
      bio: defaultValues.bio,
      gender: defaultValues.gender,
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    try {
      const formData = new FormData();
      if (data.username) formData.set("username", data.username);
      if (data.bio) formData.set("bio", data.bio);
      if (data.gender) formData.set("gender", data.gender);
      if (data.avatar) formData.set("avatar", data.avatar);
      const res = await editUserData(formData);
      if (res.ok) {
        toast.success(res.message);
        form.reset();
      }
    } catch (error: unknown) {
      const errMessage = getErrorMessage(error);
      console.error(errMessage);
      toast("Error", {
        description: `${errMessage}`,
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      setFiles(fileWithPreview);
      setAvatarUrl(null);
      form.setValue("avatar", file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </FormControl>
              {(files?.preview || avatarUrl) && (
                <div className="mt-2">
                  <Image
                    src={files?.preview || avatarUrl || ""}
                    alt="Avatar Preview"
                    className="h-20 w-20 object-cover"
                    width={80}
                    height={80}
                  />
                </div>
              )}
              <FormDescription>Upload a profile picture.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Your bio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
}
