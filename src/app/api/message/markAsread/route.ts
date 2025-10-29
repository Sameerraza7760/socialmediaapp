import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { chatId, currentUserId } = await request.json();

    console.log("Marking as read for chat:", chatId);

    const updatedMessages = await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: currentUserId }, // mark only messages from the other user
        seen: false,
      },
      data: {
        seen: true,
      },
    });

    return new Response(JSON.stringify(updatedMessages), { status: 200 });
  } catch (error) {
    console.error("Error marking messages as read", error);
    return new Response("Error marking messages as read", { status: 500 });
  }
}
