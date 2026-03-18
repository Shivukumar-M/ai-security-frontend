import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔒 Prevent multiple redirects
let redirectingToIDS = false;

// --------------------
// Attach JWT
// --------------------
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --------------------
// Auth + IDS Response Handling
// --------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (
      (error.response?.status === 429 ||
        error.response?.status === 404) &&
      !redirectingToIDS
    ) {
      redirectingToIDS = true;

      if (window.location.pathname !== "/ids/live") {
        window.location.href = "/ids/live";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;





// import axios from "axios";
// import Cookies from "js-cookie";

// const apiClient = axios.create({
//   baseURL: "/api/v1",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // 🔒 Prevent multiple redirects
// let redirectingToIDS = false;

// // --------------------
// // Attach JWT
// // --------------------
// apiClient.interceptors.request.use((config) => {
//   const token = Cookies.get("access_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // --------------------
// // Auth + IDS Response Handling
// // --------------------
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // 🔐 Auth expired — clear token and send back to login
//     if (error.response?.status === 401) {
//       Cookies.remove("access_token");
//       if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
//         window.location.href = "/login";
//       }
//       return Promise.reject(error);
//     }

//     // 🚨 IDS BLOCK (redirect ONLY, no alerts)
//     if (
//       (error.response?.status === 429 ||
//         error.response?.status === 404) &&
//       !redirectingToIDS
//     ) {
//       redirectingToIDS = true;

//       if (window.location.pathname !== "/ids/live") {
//         window.location.href = "/ids/live";

       
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default apiClient;
