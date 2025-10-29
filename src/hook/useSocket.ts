"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
    userId?: string;
}

const useSocket = ({ userId }: UseSocketOptions) => {
    const [connected, setConnected] = useState(false);
    const [socketError, setSocketError] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const socketRef = useRef<Socket | null>(null);

 
    useEffect(() => {
        if (!userId) return;
        const socket = io(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", {
            query: { userId },
            path: "/socket.io",
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket.id);
            setConnected(true);
            setSocketError(null);
        });

        socket.on("disconnect", () => {
            console.log("❌ Socket disconnected");
            setConnected(false);
        });

        socket.on("connect_error", (err) => {
            console.error("⚠️ Socket connection error:", err.message);
            setSocketError(err.message);
        });

        socket.on("getOnlineUsers", (users: string[]) => {
            console.log("🟢 Online users:", users);
            setOnlineUsers(users);
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);

    return {
        socket: socketRef.current,
        connected,
        socketError,
        onlineUsers,
    };
};

export default useSocket;
