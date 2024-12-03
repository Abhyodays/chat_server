import mongoose from "mongoose";
export let dbInstance = undefined;
export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
        dbInstance = connectionInstance;
        console.log(`MongoDB connected! Db host: ${dbInstance.connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
}


