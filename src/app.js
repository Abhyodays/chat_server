import express from "express";
import { createServer } from "http";
import { chats } from './data/data.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,

    Credential: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: process.env.CORS_ORIGIN
});
const users = new Map();
io.on('connection', (socket) => {
    socket.on('init room', (data) => { console.log('data => ', data) })
    socket.on("register", async (data) => {
        users.set(data.email, socket.id);
        const allMessages = await getAllMessageOfUser(data.email);
        if (users.has(data.email)) {
            allMessages.forEach(m => {
                io.to(users.get(m.receiver)).emit("message received", m)
            })
        }
    })
    socket.on("send message", (data) => {
        const { receiver } = data;
        if (users.has(receiver)) {
            socket.to(users.get(receiver)).emit("message received", data)
        } else {
            sendNotification(data.receiver, data);
            addMessage({ ...data, status: "sent" });
            socket.emit("error", { message: "Receiver not connected" })
        }
    });
    socket.on(MESSAGE_RECEIVED, (data) => {
        removeMessage(data);
    })
    socket.on("disconnecting", () => {
        // find email by socket id
        let email = null;
        for (const [userId, socketId] of users) {
            if (socketId === socket.id) email = userId;
        }
        try {
            users.delete(email)
        } catch (error) {
            console.log("Error :: user disconnect:", error);
        }
    })

});


app.get('', (req, res) => {
    res.send(chats)
})

//routes imports
import userRouter from './routers/user.routes.js';
import { addMessage, getAllMessageOfUser, removeMessage } from "./controllers/message.controller.js";
import { MESSAGE_RECEIVED } from "./constants/Events.js";
import notificationRouter from './routers/notification.routes.js'
import { sendNotification } from "./service/notification.service.js";



//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/notification", notificationRouter)

export { httpServer };