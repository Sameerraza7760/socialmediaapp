"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
    socket: Socket | null;
    onlineUsers: string[];
    connected: boolean;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: [],
    connected: false,
});

export const SocketProvider = ({ userId, children }: { userId?: string; children: React.ReactNode }) => {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [connected, setConnected] = useState(false);
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
            console.log("✅ Connected:", socket.id);
            setConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("❌ Disconnected");
            setConnected(false);
        });

        socket.on("getOnlineUsers", (users: string[]) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [userId]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => useContext(SocketContext);
