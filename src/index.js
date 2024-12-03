import express from "express";
import { connectDB } from './db/db.js'
import { httpServer } from "./app.js"

connectDB().then(
    () => {
        httpServer.listen(process.env.PORT, () => {
            console.log("server is running::", process.env.PORT);
        })
    }
)
