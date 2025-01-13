import { NotificationToken } from "../models/notificationToken.model.js";
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const getNotificationToken = async (user) => {
    const result = await NotificationToken.findOne({ user });
    if (!result) {
        return;
    }
    return result.token;
}
const sendNotification = async (user, data) => {
    const token = await getNotificationToken(user);
    if (!token) {
        console.log("No token found for user:", user)
        return;
    }
    const message = {
        data,
        token
    };
    console.log(`sending message to ${user}`)
    await admin.messaging().send(message);
}


export { getNotificationToken, sendNotification };