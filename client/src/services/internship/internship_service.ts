import api from "../api";

export const fetchInternCards = async (userId: string) => {
  try {
    const response = await api.get(`/internship/scrape/${userId}`);
    return response.data; // returns { message, total, jobs }
  } catch (error) {
    console.error("❌ Error fetching intership cards:", error);
    throw new Error("Failed to fetch internship data");
  }
};
