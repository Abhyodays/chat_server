import { connectDB } from './src/db/db.js'
import { httpServer } from "./src/app.js"

connectDB().then(
    () => {
        httpServer.listen(process.env.PORT, () => {
            console.log("server is running::", process.env.PORT);
        })
    }
)
