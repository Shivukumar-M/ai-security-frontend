import apiClient from "./config.js";
import Cookies from "js-cookie";

// OAuth2 form field is always called "username" — we pass the email value in it
export const loginUser = async ({ email, password }) => {
  const body = new URLSearchParams();
  body.append("username", email);   // backend reads this as email
  body.append("password", password);

  const res = await apiClient.post("/auth/token", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (res.data?.access_token) {
    Cookies.set("access_token", res.data.access_token, {
      expires: 7,
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });
  }

  return res.data;
};

export const registerUser = async (data) => {
  return (await apiClient.post("/auth/register", data)).data;
};

export const getMe = async () => {
  return (await apiClient.get("/auth/me")).data;
};
