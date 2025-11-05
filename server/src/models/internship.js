import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
  title: { type: String },
  company: { type: String },
  location: { type: String },
  platform: { type: String },
  link: { type: String },
  discription: { type: String },
  skillsRequired: { type: [String] },
  stipend: { type: String },
  duration: { type: String },
  postedAt: { type: Date },
  scrapedAt: { type: Date, default: Date.now },
});

const Internship = mongoose.model("Internship", internshipSchema);

export default Internship;
