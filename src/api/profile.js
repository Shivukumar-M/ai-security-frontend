import api from "./config";

// --------------------------------------------------
// Fetch logged-in user profile
// --------------------------------------------------
export const getMyProfile = async () => {
  const res = await api.get("/profile/me");
  return res.data;
};

// --------------------------------------------------
// Update profile
// --------------------------------------------------
export const updateMyProfile = async (data) => {
  const res = await api.put("/profile/me", data);
  return res.data;
};

// --------------------------------------------------
// Upload avatar
// --------------------------------------------------
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// --------------------------------------------------
// Change password
// --------------------------------------------------
export const changeMyPassword = async (data) => {
  const res = await api.put("/profile/change-password", data);
  return res.data;
};

// (OPTIONAL backward compatibility – safe)
export const changePassword = changeMyPassword;

// --------------------------------------------------
// Fetch security summary for Profile page
// --------------------------------------------------
export const getProfileSecuritySummary = async () => {
  const res = await api.get("/profile/security-summary");
  return res.data;
};
