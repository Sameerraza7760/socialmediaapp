import { getDbUserId } from "@/actions/user.action";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { chatId, text, image, audioUrl } = await request.json();
    
    const senderId = await getDbUserId();
    if (!senderId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        text,
        imageUrl: image || null,
        audioUrl,
      },
    });

    return new Response(JSON.stringify(message), { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
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
      select: {
        id: true,
        senderId: true,
        text: true,
        imageUrl: true,
        createdAt: true,
        seen: true,
        chatId: true,
        audioUrl: true,
      },
    });

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response("Error fetching messages", { status: 500 });
  }
}
