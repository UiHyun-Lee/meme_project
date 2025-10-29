import React, { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import { getCloudTemplates } from '../api' // Cloudinary templates imgs from backend

export default function PhotoEditor({ onMemeCreate, onTemplateSelect })  {
  const [templates, setTemplates] = useState([]) // Cloudinary template lists
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [textElements, setTextElements] = useState([])
  const [currentText, setCurrentText] = useState(null)
  const [textColor, setTextColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(32)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [hasShadow, setHasShadow] = useState(true)
  const [textInput, setTextInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(true)

  const imgContainerRef = useRef(null)
  const previewRef = useRef(null)
  const textInputRef = useRef(null)

  const fontOptions = [
    'Arial', 'Impact', 'Verdana', 'Times New Roman', 'Georgia', 'Helvetica', 'Courier New', 'Comic Sans MS'
  ]

  //  Cloudinary template load
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await getCloudTemplates()
        setTemplates(res.data.templates)
      } catch (err) {
        console.error(' Error loading templates:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    if (onTemplateSelect) onTemplateSelect(template)
    setTextElements([])
    setCurrentText(null)
    setTextInput('')
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const addText = () => {
    if (!selectedTemplate) {
      alert('Choose a template')
      return
    }

    const textToAdd = textInput.trim() || 'Drag me'
    const newTextElement = {
      id: Date.now(),
      text: textToAdd,
      color: textColor,
      fontSize,
      fontFamily,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textDecoration: isUnderline ? 'underline' : 'none',
      textShadow: hasShadow ? '2px 2px 4px rgba(0,0,0,0.6)' : '',
      position: { x: 50, y: 50 }
    }

    setTextElements(prev => [...prev, newTextElement])
    setCurrentText(newTextElement)
    setTextInput('')

    setTimeout(() => textInputRef.current?.focus(), 100)
  }

  const updateText = () => {
    if (!currentText || !textInput.trim()) return

    setTextElements(prev =>
      prev.map(el => el.id === currentText.id ? { ...el, text: textInput.trim() } : el)
    )
    setTextInput('')
    setCurrentText(null)
  }

  const handleTextDoubleClick = (el) => {
    setTextInput(el.text)
    setCurrentText(el)
    setTimeout(() => {
      textInputRef.current?.focus()
      textInputRef.current?.select()
    }, 100)
  }

  // Drag & Drop
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !currentText) return
      const container = imgContainerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setTextElements(prev =>
        prev.map(el => el.id === currentText.id ? { ...el, position: { x, y } } : el)
      )
    }

    const handleMouseUp = () => setIsDragging(false)
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, currentText])

  const handleTextMouseDown = (e, el) => {
    e.preventDefault()
    setCurrentText(el)
    setIsDragging(true)
  }

  const handleTextClick = (el) => {
    setCurrentText(el)
    setTextColor(el.color)
    setFontSize(el.fontSize)
    setFontFamily(el.fontFamily)
    setIsBold(el.fontWeight === 'bold')
    setIsItalic(el.fontStyle === 'italic')
    setIsUnderline(el.textDecoration === 'underline')
    setHasShadow(!!el.textShadow)
  }

  const handleTextContextMenu = (e, el) => {
    e.preventDefault()
    if (window.confirm('delete?')) {
      setTextElements(prev => prev.filter(x => x.id !== el.id))
      if (currentText?.id === el.id) {
        setCurrentText(null)
        setTextInput('')
      }
    }
  }

  const handleImageClick = (e) => {
    if (e.target === imgContainerRef.current || e.target.tagName === 'IMG') {
      setCurrentText(null)
      setTextInput('')
    }
  }

  const updateCurrentTextStyle = (property, value) => {
    if (!currentText) return
    setTextElements(prev =>
      prev.map(el => el.id === currentText.id ? { ...el, [property]: value } : el)
    )
    setCurrentText(prev => prev ? { ...prev, [property]: value } : prev)
  }

  const handleCreateMeme = () => {
    if (!selectedTemplate) return alert('Choose your Templates first.')
    const memeData = { template: selectedTemplate, textElements }
    if (onMemeCreate) onMemeCreate(memeData)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') currentText ? updateText() : addText()
  }

  const handleButtonClick = () => {
    currentText ? updateText() : addText()
  }

  // loading text
  if (loading) return <p style={{ color: 'white' }}>Loading Cloudinary templates...</p>

  return (
    <div className="photo-editor" style={{ padding: 12 }}>
      <h2>Create Your Meme</h2>

      {/* template choice */}
      <div style={{ marginBottom: 12 }}>
        <h4>Choose a template</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {templates.map((t, i) => (
            <div key={t.public_id} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div
                onClick={() => handleTemplateSelect(t)}
                style={{
                  width: 120,
                  height: 80,
                  overflow: 'hidden',
                  borderRadius: 6,
                  border: selectedTemplate?.public_id === t.public_id ? '3px solid #4f46e5' : '1px solid rgba(0,0,0,0.2)'
                }}
              >
                <img
                  src={t.url}
                  alt={`Template ${i + 1}`}
                  crossOrigin="anonymous"  // ✅ CORS erlaubt
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Template {i + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ text config*/}
      {selectedTemplate && (
        <div ref={previewRef} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginTop: 20 }}>
          <div style={{
            flex: '2 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h4>Preview</h4>
            <div
              ref={imgContainerRef}
              id="imgContainer"
              onClick={handleImageClick}
              style={{
                position: 'relative',
                display: 'inline-block',
                padding: 8,
                background: '#fff',
                borderRadius: 8,
                minHeight: '400px',
                height: '400px',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <img
                src={selectedTemplate.url}
                alt="Selected"
                crossOrigin="anonymous"
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: 6
                }}
              />
              {textElements.map(el => (
                <div
                  key={el.id}
                  data-id={el.id}
                  className="meme-text"
                  onContextMenu={(e) => handleTextContextMenu(e, el)}
                  onClick={() => handleTextClick(el)}
                  onDoubleClick={() => handleTextDoubleClick(el)}
                  onMouseDown={(e) => handleTextMouseDown(e, el)}
                  style={{
                    position: 'absolute',
                    left: (el.position?.x ?? 50) + 'px',
                    top: (el.position?.y ?? 50) + 'px',
                    color: el.color,
                    fontSize: el.fontSize + 'px',
                    fontFamily: el.fontFamily,
                    fontWeight: el.fontWeight,
                    fontStyle: el.fontStyle,
                    textDecoration: el.textDecoration,
                    textShadow: el.textShadow,
                    cursor: isDragging && currentText?.id === el.id ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    padding: '4px 8px',
                    border: currentText?.id === el.id ? '2px dashed #4f46e5' : 'none',
                    backgroundColor: currentText?.id === el.id ? 'rgba(79,70,229,0.1)' : 'transparent',
                    zIndex: 1000
                  }}
                >
                  {el.text}
                </div>
              ))}
            </div>
          </div>

          {/* ✅ text option control */}
          <div style={{
            flex: '1 1 300px',
            background: 'rgba(0,0,0,0.05)',
            padding: 16,
            borderRadius: 8,
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h4>Text Options</h4>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 'bold' }}>Text:</label>
              <input
                ref={textInputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your text..."
                style={{
                  width: '100%', padding: '6px', border: '1px solid #ccc',
                  borderRadius: '4px', fontSize: '14px'
                }}
              />
              <button onClick={handleButtonClick} style={{ marginTop: 8, width: '100%' }}>
                {currentText ? 'Update Text' : 'Add Text'}
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 'bold' }}>Text Color:</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value)
                  updateCurrentTextStyle('color', e.target.value)
                }}
                disabled={!currentText}
                style={{ width: '100%', height: '35px' }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 'bold' }}>Font Size: {fontSize}px</label>
              <input
                type="range"
                value={fontSize}
                min={8}
                max={300}
                onChange={(e) => {
                  const s = parseInt(e.target.value, 10)
                  setFontSize(s)
                  updateCurrentTextStyle('fontSize', s)
                }}
                disabled={!currentText}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 'bold' }}>Font Family:</label>
              <select
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value)
                  updateCurrentTextStyle('fontFamily', e.target.value)
                }}
                disabled={!currentText}
                style={{ width: '100%', padding: '6px' }}
              >
                {fontOptions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Text Effects */}
<div style={{ marginBottom: 12, flex: 1 }}>
  <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: '14px' }}>
    Text Effects:
  </label>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
    <button
      onClick={() => {
        setIsBold(!isBold);
        updateCurrentTextStyle('fontWeight', !isBold ? 'bold' : 'normal');
      }}
      disabled={!currentText}
      style={{
        padding: '6px 8px',
        fontSize: '12px',
        backgroundColor: isBold ? '#4f46e5' : '#f3f4f6',
        color: isBold ? 'white' : 'black',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        cursor: currentText ? 'pointer' : 'not-allowed'
      }}
    >
      Bold
    </button>

    <button
      onClick={() => {
        setIsItalic(!isItalic);
        updateCurrentTextStyle('fontStyle', !isItalic ? 'italic' : 'normal');
      }}
      disabled={!currentText}
      style={{
        padding: '6px 8px',
        fontSize: '12px',
        backgroundColor: isItalic ? '#4f46e5' : '#f3f4f6',
        color: isItalic ? 'white' : 'black',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        cursor: currentText ? 'pointer' : 'not-allowed'
      }}
    >
      Italic
    </button>

    <button
      onClick={() => {
        setIsUnderline(!isUnderline);
        updateCurrentTextStyle('textDecoration', !isUnderline ? 'underline' : 'none');
      }}
      disabled={!currentText}
      style={{
        padding: '6px 8px',
        fontSize: '12px',
        backgroundColor: isUnderline ? '#4f46e5' : '#f3f4f6',
        color: isUnderline ? 'white' : 'black',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        cursor: currentText ? 'pointer' : 'not-allowed'
      }}
    >
      Underline
    </button>

    <button
      onClick={() => {
        setHasShadow(!hasShadow);
        updateCurrentTextStyle('textShadow', !hasShadow ? '2px 2px 4px rgba(0,0,0,0.6)' : '');
      }}
      disabled={!currentText}
      style={{
        padding: '6px 8px',
        fontSize: '12px',
        backgroundColor: hasShadow ? '#4f46e5' : '#f3f4f6',
        color: hasShadow ? 'white' : 'black',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        cursor: currentText ? 'pointer' : 'not-allowed'
      }}
    >
      Shadow
    </button>
  </div>
</div>

          </div>
        </div>


      )}

      {/* ✅ Submit btn */}
      {selectedTemplate && (
        <div style={{
          marginTop: 30,
          textAlign: 'center',
          borderTop: '2px solid #e5e7eb',
          paddingTop: 20
        }}>
          <button
            onClick={handleCreateMeme}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Submit Meme
          </button>
        </div>
      )}
    </div>
  )
}
