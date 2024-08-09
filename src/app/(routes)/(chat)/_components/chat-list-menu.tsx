"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { ChangeEvent, useState } from "react";

import { getSearchedUsers } from "@/actions/user-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";

export function ChatListMenu() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedValue = useDebounce(search, 500);
  const [isOpen, setIsOpen] = useState(false);
  const [grpName, setGrpName] = useState("");
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState<
    { _id: string; username: string; avatar: string }[]
  >([]);

  const { isLoading, data } = useQuery({
    queryKey: ["search", debouncedValue],
    queryFn: async () => {
      if (debouncedValue === "") return [];
      const res = await getSearchedUsers(
        debouncedValue,
        members.map((e) => e._id),
      );
      return res;
    },
    staleTime: 0,
    enabled: debouncedValue !== "",
  });

  const { mutateAsync: createGrpChatMutation } = useMutation({
    mutationFn: async (data: { name: string; members: string[] }) => {
      const response = await fetch("http://localhost:4000/api/v1/chat/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create group chat");
      }
      return responseData;
    },
    onSuccess: (data: any) => {
      router.push(`/chat/${data.data.id}`);
      setMembers([]);
      setSearch("");
      setGrpName("");
      setLoading(false);
    },
    onError: (error) => {
      console.error(error);
      setLoading(false);
    },
  });

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function handleMemberClick(member: {
    _id: string;
    username: string;
    avatar: string;
  }) {
    if (!members.some((m) => m._id === member._id)) {
      setMembers((prev) => [...prev, member]);
    }
  }

  function removeMember(memberId: string) {
    setMembers((prev) => prev.filter((member) => member._id !== memberId));
  }

  async function handleCreateGroup() {
    const memberIds = members.map((member) => member._id);
    setLoading(true);
    await createGrpChatMutation({
      name: grpName,
      members: memberIds,
    });
  }

  const handleDialogOpen = (e: boolean) => {
    setIsOpen(e);
    if (!e) {
      setMembers([]);
      setSearch("");
      setGrpName("");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger>
          <PlusCircle className="mr-5 h-5 w-5 cursor-pointer" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group Chat</DialogTitle>
            <DialogDescription>
              Add members in order to form a group
            </DialogDescription>
          </DialogHeader>
          <Input placeholder="Search..." onChange={handleSearchChange} />
          {data &&
            data.length > 0 &&
            data.map((e) => (
              <div
                key={e._id}
                className="mt-2 flex cursor-pointer items-center justify-center rounded-md px-4 py-2"
                onClick={() =>
                  handleMemberClick({
                    _id: e._id,
                    username: e.username,
                    avatar: e.avatar?.secure_url,
                  })
                }
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
            <div className="flex w-full justify-center">Loading...</div>
          )}
          <div className="mt-4">
            <h3 className="text-lg font-medium">Selected Members:</h3>
            {members.length === 0 && (
              <p className="text-sm text-gray-500">No members selected.</p>
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
                      {member.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium leading-none">
                    {member.username}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeMember(member._id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Input
            type="text"
            placeholder="Group Name"
            className="w-full"
            onChange={(e) => setGrpName(e.target.value)}
          />
          <Button
            className="mt-10 w-full"
            disabled={members.length === 0 || !grpName || loading}
            onClick={handleCreateGroup}
          >
            Create Group
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
