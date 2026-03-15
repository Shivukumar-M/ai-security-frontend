import apiClient from "./config.js";

export const generateLogs = async (data) => {
  const response = await apiClient.post("/logs/generate", data);
  return response.data;
};
