import api from "./config";

export const getLiveIDSAlerts = async () => {
  const res = await api.get("/ids/realtime/alerts");
  return res.data;
};
