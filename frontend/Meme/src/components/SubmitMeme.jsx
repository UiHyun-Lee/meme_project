import React, { useState } from 'react'
import PhotoEditor from './PhotoEditor'
import html2canvas from 'html2canvas'
import { uploadMeme } from '../api'

const SubmitMeme = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const handleMemeCreate = async () => {
    try {
      setUploading(true)

      const container = document.getElementById('imgContainer')
      if (!container) return alert('Meme container not found!')

      // 이미지 로드 대기
      const imgs = container.getElementsByTagName('img')
      await Promise.all(Array.from(imgs).map(img => {
        if (!img.complete) return new Promise(res => { img.onload = res; img.onerror = res })
      }))

      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2,
        logging: true,
      })

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      const blob = await (await fetch(dataUrl)).blob()
      const form = new FormData()
      form.append('image_file', new File([blob], 'meme.jpg', { type: 'image/jpeg' }))
      form.append('caption', 'User created meme')
      form.append('created_by', 'human')
      form.append('template_id', selectedTemplate?.public_id)
      form.append('topic', selectedTemplate?.category?.name || 'unknown')
      form.append('format', selectedTemplate?.description || 'macro')
      const topicGuess = selectedTemplate?.public_id?.split('/')?.pop()?.split('_')?.[0] || 'unknown'
      form.append('topic', topicGuess)

      const res = await uploadMeme(form)
      setUploadedUrl(res.data.image)

      alert('Cloudinary + DB Upload Success!')
    } catch (err) {
      console.error('UPLOAD ERROR:', err.response?.data || err.message || err)
      alert('Upload failed! Check console.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="submit-container" style={{ color: 'white' }}>
      <h2>Submit Your Meme</h2>
      <PhotoEditor onMemeCreate={handleMemeCreate} onTemplateSelect={setSelectedTemplate} />
      {uploading && <p>Uploading... please wait ⏳</p>}
      {uploadedUrl && (
        <div style={{ marginTop: 20 }}>
          <h4>Uploaded Successfully 🎉</h4>
          <img src={uploadedUrl} alt="Uploaded Meme" style={{ width: 300, borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}

export default SubmitMeme
