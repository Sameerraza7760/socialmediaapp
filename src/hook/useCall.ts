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

  // 🎥 1. Get media stream
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      })
      .catch((err) => console.error("Media error:", err));
  }, []);

  // 📞 2. Listen for incoming calls
  useEffect(() => {
    if (!socket) return;

    socket.on("incomingCall", ({ from, name, signal }) => {
      setCall({ isReceivingCall: true, from, name, signal });
    });

    socket.on("callEnded", () => {
      setCallEnded(true);
      connectionRef.current?.destroy();
    });

    return () => {
      socket.off("callIncoming");
      socket.off("callEnded");
    };
  }, [socket]);

  // 📲 3. Answer Call
  const answerCall = () => {
    if (!socket || !stream) return;

    setCallAccepted(true);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
      },
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  // 📞 4. Call another user
  const callUser = (id: string) => {
    if (!socket || !stream) return;

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: ["stun:stun.l.google.com:19302"] }, // Google STUN
        ],
      },
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        to: id,
        signalData: data, // not `signal`
        from: userId,
      });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  // 🚪 5. Leave Call
  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current?.destroy();
    if (socket) socket.emit("endCall", { to: call?.from });
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
