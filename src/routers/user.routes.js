import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, getUsers } from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/refresh-token').post(refreshAccessToken);

router.route('').get(getUsers);
//secure routes
router.route('/logout').post(verifyUser, logoutUser);

export default router;