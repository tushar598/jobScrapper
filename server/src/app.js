import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import resumeRoutes from "./routes/resumeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

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
