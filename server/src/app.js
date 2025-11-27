import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// import parseRoutes from "./routes/parserRoutes.js"; // Disabled: Playwright not supported on Vercel serverlessimport resumeRoutes from "./routes/resumeRoutes.js";
// import jobRoutes from "./routes/jobRoutes.js"; // Disabled: Uses Playwright scraperimport userRoutes from "./routes/userRoutes.js";
// import internshipRoutes from "./routes/internshipRoutes.js"; // Disabled: Uses Playwright scraper// import cronWorker from "./workers/cronWorker.js"; // Disabled: Playwright incompatible with Vercel serverless
const app = express();

// ✅ 1. Enable CORS first
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ 2. Parse JSON
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. Log Requests
app.use((req, res, next) => {
  console.log("---- Incoming Request ----");
  console.log(`${req.method} ${req.path}`);
  next();
});

// ✅ 4. Routes
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);
// app.use("/api/internship", internshipRoutes); // Disabled
app.get("/__health", (req, res) => res.json({ ok: true }));

// ✅ 5. Cron Worker
// Cron worker disabled: Playwright requires system dependencies not available in Vercel serverless environment
