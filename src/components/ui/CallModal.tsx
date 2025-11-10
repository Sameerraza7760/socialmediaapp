"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Phone, PhoneOff } from "lucide-react";

type CallModalProps = {
  myVideo: React.RefObject<HTMLVideoElement>;
  userVideo: React.RefObject<HTMLVideoElement>;
  callAccepted: boolean;
  callEnded: boolean;
  leaveCall: () => void;
  call?: any;
  answerCall?: () => void;
};

export default function CallModal({
  myVideo,
  userVideo,
  callAccepted,
  callEnded,
  leaveCall,
  call,
  answerCall,
}: CallModalProps) {
  if (callEnded) return null;
  if (!call?.isReceivingCall && !callAccepted) return null;

  const isVideo = call?.callType === "video";
  const isAudio = call?.callType === "audio";

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white">
      {/* Incoming Call UI */}
      {!callAccepted && call?.isReceivingCall && (
        <div className="text-center space-y-6">
          <p className="text-lg font-medium">
            📞 Incoming {isAudio ? "Voice" : "Video"} Call...
          </p>

          <div className="flex justify-center gap-6">
            <Button
              onClick={answerCall}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Phone className="w-4 h-4" /> Accept
            </Button>
            <Button
              onClick={leaveCall}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" /> Decline
            </Button>
          </div>
        </div>
      )}

      {/* Active Call UI */}
      {callAccepted && !callEnded && (
        <>
          {/* 🎥 VIDEO CALL */}
          {isVideo && (
            <div className="relative w-full max-w-4xl flex justify-center items-center">
              <video
                playsInline
                ref={userVideo}
                autoPlay
                className="w-full max-h-[80vh] rounded-lg border border-gray-400 shadow-lg"
              />
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                className="w-1/3 rounded-lg absolute bottom-4 right-4 border border-gray-400 shadow-lg"
              />
              <Button
                onClick={leaveCall}
                className="absolute bottom-8 bg-red-600 hover:bg-red-700"
              >
                End Call
              </Button>
            </div>
          )}

          {/* 🎧 AUDIO CALL */}
          {isAudio && (
            <div className="flex flex-col items-center justify-center space-y-8">
              <Avatar className="w-24 h-24 border-2 border-white shadow-lg">
                <AvatarImage src="/default-user.png" alt="User avatar" />
              </Avatar>

              <p className="text-lg font-medium">Voice Call in Progress...</p>

              <Button
                onClick={leaveCall}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <PhoneOff className="w-5 h-5" /> End
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
