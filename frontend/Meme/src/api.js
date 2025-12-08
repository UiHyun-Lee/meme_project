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

// ---------------------------
// LOGOUT FUNCTION
// ---------------------------
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.reload();
};

// ---------------------------
// AXIOS INSTANCE
// ---------------------------
const API = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

// ---------------------------
// REQUEST INTERCEPTOR
// ---------------------------
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

// ---------------------------
// RESPONSE INTERCEPTOR (AUTO REFRESH)
// ---------------------------
let isRefreshing = false;
let pendingRequests = [];

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // access 토큰 만료로 인한 401 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refreshToken");
      if (!refresh) {
        // refresh 토큰도 없으면 그냥 로그아웃
        logout();
        return Promise.reject(error);
      }

      // 이미 다른 요청이 refresh 중이면 → 끝날 때까지 기다렸다가 재요청
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;

      try {
        // ✅ 네 백엔드 refresh 엔드포인트: /api/token/refresh/
        const resp = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh,
        });

        const newAccessToken = resp.data.access;
        localStorage.setItem("accessToken", newAccessToken);

        // 새 토큰을 axios 인스턴스와 현재 요청에 반영
        API.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 대기중이던 요청들 처리
        pendingRequests.forEach(({ resolve }) => {
          resolve(API(originalRequest));
        });
        pendingRequests = [];

        // 현재 요청 재시도
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

// ---------------------------
// API FUNCTIONS
// ---------------------------

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

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("API_BASE_URL =", API_BASE_URL);

export default API;
