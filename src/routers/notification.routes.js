import { Router } from "express";
import { registerToken } from '../controllers/notification.controller.js'

const router = Router();

router.route('/token').post(registerToken);

export default router;
