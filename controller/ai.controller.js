import File from "../model/file.model.js";
import { createPartFromUri, GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.AI,
});

async function main(fileurl,prompt) {

  console.log("Downloading PDF...");
  const response = await fetch(fileurl);

  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }

  const pdfBuffer = await response.arrayBuffer();
  const fileBlob = new Blob([pdfBuffer], { type: "application/pdf" });

  console.log("Uploading PDF to Google...");
  const file = await ai.files.upload({
    file: fileBlob,
    mimeType: "application/pdf",
    config: { displayName: "file.pdf" },
  });

  console.log("File uploaded:", file);

  let getFile = await ai.files.get({ name: file.name });
  console.log("Processing state:", getFile.state);

  while (getFile.state === "PROCESSING") {
    console.log("Still processing... waiting 5 seconds");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    getFile = await ai.files.get({ name: file.name });
  }

  if (getFile.state === "FAILED") {
    throw new Error("File processing failed.");
  }

  console.log("File ready. Generating summary...");

  const aiResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      prompt,
      createPartFromUri(getFile.uri, getFile.mimeType),
    ],
  });

  console.log("Summary Output:\n", aiResponse.text);

  return aiResponse.text;
}

export const getFileSummary = async (req, res) => {
  try {
    const fileId = req.params.fileId;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required",
      });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const prompt = `
You are an expert educator. Summarize the uploaded document in clear, simple language.
Highlight only the important points and avoid unnecessary details.
Provide a structured summary with headings if possible.
`;


    const summary = await main(file.fileUrl, prompt);

    return res.status(200).json({
      success: true,
      fileId,
      summary,
    });

  } catch (err) {
    console.error("AI Insights Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate file insights",
      error: err.message,
    });
  }
};


export const getFileQuiz = async (req, res) => {
  try {
    const fileId = req.params.fileId;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required",
      });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const prompt = `
You are an expert quiz generator.
Create a quiz based on the uploaded study material and provide it in structured format .
Generate:
- 5 multiple-choice questions (MCQs)
- Each question must have 4 options (A, B, C, D)
- Clearly mark the correct answer
- Keep questions meaningful, conceptual, and student-friendly
Format the output clearly.
`;


    const summary = await main(file.fileUrl, prompt);

    return res.status(200).json({
      success: true,
      fileId,
      summary,
    });

  } catch (err) {
    console.error("AI Insights Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate file insights",
      error: err.message,
    });
  }
};