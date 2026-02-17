// socket.js
import { Server } from "socket.io";
import { changeMessageStatus, createMessage, takeConversation } from "../socketFunctions/message.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // client registers role + id
    socket.on("register", ({ userId, role }) => {
      if (role === "admin") {
        socket.join("admins");
        console.log(`Admin connected -> ${socket.id}`);
      } else {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
      }
    });

    socket.on('message:new',createMessage);
    socket.on('conversation:take',takeConversation);
    socket.on('message:statusChange',changeMessageStatus)
    

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
