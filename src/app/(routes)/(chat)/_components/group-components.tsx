import { useDebounce } from "@/hooks/useDebounce";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getSearchedUsers } from "@/actions/user-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Member } from "@/types/types";
import { getErrorMessage } from "@/helpers/errorMessageHandler";

const removeUser = z.object({
  members: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "At least one user is needed to be selected.",
  }),
});

const renameGroup = z.object({
  name: z
    .string()
    .min(2, { message: "Group name must be at least 2 characters" })
    .max(15, { message: "Group name must be less than 15 characters" }),
});

const addMembers = z.object({
  members: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "At least one user is needed to be selected.",
  }),
});

export function GroupComponents({
  open,
  setOpen,
  chatId,
  username,
  sessionUser,
  otherMembers,
  isAdmin = true,
}: {
  open: boolean;
  setOpen: (e: boolean) => void;
  chatId: string;
  username: string;
  sessionUser: Member | null;
  otherMembers: Member[];
  isAdmin?: boolean;
}) {
  const [renaming, setRenaming] = useState(false);
  const [openAddMembers, setOpenAddMembers] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedValue = useDebounce(search, 500);
  const [members, setMembers] = useState<
    { _id: string; username: string; avatar: string }[]
  >([]);

  const { isLoading, data } = useQuery({
    queryKey: ["search", debouncedValue],
    queryFn: async () => {
      if (debouncedValue === "") return [];
      const res = await getSearchedUsers(
        debouncedValue,
        otherMembers.map((e) => e._id),
      );
      return res;
    },
    staleTime: 0,
    enabled: debouncedValue !== "",
  });

  const removeUserForm = useForm<z.infer<typeof removeUser>>({
    resolver: zodResolver(removeUser),
    defaultValues: {
      members: [],
    },
  });

  async function onRemoveUserSubmit(data: z.infer<typeof removeUser>) {
    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/chat/removemembers`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            chatId,
            members: data.members,
          }),
        },
      );
      const parsedRes = await res.json();
      toast(parsedRes.message);
    } catch (error: unknown) {
      const err = getErrorMessage(error);
      console.error(err);
      toast("Error", {
        description: err,
      });
    }
  }

  const renameGroupForm = useForm<z.infer<typeof renameGroup>>({
    resolver: zodResolver(renameGroup),
    defaultValues: {
      name: username,
    },
  });

  async function onRenameGroupSubmit(data: z.infer<typeof renameGroup>) {
    try {
      setRenaming((prev) => !prev);
      if (username === data.name) return;
      const res = await fetch(`http://localhost:4000/api/v1/chat/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
        }),
      });
      const parsedRes = await res.json();
      toast(parsedRes.message);
    } catch (error: unknown) {
      const err = getErrorMessage(error);
      console.error(err);
      toast("Error", {
        description: err,
      });
    }
  }

  const addMembersForm = useForm<z.infer<typeof addMembers>>({
    resolver: zodResolver(addMembers),
    defaultValues: {
      members: [],
    },
  });

  async function onAddMembersSubmit(data: z.infer<typeof addMembers>) {
    try {
      setOpenAddMembers(false);
      const res = await fetch("http://localhost:4000/api/v1/chat/addmembers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          chatId,
          members: data.members,
        }),
      });
      const parsedRes = await res.json();
      toast(parsedRes.message);
    } catch (error: unknown) {
      const err = getErrorMessage(error);
      console.error(err);
      toast("Error", {
        description: err,
      });
    }
  }

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function removeMember(memberId: string) {
    setMembers((prev) => prev.filter((member) => member._id !== memberId));
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{username}</SheetTitle>
          <SheetDescription>Chat Details</SheetDescription>
        </SheetHeader>
        {isAdmin && (
          <div className="flex flex-col items-center justify-center gap-4 py-5">
            <Button onClick={() => setOpenAddMembers(true)}>Add Members</Button>
            <Dialog open={openAddMembers} onOpenChange={setOpenAddMembers}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Members</DialogTitle>
                  <DialogDescription>
                    Add members to the group
                  </DialogDescription>
                </DialogHeader>
                <Form {...addMembersForm}>
                  <form
                    onSubmit={addMembersForm.handleSubmit(onAddMembersSubmit)}
                  >
                    <FormField
                      control={addMembersForm.control}
                      name="members"
                      render={({ field }) => (
                        <>
                          <Input
                            placeholder="Search..."
                            onChange={handleSearchChange}
                          />
                          {data &&
                            data.length > 0 &&
                            data.map((e) => (
                              <div
                                key={e._id}
                                className="mt-2 flex cursor-pointer items-center justify-center rounded-md px-4 py-2"
                                onClick={() => {
                                  const newMember = {
                                    _id: e._id,
                                    username: e.username,
                                    avatar: e.avatar?.secure_url,
                                  };
                                  if (!field.value.includes(e._id)) {
                                    field.onChange([...field.value, e._id]);
                                    setMembers((prev) => [...prev, newMember]);
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-4">
                                  <Avatar>
                                    <AvatarImage src={e.avatar?.secure_url} />
                                    <AvatarFallback>
                                      {e.username.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm font-medium leading-none">
                                    {e.username}
                                  </p>
                                </div>
                              </div>
                            ))}
                          {isLoading && (
                            <div className="flex w-full justify-center">
                              Loading...
                            </div>
                          )}
                          <div className="mt-4">
                            <h3 className="text-lg font-medium">
                              Selected Members:
                            </h3>
                            {members.length === 0 && (
                              <p className="text-sm text-gray-500">
                                No members selected.
                              </p>
                            )}
                            {members.map((member) => (
                              <div
                                key={member._id}
                                className="mt-2 flex w-full items-center justify-between space-x-4 rounded-md p-2"
                              >
                                <div className="flex items-center space-x-4">
                                  <Avatar>
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>
                                      {member.username
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm font-medium leading-none">
                                    {member.username}
                                  </p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    field.onChange(
                                      field.value.filter(
                                        (id) => id !== member._id,
                                      ),
                                    );
                                    removeMember(member._id);
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    />
                    <DialogClose className="w-full pt-3">
                      <Button type="submit" className="w-full">
                        Add members
                      </Button>
                    </DialogClose>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button onClick={() => setRenaming(true)}>Rename Group</Button>
            <Dialog open={renaming} onOpenChange={setRenaming}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename Group</DialogTitle>
                  <DialogDescription>
                    Enter a new name for the group
                  </DialogDescription>
                </DialogHeader>
                <Form {...renameGroupForm}>
                  <form
                    onSubmit={renameGroupForm.handleSubmit(onRenameGroupSubmit)}
                  >
                    <FormField
                      control={renameGroupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Group name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="w-full pt-3">
                      <div className="flex items-center justify-center gap-4">
                        <Button variant="secondary">Cancel</Button>
                        <Button type="submit">Submit</Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}
        <div className="flex flex-col justify-center gap-3">
          <h6 className="my-4 self-center">Participants</h6>
          {sessionUser && (
            <div className="flex items-center gap-3 px-5">
              <Avatar>
                <AvatarImage src={sessionUser.avatar?.secure_url} />
                <AvatarFallback>
                  {sessionUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>You</div>
            </div>
          )}
          <Form {...removeUserForm}>
            <form
              onSubmit={removeUserForm.handleSubmit(onRemoveUserSubmit)}
              className="space-y-3"
            >
              {otherMembers.map((e) => (
                <FormField
                  key={e._id}
                  control={removeUserForm.control}
                  name="members"
                  render={({ field }) => {
                    return (
                      <FormItem key={e._id}>
                        <FormControl>
                          <div className="flex items-center justify-between px-5">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={e?.avatar?.secure_url} />
                                <AvatarFallback>
                                  {e.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>{e.name}</div>
                            </div>
                            {isAdmin && (
                              <Checkbox
                                checked={field.value?.includes(e._id)}
                                id={e._id}
                                onCheckedChange={(checked) =>
                                  checked
                                    ? field.onChange([...field.value, e._id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== e._id,
                                        ),
                                      )
                                }
                              />
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
              ))}
              {isAdmin && (
                <div className="flex items-center justify-center">
                  <Button type="submit">Remove Members</Button>
                </div>
              )}
            </form>
          </Form>
        </div>
        <div className="my-4 flex flex-col items-center justify-center gap-4">
          <Button variant={"destructive"}>Leave Group</Button>
          <Button variant={"destructive"}>Delete Group</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
