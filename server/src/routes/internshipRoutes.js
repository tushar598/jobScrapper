// const express = require("express");
// const {
//   fetchAndSaveInternships,
// } = require("../controllers/internshipController");

// const router = express.Router();
// router.get("/scrape/:userId", fetchAndSaveInternships);

// module.exports = router;

import express from "express";
import { fetchAndSaveInternships } from "../controller/internshipController.js";

const router = express.Router();

router.get("/scrape/:userId", fetchAndSaveInternships);

export default router;
