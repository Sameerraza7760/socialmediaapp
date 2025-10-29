import { getDbUserId } from "./user.action";
import prisma from "@/lib/prisma";

export async function findOrCreateChat(selectedUserId: string) {
    try {
        const currentUserId = await getDbUserId();
        if (!currentUserId) return null;
        const existingChat = await prisma.chat.findFirst({
            where: {
                members: {
                    every: {
                        userId: { in: [currentUserId, selectedUserId] },
                    },
                },
            },
            include: { members: true },
        });
        if (existingChat) return existingChat;

        const newChat = await prisma.chat.create({
            data: {
                members: {
                    create: [
                        { userId: currentUserId },
                        { userId: selectedUserId },
                    ],
                },
            },
            include: { members: true },
        });
        return newChat;
    } catch (error) {
        console.error("Error in findOrCreateChat:", error);
        throw new Error("Failed to find or create chat");
    }
}

export async function getMessages(chatId: string) {
    try {
        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
        });
        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Failed to fetch messages");
    }
}
export async function MarkMessagesAsRead(messageIds: string[]) {
    try {
        await prisma.message.updateMany({
            where: {
                id: {
                    in: messageIds,
                },
            },
            data: {
                seen: true,
            },
        });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        throw new Error("Failed to mark messages as read");
    }
}


// this is for fetching unseen messages for notification badge
export async function fetchUnseenMessages() {
    try {
        const userId = await getDbUserId();
        if (!userId) return [];
        const unseenMessages = await prisma.message.findMany({
            where: {
                seen: false,
                chat: {
                    members: {
                        some: {
                            userId: userId,
                        },
                    },
                },
            },
        });
        return unseenMessages;
    } catch (error) {
        console.error("Error fetching unseen messages:", error);
        throw new Error("Failed to fetch unseen messages");
    }
}