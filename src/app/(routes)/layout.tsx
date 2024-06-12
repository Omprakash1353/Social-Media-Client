import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { serverSession } from "@/hooks/useServerSession";
import { ResizableComponents } from "./_components/resizable-components";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await serverSession();

  const layout = cookies().get("react-resizable-panels:layout");

  const defaultLayout = layout
    ? JSON.parse(layout.value)
    : [20, 80];

  const navCollapsedSize = 4;

  if (!session?.user.name) return redirect("/auth/sign-in");

  return (
    <div className="h-full flex-col md:flex">
      <ResizableComponents
        myProfileId={session?.user.name}
        defaultLayout={defaultLayout}
        navCollapsedSize={navCollapsedSize}
      >
        {children}
      </ResizableComponents>
    </div>
  );
}
