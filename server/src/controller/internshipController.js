// const User = require("../models/user");
// const Internship = require("../models/internship");
// const { scrapeInternships } = require("../services/scraper/internshipScraper");
import User from "../models/user.js";
import Internship from "../models/internship.js";
import { scrapeInternships } from "../services/scraper/internshipScraper.js";

export async function fetchAndSaveInternships(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { skills, location } = user;
    if (!skills?.length || !location)
      return res
        .status(400)
        .json({ message: "User skills or location missing" });

    const internships = await scrapeInternships(skills, location);

    const internshipDocs = internships.map((i) => ({
      ...i,
      userId,
      source: "Internshala",
      dateFetched: new Date(),
    }));

    await Internship.insertMany(internshipDocs);
    res
      .status(200)
      .json({ message: "Internships scraped", internships: internshipDocs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
