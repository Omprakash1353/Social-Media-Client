"use client";

import { Searchbar } from "@/components/shared/searchbar";
import { Sidebar } from "@/components/shared/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";

export function ResizableComponents({
  defaultLayout,
  navCollapsedSize,
  myProfileId,
  children,
}: {
  defaultLayout: number[];
  navCollapsedSize: number;
  myProfileId: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes,
          )}`;
        }}
        className="h-full w-full items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={15}
        >
          <Sidebar myProfileId={myProfileId} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Searchbar />
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
