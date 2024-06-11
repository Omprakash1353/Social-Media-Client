import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] max-w-full rounded-lg border"
    >
      <ResizablePanel minSize={60} defaultSize={60}>
        {children}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} minSize={25} maxSize={25}>
        <div>Chatbar</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
