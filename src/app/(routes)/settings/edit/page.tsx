import { Separator } from "@/components/ui/separator";
import { AccountEditForm } from "../_components/account-edit-form";
import { dbConnect } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";
import { serverSession } from "@/hooks/useServerSession";

export default async function Page() {
  await dbConnect();
  const session = await serverSession();

  const userData = await UserModel.findById(session?.user._id).select(
    "username avatar bio gender",
  );

  const parsedData = JSON.parse(JSON.stringify(userData));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Profile</h3>
        <p className="text-sm text-muted-foreground">
          Update your account profile.
        </p>
      </div>
      <Separator />
      <AccountEditForm defaultValues={parsedData} />
    </div>
  );
}
