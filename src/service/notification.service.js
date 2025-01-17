import { NotificationToken } from "../models/notificationToken.model.js";
import admin from 'firebase-admin';

const initializeFirebase = () => {
    if (!process.env.FIREBASE_CREDENTIALS) {
        throw new Error('Firebase credentials are not configured');
    }

    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
    } catch (error) {
        throw new Error(`Failed to initialize Firebase: ${error.message}`);
    }
};

initializeFirebase();

const createMessage = (token, data) => ({
    token,
    notification: {
        title: data.sender || 'Notification',
        body: data.message || 'You have a new notification!',
    },
    data,  // Retains any additional data for in-app handling
    android: {
        priority: 'high',
        notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
    },
    apns: {
        payload: {
            aps: {
                alert: {
                    title: data.title || 'Notification',
                    body: data.body || 'You have a new notification!',
                },
                sound: 'default',
            },
        },
    },
});

const getNotificationToken = async (user) => {
    const result = await NotificationToken.findOne({ user });
    return result ? result.token : null;
};

const sendNotification = async (userId, data) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    if (!data || Object.keys(data).length === 0) {
        throw new Error('Notification data is required');
    }

    try {
        const token = await getNotificationToken(userId);

        if (!token) {
            console.log(`No notification token found for user: ${userId}`);
            return false;
        }

        const message = createMessage(token, data);
        await admin.messaging().send(message);
        return true;
    } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
        throw new Error('Failed to send notification');
    }
};

const sendTestMessage = async () => {
    const knownToken = 'cFuDvENSSk-nUGRLrZsEMP:APA91bHeBLbbfVPwOjvWLhBbPz11KZQRUqLJX-cUlc6U-TkQ6S0weUY5rcFGVctDd8-JHHXgvQzpLjamebwStggH19xEhiQLV0O7mGmcAtf9yWWRPU-rtww';
    const message = createMessage(knownToken, {
        title: 'Test Notification',
        body: 'This is a test push notification',
    });

    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
            return true;
        })
        .catch((error) => {
            console.error('Error sending message:', error);
            return false;
        });
};

export { getNotificationToken, sendNotification, sendTestMessage };
