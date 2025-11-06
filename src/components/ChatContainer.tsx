"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMessage } from "@/hook/useMessage";
import { ArrowLeft, ImageIcon, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSocketContext } from "@/context/SocketContext";
import { MessageSkeleton } from "./MessageSkeleton";
import ImageUpload from "./ImageUpload";
import toast from "react-hot-toast";

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  seen?: boolean;
  chatId?: string;
  imageUrl?: string;
};

type ChatContainerProps = {
  chatId: string;
  selectedUserId: string;
  dbUserId: string;
};

export default function ChatContainer({
  chatId,
  selectedUserId,
  dbUserId,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const { sendMessage, getMessages, messageMarkAsRead } = useMessage();
  const { socket } = useSocketContext();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() && !imageUrl) return;

    setIsPosting(true);
    const tempMessage: Message = {
      id: Date.now().toString(),
      senderId: dbUserId,
      text: newMessage,
      imageUrl,
      createdAt: new Date(),
      chatId,
      seen: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setImageUrl("");
    setShowImageUpload(false);

    try {
      await sendMessage(chatId, newMessage, selectedUserId, imageUrl);
      socket?.emit("sendMessage", { to: selectedUserId, message: tempMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("receiveMessage", (receivedMessage) => {
      const { message } = receivedMessage;
      console.log("Received message via socket:", message);
      setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, [socket]);

  useEffect(() => {
    const markAsRead = async () => {
      try {
        await messageMarkAsRead(chatId, dbUserId);
      } catch (error) {
        console.error("Error marking chat as read:", error);
      }
    };
    markAsRead();
  }, [chatId, messages]);

  // ✅ Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await getMessages(chatId);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [chatId]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <Card className="flex flex-col h-full">
        {/* HEADER */}
        <CardHeader className="flex items-center justify-between border-b">
          <div className="flex items-center gap-3 justify-between w-full">
            <Link href="/inbox">
              <ArrowLeft className="w-5 h-5 cursor-pointer" />
            </Link>
            <div className="flex justify-center gap-2 items-center">
              <Avatar>
                <AvatarImage src="/avatar.png" />
              </Avatar>
              <CardTitle className="text-base">Chat {chatId}</CardTitle>
            </div>
          </div>
        </CardHeader>

        {/* MESSAGES */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20 scroll-smooth">
          {loading ? (
            <MessageSkeleton />
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === dbUserId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.senderId === dbUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-white dark:bg-muted"
                  }`}
                >
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Message image"
                      className="rounded-md mb-2 max-w-[200px]"
                    />
                  )}
                  {msg.text && <p>{msg.text}</p>}
                  <span className="block text-[10px] text-muted-foreground mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </CardContent>

        {/* MESSAGE INPUT */}
        <div className="border-t p-3 flex items-center gap-2">
          {showImageUpload && (
            <div className="absolute bottom-16 left-4 right-4 bg-white border rounded-xl p-4 z-10 shadow-lg">
              <ImageUpload
                endpoint="postImage"
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url);
                  if (!url) setShowImageUpload(false);
                }}
              />
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowImageUpload(!showImageUpload)}
            disabled={isPosting}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>

          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isPosting}
          />

          <Button
            onClick={handleSend}
            disabled={isPosting || (!newMessage.trim() && !imageUrl)}
          >
            {isPosting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
