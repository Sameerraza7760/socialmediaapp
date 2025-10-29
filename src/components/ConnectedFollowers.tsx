
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocketContext } from "@/context/SocketContext";
import { useMessage } from "@/hook/useMessage";
import { MessageSquareIcon, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFollowers } from "@/hook/useFollower";

export default function ConnectedFollowers({ initialUsers }: { initialUsers: any[]; userId?: string }) {
    const [unseenMessages, setUnseenMessages] = useState<any[]>([]);
    const { fetchUnseenMessages } = useMessage();
    const [search, setSearch] = useState("");
    const { data: followers, isLoading } = useFollowers(initialUsers, search);
    const { onlineUsers, socket } = useSocketContext();

    useEffect(() => {
        const loadUnseen = async () => {
            const unseen = await fetchUnseenMessages();
            console.log("Unseen messages:", unseen);
            setUnseenMessages(unseen);
        };
        loadUnseen();
    }, []);



    useEffect(() => {
        socket?.on("receiveMessage", (data: any) => {
            console.log("Received unseen messages via socket:", data);
            setUnseenMessages((prev) => [...prev, data.message]);
        });
        return () => {
            socket?.off("receiveMessage");
        }
    }, [socket]);
    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquareIcon className="w-5 h-5" />
                        Inbox
                    </CardTitle>
                    <div className="relative border-b px-4 py-2">
                        <Search
                            className="absolute left-6 top-4 size-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..." className="pl-8 h-9 text-sm" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-12rem)]">
                    {isLoading ? (
                        <p className="text-center text-muted-foreground p-6">Loading...</p>
                    ) : followers && followers.length > 0 ? (
                        followers.map((user:any) => {
                            const hasNew = unseenMessages.some(
                                (msg) => msg.senderId === user.id
                            );
                            return (
                                <Link
                                    key={user.id}
                                    href={`/inbox/${user.id}`}
                                    className="flex items-center gap-4 p-4 border-b hover:bg-muted/25 transition-colors cursor-pointer"
                                >
                                    <Avatar>
                                        <AvatarImage src={user.image ?? "/avatar.png"} />
                                        <AvatarFallback>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {onlineUsers.includes(user.id) ? (
                                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                                    ) : (
                                        <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-1"></span>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium truncate">{user.name}</p>
                                            <span className="text-xs text-muted-foreground">
                                                @{user.username}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            Tap to open chat
                                        </p>
                                        {hasNew && (
                                            <span className="inline-block bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full mt-1">
                                                New
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <p className="text-center text-muted-foreground p-6">
                            No followers found
                        </p>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
