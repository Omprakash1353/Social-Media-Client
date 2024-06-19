import { Separator } from "@/components/ui/separator";
import { AccountPrivacyForm } from "../_components/account-privacy-form";
import { serverSession } from "@/hooks/useServerSession";
import { dbConnect } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";
import { ObjectType } from "@/types/types";

export default async function SettingsProfilePage() {
  const session = await serverSession();

  await dbConnect();

  const userAccountType = (await UserModel.findById(session?.user._id).select(
    "account_Type",
  )) as { _id: ObjectType; account_Type: "PUBLIC" | "PRIVATE" };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Privacy</h3>
        <p className="text-sm text-muted-foreground">
          When your account is public, your profile and posts can be seen by
          anyone, on or off Instagram, even if they don&apos;t have an Instagram
          account.
        </p>
      </div>
      <Separator />
      <AccountPrivacyForm
        isPrivateAccount={userAccountType.account_Type === "PRIVATE"}
      />
    </div>
  );
}
