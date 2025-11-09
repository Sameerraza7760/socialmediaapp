"use client";

import { CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video } from "lucide-react";
import Link from "next/link";

type ChatContainerHeaderProps = {
  chatId: string;
  onVoiceCall: () => void;
  onVideoCall: () => void;
};

export default function ChatContainerHeader({
  chatId,
  onVoiceCall,
  onVideoCall,
}: ChatContainerHeaderProps) {
  return (
    <CardHeader className="flex items-center justify-between border-b">
      <div className="flex items-center gap-3 justify-between w-full">
        {/* Back button */}
        <Link href="/inbox">
          <ArrowLeft className="w-5 h-5 cursor-pointer" />
        </Link>

        <div className="flex items-center justify-between w-full">
          {/* Avatar + Title */}
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/avatar.png" alt="User Avatar" />
            </Avatar>
            <CardTitle className="text-base font-semibold">
              Chat {chatId}
            </CardTitle>
          </div>

          {/* Call Buttons */}
          <div className="flex items-center gap-2">
            {/* Voice Call */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onVoiceCall}
              title="Start Voice Call"
            >
              <Phone className="w-5 h-5" />
            </Button>

            {/* Video Call */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onVideoCall}
              title="Start Video Call"
            >
              <Video className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
