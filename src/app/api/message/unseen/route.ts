import prisma from "@/lib/prisma";
import { getDbUserId } from "@/actions/user.action";
export async function GET() {
    try {
        const userId = await getDbUserId();
        if (!userId) {
            return new Response(JSON.stringify([]), { status: 200 });
        }
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
        return new Response(JSON.stringify(unseenMessages), { status: 200 });
    }
    catch (error) {
        console.error("Error fetching unseen messages", error);
        return new Response("Error fetching unseen messages", { status: 500 });
    }
}