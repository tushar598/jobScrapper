import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/RegisterPage";
import ResumeUpload from "../pages/ResumeUpload";
import JobListPage from "../pages/JobListPage";
import InternshipPage from "../pages/InternshipPage";
import Navbar from "../components/Navbar";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
      <Navbar />
      <Routes>
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/jobs" element={<JobListPage />} />
        <Route path="/internships" element={<InternshipPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
