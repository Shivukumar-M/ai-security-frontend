import apiClient from "./config.js";

const URL_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//;

export const normalizeUrlForScan = (rawUrl) => {
  const trimmed = String(rawUrl ?? "").trim();

  if (!trimmed) {
    throw new Error("Please enter a URL to scan.");
  }

  const candidate = URL_SCHEME_REGEX.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    return parsed.toString();
  } catch {
    throw new Error("Please enter a valid URL. Example: https://example.com");
  }
};

export const scanUrl = async (url) => {
  const normalizedUrl = normalizeUrlForScan(url);
  const res = await apiClient.post("/urlscan/", { url: normalizedUrl });
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
