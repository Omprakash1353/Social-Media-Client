import { VideoCallComponent } from "../components/video-call";

export default function Page({ params }: { params: { callId: string } }) {
  return (
    <div className="flex h-full w-full gap-2 overflow-hidden">
      <VideoCallComponent callId={params.callId} />
    </div>
  );
}
