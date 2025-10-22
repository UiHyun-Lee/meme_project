import axios from 'axios'

// Django 서버 URL
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
})

// ✅ Cloudinary template load
export const getCloudTemplates = () => API.get('cloudinary-templates/')

// user meme upload
export const uploadMeme = (formData) =>
  API.post('user-memes/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
