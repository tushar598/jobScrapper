import express from "express";
import { fetchAndSaveJobs } from "../controller/jobController.js";

const router = express.Router();

router.get("/fetch/:userId" , fetchAndSaveJobs);

export default router;