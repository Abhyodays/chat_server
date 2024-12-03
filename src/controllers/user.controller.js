import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token.")
    }
}
const registerUser = asyncHandler(async (req, res) => {
    // get all data
    const { fullName, email, password, username } = req.body

    // validation
    if ([email, password, fullName, password].some(field =>
        (field === undefined || field.trim() === "")
    )) {
        throw new ApiError(400, "All fields are required.")
    }
    // check for existing user
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(400, "Username or Email already exists.")
    }
    // create new user

    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        password,
        username: username.toLowerCase()
    })
    console.log(user)
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    console.log(createdUser)
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating a user.")
    }
    // send response to user
    res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"))

})

const loginUser = asyncHandler(async (req, res) => {
    // get credentials
    const { username, email, password } = req.body
    // check user using email and password
    if (!(username || email)) {
        throw new ApiError(400, "Username or Email required.");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist.")
    }
    // check password correct
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invlaid credentials.")
    }
    // save refresh token in db
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    // return access token and refresh token and also save in cookies
    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                })
        )
}
)
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out.")
        )
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unathorized request.")
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new Error(401, "Invalid refresh token.")
        }
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true
        }


        res.status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(201, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")
            )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token.")
    }
})

const getUsers = asyncHandler(async (req, res) => {
    const { id } = req.query
    try {
        const users = await User.find({
            username: {
                $regex: id,
                $options: 'i'
            }
        }).select("-password -refreshToken -_id")
        if (users.length === 0) {
            throw new ApiError(404, "User not found")
        }
        res.status(200).json(
            new ApiResponse(200, users)
        )
    } catch (error) {
        throw new ApiError(404, "User not found");
    }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUsers
}