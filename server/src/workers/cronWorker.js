// const cron = require("node-cron");
// const User = require("./models/user");
// const Job = require("./models/job");
// const Internship = require("./models/internship");
// const { scrapeJobs } = require("./services/scraper/jobScraper");
// const { scrapeInternships } = require("./services/scraper/internshipScraper");
import cron from "node-cron";
import User from "../models/user.js";
import Job from "../models/job.js";
import Internship from "../models/internship.js";
import { scrapeJobs } from "../services/scraper/jobScraper.js";
import { scrapeInternships } from "../services/scraper/internshipScraper.js";

// Run every 24 hours
const cronWorker = () => {
  cron.schedule("0 0 * * *", async () => {
    const users = await User.find();
    for (const user of users) {
      if (user.skills?.length && user.location) {
        const jobs = await scrapeJobs(user.skills, user.location);
        await Job.insertMany(
          jobs.map((j) => ({ ...j, userId: user._id, dateFetched: new Date() }))
        );

        const internships = await scrapeInternships(user.skills, user.location);
        await Internship.insertMany(
          internships.map((i) => ({
            ...i,
            userId: user._id,
            dateFetched: new Date(),
          }))
        );
      }
    }
    console.log("✅ Daily scraping completed");
  });
};

export default cronWorker;
