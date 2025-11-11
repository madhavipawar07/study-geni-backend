import express from "express";
import { signup,login,getUserInfo  } from "../controller/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup",signup)
router.post("/login",login)
router.get("/:id",protectRoute,getUserInfo)

export default router;