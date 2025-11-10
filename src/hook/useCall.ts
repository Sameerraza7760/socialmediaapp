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
  const connectionRef = useRef<Peer.Instance | null>(null);

  // 🔹 Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ from, signalData, callType }: any) => {
      setCall({
        isReceivingCall: true,
        from,
        signal: signalData,
        callType,
      });
      setCallAccepted(false);
      setCallEnded(false);
    };

    const handleCallAccepted = ({ signalData }: any) => {
      if (connectionRef.current) {
        connectionRef.current.signal(signalData);
        setCallAccepted(true);
      }
    };

    const handleCallEnded = () => {
      handleCallEnd();
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callEnded", handleCallEnded);
    };
  }, [socket]);

  // 🔹 Get user media (camera/mic)
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
      console.error("Media error:", err);
      return null;
    }
  };

  // 🔹 Answer an incoming call
  const answerCall = async () => {
    if (!socket || !call) return;
    const media = await getMediaStream(call.callType);
    if (!media) return;

    setCallAccepted(true);
    setCallEnded(false);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: media,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
    });

    peer.on("signal", (signalData) => {
      socket.emit("answerCall", { signalData, to: call.from });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current && call.callType === "video") {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  
  const callUser = async (id: string, callType: "video" | "audio" = "video") => {
    if (!socket) return;
    const media = await getMediaStream(callType);
    console.log("media",media)
    if (!media) return;

    setCallEnded(false);
    setCallAccepted(false);

    // ✅ Set call state for outgoing call (important for modal)
    setCall({
      isReceivingCall: false,
      from: userId,
      to: id,
      callType,
    });

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: media,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
    });

    peer.on("signal", (signalData) => {
      socket.emit("callUser", { to: id, from: userId, signalData, callType });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current && callType === "video") {
        userVideo.current.srcObject = remoteStream;
      }
    });

    connectionRef.current = peer;
  };

  // 🔹 Leave or end call
  const leaveCall = () => {
    if (socket && call?.from) {
      socket.emit("endCall", { to: call.from });
    }
    handleCallEnd();
  };

  // 🔹 Handle call cleanup
  const handleCallEnd = () => {
    setCallEnded(true);
    setCallAccepted(false);
    setCall(null);

    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
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

