// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
// import { uploadResume } from "../services/resume/upload/resume_service";
// import getResume from "../services/resume/get/getresume_service";

// // -----------------------------
// // ErrorBoundary Component
// // -----------------------------
// class ErrorBoundary extends React.Component<
//   React.PropsWithChildren<object>,
//   { hasError: boolean; error?: Error }
// > {
//   constructor(props: React.PropsWithChildren<object>) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(error: Error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error: Error, info: React.ErrorInfo) {
//     console.error("Error caught in ResumeUpload boundary:", error, info);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f0f]">
//           <h2 className="text-2xl font-bold text-green-400 mb-4">
//             Something went wrong.
//           </h2>
//           <p className="text-gray-400 text-center">
//             Please refresh the page or try again later.
//           </p>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// // -----------------------------
// // Main ResumeUpload Component
// // -----------------------------
// const ResumeUploadContent: React.FC = () => {
//   const navigate = useNavigate();
//   const { user, loading } = useAuth();

//   const [name, setName] = useState<string>("");
//   const [email, setEmail] = useState<string>("");

//   const [resume, setResume] = useState<File | null>(null);
//   const [resumeUrl, setResumeUrl] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const [statusMessage, setStatusMessage] = useState<string>("");
//   const [checkingResume, setCheckingResume] = useState<boolean>(true);

//   // Prefill user info
//   useEffect(() => {
//     if (user) {
//       setName(user.name || "");
//       setEmail(user.email || "");
//     }
//   }, [user]);

//   // ✅ Check if resume already exists
//   useEffect(() => {
//     const fetchResume = async () => {
//       if (!user?._id) return;

//       try {
//         setCheckingResume(true);
//         const result = await getResume(user._id);

//         if (result.success && result.file) {
//           const blobUrl = URL.createObjectURL(result.file);
//           setResumeUrl(blobUrl);
//           console.log("Existing resume found:", result.fileName);
//         } else {
//           console.log(result.error);
//         }
//       } catch (err) {
//         console.error("Error fetching resume:", err);
//       } finally {
//         setCheckingResume(false);
//       }
//     };

//     fetchResume();
//   }, [user]);

//   if (loading || checkingResume) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-[#0f0f0f] text-gray-400">
//         <div className="text-center">
//           <div className="inline-block w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>
//           <p>Checking user and resume status...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-[#0f0f0f] text-gray-400">
//         User not found. Please login again.
//       </div>
//     );
//   }

//   // -----------------------------
//   // File Upload Logic
//   // -----------------------------
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     try {
//       const file = e.target.files?.[0];
//       if (!file) return;

//       if (file.type !== "application/pdf") {
//         setError("Please upload a PDF file only.");
//         setResume(null);
//         return;
//       }

//       setError(null);
//       setResume(file);
//     } catch (err) {
//       console.error("File upload error:", err);
//       setError("Something went wrong while uploading the file.");
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!resume) {
//       setError("Please upload your resume before submitting.");
//       return;
//     }

//     try {
//       setUploading(true);
//       setError(null);
//       setStatusMessage("Uploading your resume...");

//       const { upload, parse } = await uploadResume(resume, user._id);

//       console.log("✅ Resume upload response:", upload);
//       console.log("🧠 Resume parse response:", parse);

//       setStatusMessage("Resume parsed successfully! Redirecting...");
//       alert("Resume uploaded & parsed successfully!");

//       navigate("/jobs");
//     } catch (err) {
//       console.error("Error uploading or parsing resume:", err);
//       setError("Failed to upload or parse resume. Please try again.");
//       setStatusMessage("");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // -----------------------------
//   // UI Logic
//   // -----------------------------
//   if (resumeUrl) {
//     // ✅ Show resume preview if available
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f0f] p-4 sm:p-6">
//         <div className="w-full max-w-4xl bg-[#1a1a1a] p-4 sm:p-8 rounded-2xl shadow-2xl border border-gray-800">
//           <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
//             Your Uploaded <span className="text-green-400">Resume</span>
//           </h2>

//           <div className="bg-[#0f0f0f] p-2 rounded-xl border border-gray-800">
//             <iframe
//               src={resumeUrl}
//               title="User Resume"
//               className="w-full h-[60vh] sm:h-[75vh] rounded-lg"
//             ></iframe>
//           </div>

//           <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
//             <button
//               onClick={() => setResumeUrl(null)}
//               className="px-8 py-3 bg-green-400 text-black font-bold rounded-full hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-400/50"
//             >
//               Replace Resume
//             </button>
//             <button
//               onClick={() => navigate("/jobs")}
//               className="px-8 py-3 bg-transparent border-2 border-green-400 text-green-400 font-bold rounded-full hover:bg-green-400 hover:text-black transition-all duration-300 transform hover:scale-105"
//             >
//               Browse Jobs
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ✅ Else, show upload form
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f] p-4 sm:p-6">
//       <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-10 bg-[#1a1a1a] rounded-3xl shadow-2xl border border-gray-800">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
//             Upload Your <span className="text-green-400">Resume</span>
//           </h2>
//           <p className="text-gray-400 text-sm sm:text-base">
//             Get matched with the best job opportunities
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Name */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-300 mb-2">
//               Full Name
//             </label>
//             <input
//               type="text"
//               value={name}
//               readOnly
//               className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-[#0f0f0f] text-gray-300 cursor-not-allowed focus:outline-none focus:border-green-400 transition-colors"
//             />
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-300 mb-2">
//               Email Address
//             </label>
//             <input
//               type="email"
//               value={email}
//               readOnly
//               className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-[#0f0f0f] text-gray-300 cursor-not-allowed focus:outline-none focus:border-green-400 transition-colors"
//             />
//           </div>

//           {/* Resume Upload */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-300 mb-2">
//               Upload Resume (PDF only)
//             </label>
//             <div className="relative">
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 onChange={handleFileChange}
//                 className="w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-green-400 file:text-black file:font-bold hover:file:bg-green-400 file:cursor-pointer cursor-pointer bg-[#0f0f0f] border border-gray-700 rounded-xl p-2 focus:outline-none focus:border-green-400 transition-colors"
//               />
//             </div>
//             {resume && (
//               <div className="mt-3 flex items-center gap-2 text-sm text-green-400 bg-[#0f0f0f] px-4 py-2 rounded-lg border border-green-400/30">
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//                 <span className="truncate">{resume.name}</span>
//               </div>
//             )}
//             {error && (
//               <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-400/30">
//                 <svg
//                   className="w-5 h-5 flex-shrink-0"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//                 <span>{error}</span>
//               </div>
//             )}
//           </div>

//           {statusMessage && (
//             <div className="flex items-center gap-2 text-sm text-green-400 bg-[#0f0f0f] px-4 py-3 rounded-lg border border-green-400/30">
//               <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
//               <span>{statusMessage}</span>
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={uploading}
//             className={`w-full py-4 mt-4 text-black font-bold text-lg rounded-full transition-all duration-300 transform ${
//               uploading
//                 ? "bg-gray-600 cursor-not-allowed"
//                 : "bg-green-400 hover:bg-green-400 hover:scale-105 hover:shadow-lg hover:shadow-green-400/50"
//             }`}
//           >
//             {uploading ? (
//               <span className="flex items-center justify-center gap-3">
//                 <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
//                 Processing...
//               </span>
//             ) : (
//               "Submit Resume"
//             )}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-gray-500 text-xs sm:text-sm">
//             Your resume will be securely stored and parsed for job matching
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // -----------------------------
// // Wrapped Export with Boundary
// // -----------------------------
// const ResumeUpload: React.FC = () => {
//   return (
//     <ErrorBoundary>
//       <ResumeUploadContent />
//     </ErrorBoundary>
//   );
// };

// export default ResumeUpload;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { uploadResume } from "../services/resume/upload/resume_service";
import getResume from "../services/resume/get/getresume_service";

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a]">
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            Something went wrong.
          </h2>
          <p className="text-gray-400 text-center">
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
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [checkingResume, setCheckingResume] = useState<boolean>(true);

  // Prefill user info
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // ✅ Check if resume already exists
  useEffect(() => {
    const fetchResume = async () => {
      if (!user?._id) return;

      try {
        setCheckingResume(true);
        const result = await getResume(user._id);

        if (result.success && result.file) {
          const blobUrl = URL.createObjectURL(result.file);
          setResumeUrl(blobUrl);
          console.log("Existing resume found:", result.fileName);
        } else {
          console.log(result.error);
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
      } finally {
        setCheckingResume(false);
      }
    };

    fetchResume();
  }, [user]);

  if (loading || checkingResume) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0a] text-gray-400">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg">Checking user and resume status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0a] text-gray-400">
        User not found. Please login again.
      </div>
    );
  }

  // -----------------------------
  // File Upload Logic
  // -----------------------------
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

      const { upload, parse } = await uploadResume(resume, user._id);

      console.log("✅ Resume upload response:", upload);
      console.log("🧠 Resume parse response:", parse);

      setStatusMessage("Resume parsed successfully! Redirecting...");
      alert("Resume uploaded & parsed successfully!");

      navigate("/jobs");
    } catch (err) {
      console.error("Error uploading or parsing resume:", err);
      setError("Failed to upload or parse resume. Please try again.");
      setStatusMessage("");
    } finally {
      setUploading(false);
    }
  };

  // -----------------------------
  // UI Logic
  // -----------------------------
  if (resumeUrl) {
    // ✅ Show resume preview if available
    return (
      <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-green-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-green-400 rounded-full opacity-5 blur-3xl"></div>

        <div className="relative z-10 container mx-auto px-4 py-8 sm:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                Your Professional <br className="hidden sm:block" />
                <span className="text-green-400">Resume</span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                Your resume is ready for job matching opportunities
              </p>
            </div>

            {/* Resume Preview Card */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-4 sm:p-8 shadow-2xl border border-gray-800/50 backdrop-blur-sm">
              <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-gray-800/30 shadow-inner">
                <iframe
                  src={resumeUrl}
                  title="User Resume"
                  className="w-full h-[60vh] sm:h-[70vh] lg:h-[75vh]"
                ></iframe>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setResumeUrl(null)}
                  className="w-full sm:w-auto px-8 sm:px-12 py-4 bg-green-400 text-black font-bold text-base sm:text-lg rounded-full hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-400/50 hover:shadow-xl"
                >
                  Replace Resume
                </button>
                <button
                  onClick={() => navigate("/jobs")}
                  className="w-full sm:w-auto px-8 sm:px-12 py-4 bg-transparent border-2 border-green-400 text-green-400 font-bold text-base sm:text-lg rounded-full hover:bg-green-400 hover:text-black transition-all duration-300 transform hover:scale-105"
                >
                  Browse Jobs →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Else, show upload form
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-400 rounded-full opacity-5 blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-8 sm:mb-12">
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight">
                Upload Your <br />
                <span className="text-green-400">Professional Resume</span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 leading-relaxed">
                Get matched with the best job opportunities tailored to your
                skills and experience
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 sm:gap-8 justify-center lg:justify-start">
                <div className="text-center lg:text-left">
                  <div className="text-3xl sm:text-4xl font-bold text-green-400">
                    1000+
                  </div>
                  <div className="text-gray-500 text-sm sm:text-base">
                    Job Listings
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl sm:text-4xl font-bold text-green-400">
                    500+
                  </div>
                  <div className="text-gray-500 text-sm sm:text-base">
                    Companies
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl sm:text-4xl font-bold text-green-400">
                    95%
                  </div>
                  <div className="text-gray-500 text-sm sm:text-base">
                    Match Rate
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - User Profile Placeholder */}
            <div className="flex justify-center items-center order-1 lg:order-2">
              <div className="relative">
                {/* Large Green Circle Background */}
                <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-green-400 rounded-full opacity-90"></div>

                {/* User Profile Image Placeholder */}
                <div className="absolute inset-0 flex items-end justify-center pb-0">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-gradient-to-b from-gray-700 to-gray-600 rounded-full flex items-center justify-center border-4 border-green-400/30">
                    <div className="text-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm font-semibold">
                        Your Profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Form Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-gray-800/50 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-white mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    readOnly
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-700 rounded-2xl bg-[#0a0a0a] text-gray-300 text-base cursor-not-allowed focus:outline-none focus:border-green-400 transition-all duration-300"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-white mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-700 rounded-2xl bg-[#0a0a0a] text-gray-300 text-base cursor-not-allowed focus:outline-none focus:border-green-400 transition-all duration-300"
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-white mb-3">
                    Upload Resume (PDF only)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="w-full text-sm sm:text-base text-gray-400 file:mr-4 file:py-3 sm:file:py-4 file:px-6 sm:file:px-8 file:rounded-full file:border-0 file:bg-green-400 file:text-black file:font-bold file:text-sm sm:file:text-base hover:file:bg-green-400 file:cursor-pointer file:transition-all file:duration-300 cursor-pointer bg-[#0a0a0a] border-2 border-gray-700 rounded-2xl p-3 sm:p-4 focus:outline-none focus:border-green-400 transition-all duration-300"
                    />
                  </div>

                  {/* Success Message */}
                  {resume && (
                    <div className="mt-4 flex items-center gap-3 text-sm sm:text-base text-green-400 bg-green-400/10 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 border-green-400/50">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="truncate font-semibold">
                        {resume.name}
                      </span>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 flex items-start gap-3 text-sm sm:text-base text-red-400 bg-red-900/20 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border-2 border-red-400/50">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-semibold">{error}</span>
                    </div>
                  )}
                </div>

                {/* Status Message */}
                {statusMessage && (
                  <div className="flex items-center gap-3 text-sm sm:text-base text-green-400 bg-green-400/10 px-4 sm:px-5 py-4 rounded-2xl border-2 border-green-400/50">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-green-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                    <span className="font-semibold">{statusMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full py-4 sm:py-5 mt-6 text-black font-bold text-base sm:text-lg lg:text-xl rounded-full transition-all duration-300 transform ${
                    uploading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-green-400 hover:bg-green-400 hover:scale-105 hover:shadow-2xl hover:shadow-green-400/50"
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    "Submit Resume →"
                  )}
                </button>
              </form>

              {/* Footer Note */}
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  🔒 Your resume will be securely stored and parsed for
                  intelligent job matching
                </p>
              </div>
            </div>
          </div>
        </div>
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
