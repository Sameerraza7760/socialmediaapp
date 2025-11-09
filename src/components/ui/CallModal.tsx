"use client";
import React from "react";

type CallModalProps = {
  myVideo: React.RefObject<HTMLVideoElement>;
  userVideo: React.RefObject<HTMLVideoElement>;
  callAccepted: boolean;
  callEnded: boolean;
  leaveCall: () => void;
};

export default function CallModal({
  myVideo,
  userVideo,
  callAccepted,
  callEnded,
  leaveCall,
}: CallModalProps) {
  if (!callAccepted || callEnded) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative bg-gray-900 p-4 rounded-2xl w-[90%] max-w-lg">
        <video
          playsInline
          muted
          ref={myVideo}
          autoPlay
          className="w-1/3 absolute bottom-4 right-4 rounded-lg border"
        />
        <video
          playsInline
          ref={userVideo}
          autoPlay
          className="w-full rounded-lg"
        />
        <button
          onClick={leaveCall}
          className="absolute top-3 right-3 bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
