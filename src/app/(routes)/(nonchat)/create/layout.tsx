import { NavTab } from "./_components/nav-tab";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full p-5">
      <NavTab />
      {children}
    </div>
  );
}
