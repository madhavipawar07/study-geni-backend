import File from "../model/file.model.js";
import cloudinary from "../config/cloud.js";

export const addFile = async(req,res)=>{
    try {
        const{ title, desc, subject} = req.body;
        const userId = req.user.id;
        console.log(req.user.id)
        console.log(req.body)

        if(!title || !desc ||!subject){
            return res.status(400).json({
                message: "All fields are required!!"
            })
        }
            let fileUrl = undefined;

            if(req.file){
                try {
                    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
                    const uploadResult = await cloudinary.uploader.upload(base64Image,{folder: "files",resource_type:"raw"})
                    fileUrl= uploadResult.secure_url;
                } catch (error) {
                    console.error(error);
                    res.status(500).json({
                    message: "File upload Error"
                    })
                }
            }

            const newFile = await File.create({
                title,desc,subject,fileUrl,createdBy:userId,
            })
            console.log(newFile)
            res.status(201).json({
                success: true,
                message: "File Created",
                newFile,
            })
        }
        catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const getAllFile = async(req,res)=>{
    try {
        const files = await File.find();
        res.status(200).json({
            success: true,
            count: files.length,
            files
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const getFileById = async(req,res)=>{
    try {
        const {id}= req.params;
        const file = await File.findById(id);

        if(!file){
            return res.status(404).json({
                message: "File not found"
            })
        }

        res.status(200).json({
            success: true,
            file
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
}