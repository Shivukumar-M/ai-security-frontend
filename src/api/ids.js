import apiClient from "./config.js";

/* =================================================
   BATCH IDS (FILE UPLOAD + SIMULATED LOGS)
================================================= */


export const analyzeLogFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/ids/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


export const generateSimulatedLogs = async (type, count) => {
  const response = await apiClient.get(
    `/ids/generate?type=${type}&count=${count}`
  );
  return response.data;
};

/* =================================================
   🔥 REAL-TIME IDS (MIDDLEWARE-BASED)
================================================= */


export const getLiveIDSAlerts = async () => {
  const response = await apiClient.get("/ids/realtime/alerts");
  return response.data;
};

/* =================================================
   🤖 AI EXPLANATION (RAG-POWERED)
================================================= */


export const explainIDSAlert = async (alert) => {
  const response = await apiClient.post("/ids/realtime/explain", {
    alert,
  });
  return response.data;
};
