import { Server } from "socket.io";

let io = null;
const userSocketMap = new Map();
const messages = [];
const unreadMap = new Map(); 

export function initIO(httpServer) {
  io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`✅ ${userId} connected (${socket.id})`);
      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    }
    socket.on("sendMessage", ({ to, message }) => {
      const receiverSocketId = userSocketMap.get(to);
      messages.push({ from: userId, to, message });
      const prev = unreadMap.get(to) || 0;
      unreadMap.set(to, prev + 1);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", { from: userId, message });
        io.to(receiverSocketId).emit("unreadCount", unreadMap.get(to));
      }
    });

    socket.on("markAsRead", () => {
      unreadMap.set(userId, 0);
      io.to(socket.id).emit("unreadCount", 0);
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].to === userId) messages.splice(i, 1);
      }
    });


       socket.on("callUser", ({ to, signalData, from, callType }) => {
      console.log("📞 callUser received:", { to, from, callType });
      const receiverSocketId = userSocketMap.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incomingCall", {
          from,
          signalData,
          callType,
        });
      }
    });

    // Answer call
    socket.on("answerCall", ({ to, signalData }) => {
      const receiverSocketId = userSocketMap.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("callAccepted", { signalData });
      }
    });

    // End call
    socket.on("endCall", ({ to }) => {
      const receiverSocketId = userSocketMap.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("callEnded");
      }
    });
    socket.on("disconnect", () => {
      if (userId) {
        userSocketMap.delete(userId);
        console.log(`❌ ${userId} disconnected`);
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function getReceiverSocketId(userId) {
  return userSocketMap.get(userId);
}
