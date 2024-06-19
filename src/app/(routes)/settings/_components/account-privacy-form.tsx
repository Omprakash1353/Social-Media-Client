"use client";

import { useState } from "react";

import { changeUserAccountType } from "@/actions/user-actions";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function AccountPrivacyForm({
  isPrivateAccount,
}: {
  isPrivateAccount: boolean;
}) {
  const [isPrivate, setIsPrivate] = useState(isPrivateAccount);

  async function accountChangeAccount(e: boolean) {
    try {
      setIsPrivate(e);
      const res = await changeUserAccountType(e);
      setIsPrivate(res.account_Type === "PRIVATE");
    } catch (error) {
      setIsPrivate(!e);
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div>Private account</div>
      <div>
        <Switch checked={isPrivate} onCheckedChange={accountChangeAccount} />
      </div>
    </div>
  );
}
