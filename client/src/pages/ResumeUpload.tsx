import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { uploadResume } from "../services/resume/resume_service"; // ✅ updated service

// -----------------------------
// ErrorBoundary Component
// -----------------------------
class ErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  { hasError: boolean; error?: Error }
> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error caught in ResumeUpload boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong.
          </h2>
          <p className="text-gray-600 text-center">
            Please refresh the page or try again later.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// -----------------------------
// Main ResumeUpload Component
// -----------------------------
const ResumeUploadContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Checking user session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        User not found. Please login again.
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file only.");
        setResume(null);
        return;
      }

      setError(null);
      setResume(file);
    } catch (err) {
      console.error("File upload error:", err);
      setError("Something went wrong while uploading the file.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resume) {
      setError("Please upload your resume before submitting.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setStatusMessage("Uploading your resume...");

      // ✅ Step 1: Upload + Parse automatically
      const { upload, parse } = await uploadResume(resume, user._id);

      console.log("✅ Resume upload response:", upload);
      console.log("🧠 Resume parse response:", parse);

      setStatusMessage("Resume parsed successfully! Redirecting...");
      alert("Resume uploaded & parsed successfully!");

      // ✅ Step 2: Navigate to job recommendations or dashboard
      navigate("/jobs");
    } catch (err) {
      console.error("Error uploading or parsing resume:", err);
      setError("Failed to upload or parse resume. Please try again.");
      setStatusMessage("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Upload Your Resume
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Resume (PDF only)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
            {resume && (
              <p className="mt-2 text-sm text-green-600">
                Uploaded: {resume.name}
              </p>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <p className="mt-2 text-sm text-blue-600">{statusMessage}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-2 mt-3 text-white font-semibold rounded-lg transition-all ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading ? "Processing..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

// -----------------------------
// Wrapped Export with Boundary
// -----------------------------
const ResumeUpload: React.FC = () => {
  return (
    <ErrorBoundary>
      <ResumeUploadContent />
    </ErrorBoundary>
  );
};

export default ResumeUpload;
