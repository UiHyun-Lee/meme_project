//import axios from 'axios'
//
//// Django server URL
//const API = axios.create({
//  baseURL: 'http://127.0.0.1:8000/api/',
//})
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
////export const voteMeme = (memeId, scores) =>
////  API.post('evaluations/', {
////    meme: memeId,
////    humor_score: scores.humor_score,
////    cultural_score: scores.cultural_score,
////    creativity_score: scores.creativity_score,
////    comment: '',
////    user_id: 'Uihyun Lee',
////  })
//// for votingsystem
//
//// leaderboard api
// export const getLeaderboard = () => API.get('leaderboard/')
//
// // Google Login
// export const googleLogin = (id_token) =>
//  axios.post("http://127.0.0.1:8000/auth/google/", { id_token });
//
//export default API

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// 🚀 2. axios instance
const API = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

//  Cloudinary template load
export const getCloudTemplates = () => API.get('cloudinary-templates/')

// user meme upload
export const uploadMeme = (formData) =>
  API.post('user-memes/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// random api
export const getRandomMemes = () => API.get('memes/random/')

// voting api
export const voteMeme = (memeId) =>
  API.post('memes/vote/', { meme_id: memeId })

//export const voteMeme = (memeId, scores) =>
//  API.post('evaluations/', {
//    meme: memeId,
//    humor_score: scores.humor_score,
//    cultural_score: scores.cultural_score,
//    creativity_score: scores.creativity_score,
//    comment: '',
//    user_id: 'Uihyun Lee',
//  })
// for votingsystem

// leaderboard api
 export const getLeaderboard = () => API.get('leaderboard/')

 // Google Login
 export const googleLogin = (id_token) =>
   axios.post(`${API_BASE_URL}/auth/google/`, { id_token });



console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("API_BASE_URL =", API_BASE_URL);


export default API