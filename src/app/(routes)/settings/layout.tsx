import { SidebarNav } from "./_components/sidebar-nav";

const sidebarNavItems = [
  {
    title: "Edit Profile",
    href: "/settings/edit",
  },
  {
    title: "Account privacy",
    href: "/settings/privacy",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
