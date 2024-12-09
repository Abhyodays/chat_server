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
const users = {};
io.on('connection', (socket) => {
    socket.on('init room', (data) => { console.log('data => ', data) })
    socket.on("register", (data) => {
        users[data.email] = socket.id;
    })
    socket.on("send message", (data) => {
        const { receiver } = data;
        if (users[receiver]) {
            socket.to(users[receiver]).emit("message received", data)
        } else {
            socket.emit("error", { message: "Receiver not connected" })
        }
    })
    socket.on("disconnected:", () => {
        console.log("user disconnected:", socket.id)
        socket.disconnect();
    })

});


app.get('', (req, res) => {
    res.send(chats)
})

//routes imports
import userRouter from './routers/user.routes.js';



//routes declaration
app.use("/api/v1/users", userRouter);

export { httpServer };