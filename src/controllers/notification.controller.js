import { NotificationToken } from "../models/notificationToken.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const registerToken = asyncHandler(async (req, res) => {
    const { user, token } = req.body;
    const result = await NotificationToken.findOneAndUpdate({ user }, { $set: { token } }, { new: true, upsert: true });
    if (!result) {
        throw new ApiError(400, "Something went wrong")
    }
    res.status(200).json(new ApiResponse(200, result));
})



export { registerToken }