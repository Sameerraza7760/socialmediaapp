import axios from "axios";
export const useMessage = () => {
    const sendMessage = async (chatId: string, text: string, receiverId: string) => {
        console.log("Sending message to API:", { chatId, text, receiverId });
        try {
            const response = await axios.post('/api/message', { chatId, text, receiverId });
            return response.data;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    };
    const toggleMessageSeen = async (messageId: string) => {
        try {
            const response = await axios.post('/api/message/seen', { messageId });
            return response.data;
        } catch (error) {
            console.error("Error toggling message seen:", error);
            throw error;
        }
    };

    const fetchUnseenMessages = async () => {
        try {
            const response = await axios.get('/api/message/unseen');
            return response.data;
        } catch (error) {
            console.error("Error fetching unseen messages:", error);
            throw error;
        }
    };


    const getMessages = async (chatId: string) => {
        try {
            const response = await axios.get('/api/message', {
                params: { chatId },
            });
            return response.data;
        }
        catch (error) {
            console.error("Error fetching messages:", error);
            throw error;
        }
    };

    const messageMarkAsRead = async (chatId: string, currentUserId: string) => {
        try {
            const response = await axios.post('/api/message/markAsread', { chatId, currentUserId });
            return response.data;
        } catch (error) {
            console.error("Error marking messages as read:", error);
            throw error;
        }
    };

    return { sendMessage, toggleMessageSeen, fetchUnseenMessages, getMessages, messageMarkAsRead };
} 