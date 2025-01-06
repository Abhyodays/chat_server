import mongoose, { model, Schema } from "mongoose";

const messageSchema = new Schema({
    sender: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    receiver: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    id: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    created_at: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        lowercase: true
    }
})

export const Message = model("message", messageSchema);