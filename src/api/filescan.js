import apiClient from "./config.js";

/** Uploads a file to VirusTotal hash checker */
export const scanFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/filescan/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
