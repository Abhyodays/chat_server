import { NotificationToken } from "../models/notificationToken.model.js";
import admin from 'firebase-admin';

admin.initializeApp();

const getNotificationToken = async (user) => {
    const result = await NotificationToken.findOne({ user });
    if (!result) {
        return;
    }
    return result;
}
const sendNotification = async (user, message) => {
    const token = await getNotificationToken(user);
    if (!token) {
        console.log("No token found for user:", user)
        return;
    }
    await admin.messaging().send({
        token,
        data: { message }
    });
}


export { getNotificationToken, sendNotification };