"use client";

import { PhoneOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useRouter } from "next/navigation";

import { useSocket } from "@/context/socket-provider";
import { useSocketEvents } from "@/hooks/useSocketEvents";
import peer from "@/services/peer";
import { useDispatch, useSelector } from "react-redux";
import { selectRemoteUserSocketId, setRemoteUserSocketId } from "@/redux/reducers/video-call";

export function VideoCallComponent({ callId }: { callId: string }) {
  const { socket } = useSocket();
  const router = useRouter();
  const remoteSocketId = useSelector(selectRemoteUserSocketId);
  const dispatch = useDispatch();
  const [myStream, setMyStream] = useState<MediaStream | any>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const handleEndCall = () => {
    console.log("HANDLE_END_CALL");
    socket.emit("end-call", callId);
    router.push(`/chat/${callId}`);
  };

  const handleUserJoined = useCallback(
    (data: { userId: string; id: string }) => {
      console.log("VIDEO:ROOM:JOIN", data);
      dispatch(setRemoteUserSocketId(data.id));
      handleCallUser();
    },
    [],
  );

  const handleCallUser = useCallback(async () => {
    console.log("HANDLE_CALL_USER");
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      dispatch(setRemoteUserSocketId(from));
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket],
  );

  const sendStreams = useCallback(() => {
    console.log("SEND_STREAM");
    if (myStream)
      for (const track of myStream?.getTracks()) {
        peer?.peer?.addTrack(track, myStream);
      }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }: { from: string; ans: RTCSessionDescriptionInit }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams],
  );

  const handleNegoNeeded = useCallback(async () => {
    console.log("HANDLE_NEGO_NEEDED");
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    console.log("PEER_EFFECT");
    peer?.peer?.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer?.peer?.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      console.log("HANDLE_NEGO_INCOMING");
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket],
  );

  const handleNegoNeedFinal = useCallback(
    async ({ ans }: { ans: RTCSessionDescriptionInit }) => {
      console.log("HANDLE_NEGO_FINAL");
      await peer.setLocalDescription(ans);
    },
    [],
  );

  useEffect(() => {
    console.log("PEER_TRACK");
    peer?.peer?.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const eventHandler = {
    ["user:joined"]: handleUserJoined,
    ["incomming:call"]: handleIncommingCall,
    ["call:accepted"]: handleCallAccepted,
    ["peer:nego:needed"]: handleNegoNeedIncomming,
    ["peer:nego:final"]: handleNegoNeedFinal,
  };

  useSocketEvents(socket, eventHandler);

  return (
    <>
      <div className="mx-2 flex h-full w-4/6 flex-col items-center justify-center gap-3">
        {/* Others Video */}
        <div className="aspect-video w-full bg-stone-900">
          {remoteStream && <ReactPlayer playing muted url={remoteStream} />}
        </div>
        <div className="flex items-center justify-center">
          <div
            className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-red-500"
            onClick={handleEndCall}
          >
            <PhoneOff className="text-white" size={40} />
          </div>
        </div>
      </div>
      <div className="mx-2 flex w-2/6 items-center justify-center">
        {/* Self Video */}
        <div className="aspect-video w-full bg-stone-900">
          <ReactPlayer playing muted url={myStream} />
        </div>
      </div>
    </>
  );
}
