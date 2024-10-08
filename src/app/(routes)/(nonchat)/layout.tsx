import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SuggestionBar } from "@/components/shared/suggestion-bar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] max-w-full rounded-lg border"
    >
      <ResizablePanel minSize={75} defaultSize={75}>
        {children}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} minSize={25} maxSize={25}>
        <SuggestionBar />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
