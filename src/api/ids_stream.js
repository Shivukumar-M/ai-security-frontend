// frontend/src/api/ids_stream.js
import api from "./config";

export const analyzeStreamEvent = async (event) => {
  const res = await api.post("/ids/stream/analyze", event);
  return res.data;
};
