import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import type { Socket } from "socket.io-client";

export function useCall(socket: Socket | null, userId: string) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [call, setCall] = useState<any>(null);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<any>(null);

  // 🔹 1. Handle incoming call events (no camera access here)
  useEffect(() => {
    if (!socket) return;

    socket.on("incomingCall", ({ from, signalData, callType }) => {
      console.log("📞 Incoming call from:", from, "type:", callType);
      setCall({ isReceivingCall: true, from, signal: signalData, callType });
    });

    socket.on("callEnded", () => {
      console.log("🚪 Call ended");
      endStream();
      setCallEnded(true);
      connectionRef.current?.destroy();
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callEnded");
    };
  }, [socket]);

  // 🔹 2. Get media only when needed
  const getMediaStream = async (callType: "video" | "audio") => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      setStream(media);
      if (myVideo.current && callType === "video") {
        myVideo.current.srcObject = media;
      }
      return media;
    } catch (err) {
      console.error("🎥 Media error:", err);
      return null;
    }
  };

  // 🔹 3. Answer call
  const answerCall = async () => {
    if (!socket || !call) return;
    console.log("✅ Answering call...");

    const media = await getMediaStream(call.callType);
    if (!media) return;

    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: media,
      config: { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] },
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signalData: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current && call.callType === "video") {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  // 🔹 4. Start (initiate) call
  const callUser = async (id: string, callType: "video" | "audio" = "video") => {
    if (!socket) return;

    const media = await getMediaStream(callType);
    if (!media) return;

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: media,
      config: { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] },
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        to: id,
        from: userId,
        signalData: data,
        callType,
      });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current && callType === "video") {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal.signalData);
    });

    connectionRef.current = peer;
  };

  // 🔹 5. End call
  const leaveCall = () => {
    console.log("❌ Ending call...");
    setCallEnded(true);
    connectionRef.current?.destroy();
    endStream();
    if (socket && call) socket.emit("endCall", { to: call.from });
  };

  // 🔹 6. Helper to stop camera & mic
  const endStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (myVideo.current) myVideo.current.srcObject = null;
    if (userVideo.current) userVideo.current.srcObject = null;
  };

  return {
    myVideo,
    userVideo,
    call,
    callAccepted,
    callEnded,
    callUser,
    answerCall,
    leaveCall,
  };
}
