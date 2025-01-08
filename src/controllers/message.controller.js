import { Message } from "../models/message.model.js";

const addMessage = async (data) => {
    try {
        const { id, sender, receiver, message, created_at, status } = data;
        await Message.create({ id, sender, created_at, message, status, receiver });
    } catch (error) {
        console.log(`Error :: addMessage :: ${error}`)
    }

};
const updateMessage = async (data) => {
    try {
        const result = await Message.findOneAndUpdate({ id: data.id }, data, { new: true });
        if (!result) {
            throw new Error("Message not found for updating")
        }
        return result;
    } catch (error) {
        console.log(`Error :: updateMessage :: ${error}`)
    }
}

const removeMessage = async (message) => {
    try {
        const result = await Message.findOneAndDelete({ id: message.id });
        if (!result) {
            return;
        }
    } catch (error) {
        console.log(`Error :: removeMessage :: ${error}`)
    }
};
const getAllMessageOfUser = async (receiver) => {
    try {
        const allMessages = await Message.find({ receiver })
        return allMessages;
    } catch (error) {
        console.log(`Error :: getAllMessagesOfUser :: ${error}`);
    }
}

export { removeMessage, addMessage, updateMessage, getAllMessageOfUser }