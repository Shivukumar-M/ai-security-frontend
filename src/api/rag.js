// frontend/src/api/rag.js
import apiClient from "./config.js";

/** Get AI threat explanation via RAG endpoint */
export const getThreatExplanation = async (payload) => {
  const res = await apiClient.post("/rag/explain", payload);
  return res.data;
};
