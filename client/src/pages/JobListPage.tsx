import React, { useState } from "react";
import { fetchJobCards } from "../services/jobs/job_services";
import { useAuth } from "../hooks/useAuth";

interface Job {
  _id: string;
  title: string;
  company?: string;
  location?: string;
  platform?: string;
  link?: string;
  description?: string;
  skillsRequired?: string[];
  salary?: string;
  postedAt?: string;
  dateFetched?: string;
}

const JobListPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Manual trigger — not automatic
  const handleFetchJobs = async () => {
    if (!user?._id) {
      setError("User not found. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchJobCards(user._id);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      setError("Failed to load job data");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (url?: string) => {
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Available Job Opportunities
      </h1>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleFetchJobs}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Fetching..." : "Fetch Job Listings"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-center text-red-500 mb-6 font-medium">{error}</p>
      )}

      {/* Job Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {!loading &&
          jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  {job.title}
                </h2>

                {job.company && (
                  <p className="text-gray-700 mb-1">
                    🏢 <span className="font-medium">{job.company}</span>
                  </p>
                )}

                {job.location && (
                  <p className="text-gray-600 mb-1">📍 {job.location}</p>
                )}

                {job.salary && (
                  <p className="text-green-700 font-semibold mb-2">
                    💰 {job.salary}
                  </p>
                )}

                {job.description && (
                  <p className="text-gray-700 text-sm mb-3 whitespace-pre-line">
                    📝 {job.description}
                  </p>
                )}

                {job.skillsRequired && job.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.skillsRequired.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500 space-y-1 mt-2">
                  {job.platform && <p>📦 Source: {job.platform}</p>}
                  {job.postedAt && <p>🗓️ Posted: {job.postedAt}</p>}
                  {job.dateFetched && (
                    <p>
                      📅 Fetched:{" "}
                      {new Date(job.dateFetched).toLocaleDateString()}
                    </p>
                  )}
                  {job.link && (
                    <p className="truncate text-blue-600">
                      🔗{" "}
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {job.link}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleApply(job.link)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                Apply Now
              </button>
            </div>
          ))}
      </div>

      {/* No Jobs */}
      {!loading && jobs.length === 0 && !error && (
        <p className="text-center text-gray-500 mt-10">
          No job opportunities found.
        </p>
      )}
    </div>
  );
};

export default JobListPage;
