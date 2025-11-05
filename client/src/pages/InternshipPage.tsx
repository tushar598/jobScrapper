import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchInternCards } from "../services/internship/internship_service";

interface Internship {
  _id: string;
  title: string;
  company?: string;
  location?: string;
  platform?: string;
  link?: string;
  description?: string;
  skillsRequired?: string[];
  stipend?: string;
  duration?: string;
  postedAt?: string;
}

const InternshipPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const handleInternships = async () => {
    if (!user?._id) {
      alert("Please log in to view internships.");
      return;
    }

    try {
      setLoadingData(true);
      const response = await fetchInternCards(user._id);
      if (response?.internships) {
        setInternships(response.internships);
      } else {
        setInternships([]);
      }
    } catch (err) {
      console.error("Error fetching internships:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleApply = (url?: string) => {
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold text-center mb-10">
        Available Internship Opportunities
      </h1>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleInternships}
          disabled={loadingData || loading}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loadingData ? "Fetching..." : "Fetch Internships"}
        </button>
      </div>

      {loadingData ? (
        <p className="text-center text-gray-500 mt-10">
          Loading internships...
        </p>
      ) : internships.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {internships.map((internship) => (
            <div
              key={internship._id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  {internship.title}
                </h2>
                {internship.company && (
                  <p className="text-gray-600 mb-1">{internship.company}</p>
                )}
                {internship.location && (
                  <p className="text-gray-500 text-sm mb-3">
                    📍 {internship.location}
                  </p>
                )}

                {internship.stipend && (
                  <p className="text-green-600 font-medium mb-1">
                    💰 {internship.stipend}
                  </p>
                )}

                {internship.duration && (
                  <p className="text-blue-600 text-sm font-medium mb-3">
                    ⏳ Duration: {internship.duration}
                  </p>
                )}

                {internship.description && (
                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                    {internship.description}
                  </p>
                )}

                {internship.skillsRequired &&
                  internship.skillsRequired.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {internship.skillsRequired.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                {internship.platform && (
                  <p className="text-xs text-gray-400">
                    📦 Source: {internship.platform}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleApply(internship.link)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          No internships available. Click the button above to fetch data.
        </p>
      )}
    </div>
  );
};

export default InternshipPage;
