import axios from 'axios'

// Django 서버 URL
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
})

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
export const voteMeme = (memeId, scores) =>
  API.post('evaluations/', {
    meme: memeId,
    humor_score: scores.humor_score,
    cultural_score: scores.cultural_score,
    creativity_score: scores.creativity_score,
    comment: '',
    user_id: 'Uihyun Lee',
  })

// leaderboard api
 export const getLeaderboard = () => API.get('leaderboard/')