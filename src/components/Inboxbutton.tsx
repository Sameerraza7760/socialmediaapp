"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSocketContext } from "@/context/SocketContext";

export default function InboxButton() {
    const pathname = usePathname();
    const isActive = pathname.startsWith("/inbox");
    const {
        socket
    } = useSocketContext()

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        socket?.on("unreadCount", (count: number) => {
            setUnreadCount(count);
        });
        return () => {
            socket?.off("unreadCount");
        };
    }, [socket]);


    useEffect(() => {
        if (isActive && socket) {
            socket.emit("markAsRead");
            setUnreadCount(0); 
        }
    }, [isActive, socket]);

    return (
        <Button
            variant="ghost"
            className={cn(
                "relative flex items-center gap-2",
                isActive && "bg-muted text-primary"
            )}
            asChild
        >
            <Link href="/inbox">
                <MessageSquareIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Inbox</span>

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Link>
        </Button>
    );
}
