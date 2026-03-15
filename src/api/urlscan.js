import apiClient from "./config.js";

export const scanUrl = async (url) => {
  const res = await apiClient.post("/urlscan/", { url });
  return res.data;
};

export const getUrlScanHistory = async () => {
  const res = await apiClient.get("/urlscan/history/");
  return res.data;
};

export const getUrlScanById = async (id) => {
  const res = await apiClient.get(`/urlscan/${id}`);
  return res.data;
};
