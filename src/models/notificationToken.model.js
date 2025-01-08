import { model, Schema } from "mongoose";

const notificationTokenSchema = new Schema({
    user: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        index: true
    },
    token: {
        type: String,
        required: true
    }
}, { timestamps: true })

const NotificationToken = new model("NotificationToken", notificationTokenSchema);
export { NotificationToken };