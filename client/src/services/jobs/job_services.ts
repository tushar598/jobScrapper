import api from "../api";

export const fetchJobCards = async (userId: string) => {
  try {
    const response = await api.get(`/job/fetch/${userId}`);
    return response.data; // returns { message, total, jobs }
  } catch (error) {
    console.error("❌ Error fetching job cards:", error);
    throw new Error(
     "Failed to fetch job data"
    );
  }
};
