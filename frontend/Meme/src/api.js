//import axios from 'axios'
//
//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
//
//// axios instance
//const API = axios.create({
//  baseURL: `${API_BASE_URL}/api/`,
//});
//
//API.interceptors.request.use(
//  (config) => {
//    const token = localStorage.getItem('accessToken')
//    if (token) {
//      config.headers = config.headers || {}
//      config.headers.Authorization = `Bearer ${token}`
//    }
//    return config
//  },
//  (error) => Promise.reject(error)
//)
//
////  Cloudinary template load
//export const getCloudTemplates = () => API.get('cloudinary-templates/')
//
//// user meme upload
//export const uploadMeme = (formData) =>
//  API.post('user-memes/', formData, {
//    headers: { 'Content-Type': 'multipart/form-data' },
//  })
//
//// random api
//export const getRandomMemes = () => API.get('memes/random/')
//
//// voting api
//export const voteMeme = (memeId) =>
//  API.post('memes/vote/', { meme_id: memeId })
//
//// leaderboard api
// export const getLeaderboard = () => API.get('leaderboard/')
//
// // Google Login
// export const googleLogin = (id_token) =>
//   axios.post(`${API_BASE_URL}/auth/google/`, { id_token });
//
//
//
//console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
//console.log("API_BASE_URL =", API_BASE_URL);
//
//
//export default API



import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// LOGOUT FUNCTION
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.reload();
};

// AXIOS INSTANCE
const API = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

// REQUEST INTERCEPTOR
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR (AUTO REFRESH)
let isRefreshing = false;
let pendingRequests = [];

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refreshToken");
      if (!refresh) {
        logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;

      try {
        const resp = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh,
        });

        const newAccessToken = resp.data.access;
        localStorage.setItem("accessToken", newAccessToken);

        API.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        pendingRequests.forEach(({ resolve }) => {
          resolve(API(originalRequest));
        });
        pendingRequests = [];

        return API(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expired or invalid → logout");
        pendingRequests.forEach(({ reject }) => reject(refreshError));
        pendingRequests = [];
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// AI MEME GENERATION

export const generateAiMemes = (templateId, count = 5) =>
  API.post("memes/ai-generate/", {
    template: templateId,
    count,
  });

export const generateMultipleAiMemes = (count = 5, templateIds = []) =>
  API.post("memes/ai-generate/multiple/", {
    count,
    template_ids: templateIds,
  });

// API FUNCTIONS

// Cloudinary template load
export const getCloudTemplates = () => API.get("cloudinary-templates/");

// user meme upload
export const uploadMeme = (formData) =>
  API.post("user-memes/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// random memes
export const getRandomMemes = () => API.get("memes/random/");

// voting api
export const voteMeme = (memeId) =>
  API.post("memes/vote/", { meme_id: memeId });

// leaderboard api
export const getLeaderboard = () => API.get("leaderboard/");

// Google Login
export const googleLogin = (id_token) =>
  axios.post(`${API_BASE_URL}/auth/google/`, { id_token });

// weekly topic
export const getCurrentTopic = () => API.get("memes/topic/current/");

export default API;
