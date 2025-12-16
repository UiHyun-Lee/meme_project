import React, { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import { getCloudTemplates } from '../api' // Cloudinary templates from backend

export default function PhotoEditor({ onMemeCreate, onTemplateSelect }) {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [textElements, setTextElements] = useState([])
  const [currentText, setCurrentText] = useState(null)

  // Defaults for NEW text (also used when editing)
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

  // Refs
  const imgContainerRef = useRef(null)
  const previewRef = useRef(null)
  const textInputRef = useRef(null)
  const lastTapRef = useRef(0)
  const tapTimeoutRef = useRef(null)

  // Pinch zoom refs (mobile)
  const pinchStartDistanceRef = useRef(null)
  const pinchStartFontSizeRef = useRef(null)

  // Measure each text node size (for clamping inside image)
  const textNodeRefs = useRef({})

  // Drag offset so the text doesn't "jump" and can't be pushed out
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const isMobileRef = useRef(false)

  useEffect(() => {
    isMobileRef.current =
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      'ontouchstart' in window
  }, [])


  const fontOptions = [
    'Arial',
    'Impact',
    'Verdana',
    'Times New Roman',
    'Georgia',
    'Helvetica',
    'Courier New',
    'Comic Sans MS'
  ]

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Load Cloudinary templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await getCloudTemplates()
        console.log('templates res.data =', res.data)

        const data = Array.isArray(res.data) ? res.data : (res.data.results || res.data)
        setTemplates(data || [])
      } catch (err) {
        console.error('Error loading templates:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  // Template select
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

  // Select text element (click/tap) => enters update mode
  const selectTextElement = (el) => {
    setCurrentText(el)
    setTextInput(el.text)
    setTextColor(el.color)
    setFontSize(el.fontSize)
    setFontFamily(el.fontFamily)
    setIsBold(el.fontWeight === 'bold')
    setIsItalic(el.fontStyle === 'italic')
    setIsUnderline(el.textDecoration === 'underline')
    setHasShadow(!!el.textShadow)

    setTimeout(() => {
      textInputRef.current?.focus()
      textInputRef.current?.select()
    }, 50)
  }

  // Add text (uses current style settings)
  const addText = () => {
    if (!selectedTemplate) return alert('Choose a template first.')

    const newText = {
      id: Date.now(),
      text: textInput.trim() || 'Drag me',
      color: textColor,
      fontSize,
      fontFamily,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textDecoration: isUnderline ? 'underline' : 'none',
      textShadow: hasShadow ? '2px 2px 4px rgba(0,0,0,0.6)' : '',
      position: { x: 50, y: 50 }
    }

    setTextElements(prev => [...prev, newText])

    // stay in add mode for next text
    setCurrentText(null)
    setTextInput('')
    setTimeout(() => textInputRef.current?.focus(), 100)
  }

  const updateText = () => {
    if (!currentText) return

    setTextElements(prev =>
      prev.map(el =>
        el.id === currentText.id
          ? {
              ...el,
              text: textInput,
              color: textColor,
              fontSize,
              fontFamily,
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isUnderline ? 'underline' : 'none',
              textShadow: hasShadow ? '2px 2px 4px rgba(0,0,0,0.6)' : '',
            }
          : el
      )
    )

    // back to add mode
    setCurrentText(null)
    setTextInput('')
  }

  // Shift+Enter = newline, Enter = Add/Update
  const handleTextareaKeyDown = (e) => {
    if (e.key !== 'Enter') return

    // ✅ Mobile: Enter = neue Zeile (default), nix submitten
    if (isMobileRef.current) return

    // ✅ Desktop: Shift+Enter = neue Zeile, Enter = Add/Update
    if (e.shiftKey) return
    e.preventDefault()
    currentText ? updateText() : addText()
  }


  // Clamp helper: keep text fully inside all edges
  const clampPositionToContainer = (x, y, elId) => {
    const container = imgContainerRef.current
    const node = textNodeRefs.current[elId]
    if (!container || !node) return { x, y }

    const cw = container.clientWidth
    const ch = container.clientHeight
    const tw = node.offsetWidth || 0
    const th = node.offsetHeight || 0

    const maxX = Math.max(0, cw - tw)
    const maxY = Math.max(0, ch - th)

    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
    }
  }

  // Drag handling
  const updateTextPosition = (clientX, clientY) => {
    if (!isDragging || !currentText) return
    const container = imgContainerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()

    // keep pointer in same place on the text while dragging
    let x = clientX - rect.left - dragOffsetRef.current.x
    let y = clientY - rect.top - dragOffsetRef.current.y

    // clamp inside all 4 edges
    const clamped = clampPositionToContainer(x, y, currentText.id)
    x = clamped.x
    y = clamped.y

    setTextElements(prev =>
      prev.map(el =>
        el.id === currentText.id ? { ...el, position: { x, y } } : el
      )
    )
  }

  const handleMouseDown = (e, el) => {
    e.preventDefault()
    selectTextElement(el)

    const container = imgContainerRef.current
    if (container) {
      const rect = container.getBoundingClientRect()
      dragOffsetRef.current = {
        x: (e.clientX - rect.left) - el.position.x,
        y: (e.clientY - rect.top) - el.position.y
      }
    }

    setIsDragging(true)
  }

  // Touch: single tap selects, double tap deletes, pinch to resize font
  const handleTextTap = (el) => {
    const now = Date.now()
    const diff = now - lastTapRef.current

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current)
      tapTimeoutRef.current = null
    }

    // double tap => delete
    if (diff < 300 && diff > 0) {
      if (window.confirm('Delete this text?')) {
        setTextElements(prev => prev.filter(x => x.id !== el.id))
        if (currentText?.id === el.id) {
          setCurrentText(null)
          setTextInput('')
        }
      }
      return
    }

    // single tap => select
    lastTapRef.current = now
    tapTimeoutRef.current = setTimeout(() => {
      selectTextElement(el)
      tapTimeoutRef.current = null
    }, 300)
  }

  const handleTouchStart = (e, el) => {
    handleTextTap(el)

    // pinch start
    if (e.touches.length === 2) {
      pinchStartDistanceRef.current = getTouchDistance(e.touches)
      pinchStartFontSizeRef.current = el.fontSize
      return
    }

    setIsDragging(true)
    const touch = e.touches[0]

    const container = imgContainerRef.current
    if (container && currentText) {
      const rect = container.getBoundingClientRect()
      dragOffsetRef.current = {
        x: (touch.clientX - rect.left) - currentText.position.x,
        y: (touch.clientY - rect.top) - currentText.position.y
      }
    }

    updateTextPosition(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e) => {
    if (!currentText) return
    // ✅ no e.preventDefault() here -> avoids passive listener warning

    // pinch move
    if (e.touches.length === 2 && pinchStartDistanceRef.current && pinchStartFontSizeRef.current) {
      const newDistance = getTouchDistance(e.touches)
      const scale = newDistance / pinchStartDistanceRef.current
      const newFont = Math.min(300, Math.max(8, Math.round(pinchStartFontSizeRef.current * scale)))

      setFontSize(newFont)

      setTextElements(prev =>
        prev.map(el => (el.id === currentText.id ? { ...el, fontSize: newFont } : el))
      )
      setCurrentText(prev => (prev ? { ...prev, fontSize: newFont } : prev))

      // after size change, clamp again
      requestAnimationFrame(() => {
        const elState = textElements.find(t => t.id === currentText.id)
        const pos = elState?.position || currentText.position || { x: 0, y: 0 }
        const clamped = clampPositionToContainer(pos.x, pos.y, currentText.id)
        setTextElements(prev =>
          prev.map(el => (el.id === currentText.id ? { ...el, position: clamped } : el))
        )
      })

      return
    }

    // drag move
    if (isDragging) {
      const touch = e.touches[0]
      updateTextPosition(touch.clientX, touch.clientY)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    pinchStartDistanceRef.current = null
    pinchStartFontSizeRef.current = null
  }

  useEffect(() => {
    const handleMouseMove = (e) => updateTextPosition(e.clientX, e.clientY)
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

  // Context delete
  const handleContextMenu = (e, el) => {
    e.preventDefault()
    if (window.confirm('Delete this text?')) {
      setTextElements(prev => prev.filter(x => x.id !== el.id))
      if (currentText?.id === el.id) {
        setCurrentText(null)
        setTextInput('')
      }
    }
  }

  // Style update: if editing, update element; if not editing, just update defaults for next text
  const updateStyle = (prop, val) => {
    if (!currentText) return
    setTextElements(prev => prev.map(el => (el.id === currentText.id ? { ...el, [prop]: val } : el)))
    setCurrentText(prev => (prev ? { ...prev, [prop]: val } : prev))
  }

  // Download Meme (html2canvas)
  const handleDownloadMeme = async () => {
    if (!selectedTemplate) return alert('Please select a template first.')
    try {
      const canvas = await html2canvas(imgContainerRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      })
      const link = document.createElement('a')
      link.download = 'meme.jpg'
      link.href = canvas.toDataURL('image/jpeg', 0.9)
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
      alert('Failed to download meme.')
    }
  }

  // Submit Meme (Cloudinary backend)
  const handleCreateMeme = () => {
    if (!selectedTemplate) return alert('Choose a template first.')
    const memeData = { template: selectedTemplate, textElements }
    if (onMemeCreate) onMemeCreate(memeData)
  }

  if (loading) return <p style={{ color: 'white' }}>Loading Cloudinary templates...</p>

  return (
    <div style={{
      textAlign: 'center',
      marginBottom: '30px',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      color: 'white'
    }}>
      <h2>Create Your Meme</h2>

      {/* Template choice */}
      <div style={{ marginBottom: 12 }}>
        <h4>Choose a template</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {templates.map((t, i) => (
            <div key={t.id} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div
                onClick={() => handleTemplateSelect(t)}
                style={{
                  width: 120,
                  height: 80,
                  overflow: 'hidden',
                  borderRadius: 6,
                  border:
                    selectedTemplate?.id === t.id
                      ? '3px solid #4f46e5'
                      : '1px solid rgba(0,0,0,0.2)',
                }}
              >
                <img
                  src={t.image_url}
                  alt={t.description || `Template ${i + 1}`}
                  crossOrigin="anonymous"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
              <div style={{ fontSize: 12, marginTop: 6 }}>
                {t.description || `Template ${i + 1}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text Options */}
      {selectedTemplate && (
        <div style={{
          background: 'rgba(0,0,0,0.05)',
          padding: 16,
          borderRadius: 8,
          marginBottom: '20px'
        }}>
          <h4>Text Options</h4>

          {/* Style controls always enabled */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: 12
          }}>
            <label>
              Color:{' '}
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  const v = e.target.value
                  setTextColor(v)
                  if (currentText) updateStyle('color', v)
                }}
              />
            </label>

            <label>
              Size: {fontSize}px
              <input
                type="range"
                min="8"
                max="300"
                value={fontSize}
                onChange={(e) => {
                  const s = parseInt(e.target.value, 10)
                  setFontSize(s)
                  if (currentText) updateStyle('fontSize', s)
                }}
              />
            </label>

            <select
              value={fontFamily}
              onChange={(e) => {
                const v = e.target.value
                setFontFamily(v)
                if (currentText) updateStyle('fontFamily', v)
              }}
            >
              {fontOptions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            <button
              onClick={() => {
                const next = !isBold
                setIsBold(next)
                if (currentText) updateStyle('fontWeight', next ? 'bold' : 'normal')
              }}
              style={{
                background: isBold ? '#4f46e5' : '#f3f4f6',
                color: isBold ? 'white' : 'black',
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Bold
            </button>

            <button
              onClick={() => {
                const next = !isItalic
                setIsItalic(next)
                if (currentText) updateStyle('fontStyle', next ? 'italic' : 'normal')
              }}
              style={{
                background: isItalic ? '#4f46e5' : '#f3f4f6',
                color: isItalic ? 'white' : 'black',
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Italic
            </button>

            <button
              onClick={() => {
                const next = !isUnderline
                setIsUnderline(next)
                if (currentText) updateStyle('textDecoration', next ? 'underline' : 'none')
              }}
              style={{
                background: isUnderline ? '#4f46e5' : '#f3f4f6',
                color: isUnderline ? 'white' : 'black',
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Underline
            </button>

            <button
              onClick={() => {
                const next = !hasShadow
                setHasShadow(next)
                if (currentText) updateStyle('textShadow', next ? '2px 2px 4px rgba(0,0,0,0.6)' : '')
              }}
              style={{
                background: hasShadow ? '#4f46e5' : '#f3f4f6',
                color: hasShadow ? 'white' : 'black',
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Shadow
            </button>
          </div>

          {/* Text input */}
          <div style={{ marginBottom: 12 }}>
            <textarea
              ref={textInputRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Enter your text... (Shift+Enter = new line, Enter = Add/Update)"
              rows={3}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '6px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'none',
                height: '80px',
                maxHeight: '80px',
                overflow: 'auto',
              }}
            />
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => currentText ? updateText() : addText()}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {currentText ? 'Update Text' : 'Add Text'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {selectedTemplate && (
        <>
          <div ref={previewRef} style={{ marginTop: 20 }}>
            <h4>Preview</h4>
            <div
              ref={imgContainerRef}
              id="imgContainer"
              style={{
                position: 'relative',
                display: 'inline-block',
                padding: 8,
                background: '#fff',
                borderRadius: 8,
                minHeight: '400px',
                height: '400px',
                overflow: 'hidden',
                cursor: 'pointer',
                touchAction: 'none'
              }}
              onMouseDown={(e) => {
                // click on empty area or image => exit update mode
                if (e.target.id === 'imgContainer' || e.target.tagName === 'IMG') {
                  setCurrentText(null)
                  setTextInput('')
                }
              }}
              onTouchStart={(e) => {
                // tap on empty area or image => exit update mode
                const t = e.target
                if (t.id === 'imgContainer' || t.tagName === 'IMG') {
                  setCurrentText(null)
                  setTextInput('')
                }
              }}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={selectedTemplate.image_url}
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
                  ref={(node) => { if (node) textNodeRefs.current[el.id] = node }}
                  onContextMenu={(e) => handleContextMenu(e, el)}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, el)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleTouchStart(e, el)
                  }}
                  onDoubleClick={() => selectTextElement(el)}
                  style={{
                    position: 'absolute',
                    left: el.position.x,
                    top: el.position.y,
                    color: el.color,
                    fontSize: el.fontSize + 'px',
                    fontFamily: el.fontFamily,
                    fontWeight: el.fontWeight,
                    fontStyle: el.fontStyle,
                    textDecoration: el.textDecoration,
                    textShadow: el.textShadow,
                    cursor: isDragging && currentText?.id === el.id ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    whiteSpace: 'pre-wrap',
                    touchAction: 'none',
                    outline: currentText?.id === el.id ? '2px dashed rgba(79,70,229,0.8)' : 'none',
                    padding: currentText?.id === el.id ? 2 : 0,
                    borderRadius: 4
                  }}
                >
                  {el.text}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            marginTop: 40,
            display: 'flex',
            justifyContent: 'center',
            gap: 20,
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleDownloadMeme}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                minWidth: '140px'
              }}
            >
              Download Meme
            </button>
            <button
              onClick={handleCreateMeme}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                minWidth: '140px'
              }}
            >
              Submit Meme
            </button>
          </div>
        </>
      )}
    </div>
  )
}
