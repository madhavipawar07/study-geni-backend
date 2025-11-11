import express, { response } from 'express';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';
import authRoutes from "../routes/auth.routes.js"
import fileRoutes from "../routes/file.routes.js"
import aiRoutes from "../routes/ai.routes.js"
dotenv.config();

const app=express();

app.use(express.json());

connectDB()

const PORT=5000;

app.get("/", (req, res) => {
    res.send("StudyGeni API is Running");
})
app.use("/api/auth",authRoutes)
app.use("/api/file",fileRoutes)
app.use("/api/ai",aiRoutes)

app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
});