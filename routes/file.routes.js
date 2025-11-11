import express from "express";
import { addFile,getAllFile,getFileById } from "../controller/file.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
const router = express.Router();

router.post('/addfile',protectRoute,upload.single('file'),addFile)
router.get("/",getAllFile)
router.get("/:id",getFileById)


export default router;