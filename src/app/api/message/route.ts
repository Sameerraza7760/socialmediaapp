import prisma from "@/lib/prisma";
import { getDbUserId } from "@/actions/user.action";
import { getReceiverSocketId } from "@/lib/socket";
import { getIO } from "@/lib/socket";
export async function POST(request: Request) {
    try {
        const { chatId, text, receiverId } = await request.json();
        console.log("Received POST request with data:", { chatId, text, receiverId });
        const senderId = await getDbUserId();
        if (!senderId) {
            return new Response("Unauthorized", { status: 401 });
        }
        const message = await prisma.message.create({
            data: {
                chatId,
                senderId,
                text,
            },
        });
        return new Response(JSON.stringify(message), { status: 201 });
    } catch (error) {
        console.log("Error sending message", error);
        return new Response("Error sending message", { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const chatId = searchParams.get("chatId");
        if (!chatId) {
            return new Response("chatId is required", { status: 400 });
        }
        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
        });

        return new Response(JSON.stringify(messages), { status: 200 });
    } catch (error) {
        console.log("Error fetching messages", error);
        return new Response("Error fetching messages", { status: 500 });
    }
}



