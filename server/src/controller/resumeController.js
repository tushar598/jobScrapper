import { request, response } from "express";
import Resume from "../models/resume.js";

// export const uploadResume = async (req = request, res = response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
//     const { originalname, mimetype, size, buffer } = req.file;
//     const userId = req.body.userId;
//     const newResume = new Resume({
//       userId,
//       fileName: originalname,
//       fileType: mimetype,
//       fileSize: size,
//       fileData: buffer,
//     });
//     await newResume.save();
//     return res.status(201).json({ message: "Resume uploaded successfully" });
//   } catch (error) {
//     console.error("Error uploading resume:", error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

export const uploadResume = async (req, res) => {
  try {
    console.log("---- Resume Upload Triggered ----");
    console.log("Body received:", req.body);
    console.log("File received:", req.file);

    if (!req.file) {
      console.log("⚠️ No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const userId = req.body.userId;

    console.log("User ID:", userId);
    console.log("File details:", { originalname, mimetype, size });

    const newResume = new Resume({
      userId,
      fileName: originalname,
      fileType: mimetype,
      fileSize: size,
      fileData: buffer,
    });

    await newResume.save();

    console.log("✅ Resume saved successfully in DB");
    return res.status(201).json({ message: "Resume uploaded successfully" });
  } catch (error) {
    console.error("❌ Error uploading resume:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getUserResume = async (req = request, res = response) => {
  try {
    const userId = req.params.userId;
    const resume = await Resume.findOne({ userId: userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.set({
      "Content-Type": resume.fileType,
      "Content-Disposition": `attachment; filename=${resume.fileName}`,
    });
    return res.status(200).send(resume.fileData);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
