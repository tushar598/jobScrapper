import User from "../models/user.js";
import Job from "../models/job.js";
import { scrapeJobs } from "../services/scraper/jobScraper.js";

export const fetchAndSaveJobs = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { desiredPost, desiredLocation } = user;
    if (!desiredPost?.length || !desiredLocation?.length) {
      return res
        .status(400)
        .json({ message: "User desired post or desired location is missing" });
    }

    const scrapedJobs = await scrapeJobs(desiredPost, desiredLocation);

    // save jobs in DB
    const jobDocs = scrapedJobs.map((job) => ({
      ...job,
      userId,
      source: "Indeed",
      dateFetched: new Date(),
    }));

    await Job.insertMany(jobDocs);

    res.status(200).json({
      message: "Jobs scraped and saved successfully",
      total: jobDocs.length,
      jobs: jobDocs,
    });
  } catch (error) {
    console.log("Error fetching and saving jobs:" , error);
    res.status(500).json({ message: "Server Error" });
  }
};
