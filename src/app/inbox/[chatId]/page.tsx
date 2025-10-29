
import { findOrCreateChat, getMessages, MarkMessagesAsRead } from "@/actions/message.action";
import { getUserByClerkId } from "@/actions/user.action";
import ChatContainer from "@/components/ChatContainer";
import { currentUser } from "@clerk/nextjs/server";


export default async function ChatPage({ params }: { params: { chatId: string } }) {
    const { chatId } = params;
    const authUser = await currentUser();
    if (!authUser) return <div className="p-6 text-center text-gray-500">Please log in to view your chats.</div>;

    const user = await getUserByClerkId(authUser.id);

    try {
        const chat = await findOrCreateChat(chatId);
        if (!chat?.id) {
            return <div className="p-6 text-center text-gray-500">Unable to find or create chat.</div>;
        }

        return (
            <ChatContainer
                selectedUserId={chatId}
                chatId={chat.id}
                dbUserId={user?.id || ""}
            />
        );
    } catch (error) {
        console.error("Error loading chat:", error);
        return (
            <div className="p-6 text-center text-red-500">
                Something went wrong while loading the chat.
            </div>
        );
    }
}
