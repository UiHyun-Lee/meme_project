import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

export default function PhotoEditor({ onMemeCreate }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [textElements, setTextElements] = useState([]);
  const [currentText, setCurrentText] = useState(null);
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [hasShadow, setHasShadow] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const imgContainerRef = useRef(null);
  const previewRef = useRef(null);
  const textInputRef = useRef(null);

  // Double tap detection
  const [lastTap, setLastTap] = useState(0);
  const [tapTimeout, setTapTimeout] = useState(null);

  const fontOptions = [
    'Arial', 'Impact', 'Verdana', 'Times New Roman', 'Georgia', 
    'Helvetica', 'Courier New', 'Comic Sans MS'
  ];

  // Templates vom Backend laden
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates/');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        } else {
          console.error('Fehler beim Laden der Templates');
          // Fallback auf lokale Templates
          setTemplates(generateFallbackTemplates());
        }
      } catch (error) {
        console.error('Fehler beim Laden der Templates:', error);
        // Fallback auf lokale Templates
        setTemplates(generateFallbackTemplates());
      }
    };
    
    fetchTemplates();
  }, []);

  // Fallback Templates falls Backend nicht verfügbar
  const generateFallbackTemplates = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      image: `frontend/Meme/public/templates/template${i + 1}.jpg`,
      description: `Template ${i + 1}`,
      category: { name: 'General' }
    }));
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTextElements([]);
    setCurrentText(null);
    setTextInput('');

    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const addText = () => {
    if (!selectedTemplate) {
      alert('Bitte wähle zuerst eine Vorlage aus.');
      return;
    }

    const textToAdd = textInput.trim() || 'Drag me';
    
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
    };

    setTextElements(prev => [...prev, newTextElement]);
    setCurrentText(newTextElement);
    setTextInput('');
    
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  };

  const updateText = () => {
    if (!currentText || !textInput.trim()) return;
    
    setTextElements(prev => 
      prev.map(el => 
        el.id === currentText.id 
          ? { ...el, text: textInput.trim() } 
          : el
      )
    );
    setTextInput('');
    setCurrentText(null);
  };

  const handleTextDoubleClick = (el) => {
    setTextInput(el.text);
    setCurrentText(el);
    
    setTimeout(() => {
      textInputRef.current?.focus();
      textInputRef.current?.select();
    }, 100);
  };

  // Double tap handler for mobile
  const handleTextDoubleTap = (el) => {
    if (window.confirm('Text löschen?')) {
      setTextElements(prev => prev.filter(x => x.id !== el.id));
      if (currentText?.id === el.id) {
        setCurrentText(null);
        setTextInput('');
      }
    }
  };

  // Unified tap handler for mobile
  const handleTextTap = (el) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapTimeout) {
      clearTimeout(tapTimeout);
      setTapTimeout(null);
    }
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected - delete text
      handleTextDoubleTap(el);
    } else {
      // Single tap - select text
      setLastTap(currentTime);
      setTapTimeout(setTimeout(() => {
        // Single tap action (select text)
        setCurrentText(el);
        setTextColor(el.color);
        setFontSize(el.fontSize);
        setFontFamily(el.fontFamily);
        setIsBold(el.fontWeight === 'bold');
        setIsItalic(el.fontStyle === 'italic');
        setIsUnderline(el.textDecoration === 'underline');
        setHasShadow(!!el.textShadow);
        setTapTimeout(null);
      }, 300));
    }
  };

  // Unified drag function for both mouse and touch
  const updateTextPosition = (clientX, clientY) => {
    if (!isDragging || !currentText) return;

    const container = imgContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const x = clientX - containerRect.left;
    const y = clientY - containerRect.top;

    // Boundary checks to keep text within container
    const boundedX = Math.max(10, Math.min(x, containerRect.width - 10));
    const boundedY = Math.max(10, Math.min(y, containerRect.height - 10));

    // Update position in state
    setTextElements(prev => 
      prev.map(el => 
        el.id === currentText.id 
          ? { ...el, position: { x: boundedX, y: boundedY } } 
          : el
      )
    );
  };

  // Mouse event handlers
  const handleTextMouseDown = (e, el) => {
    e.preventDefault();
    setCurrentText(el);
    setIsDragging(true);
  };

  // Touch event handlers for mobile
  const handleTextTouchStart = (e, el) => {
    e.preventDefault();
    setCurrentText(el);
    setIsDragging(true);
    
    // Update position immediately on touch start
    const touch = e.touches[0];
    updateTextPosition(touch.clientX, touch.clientY);
  };

  const handleTextTouchMove = (e) => {
    if (!isDragging || !currentText) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    updateTextPosition(touch.clientX, touch.clientY);
  };

  const handleTextTouchEnd = () => {
    setIsDragging(false);
  };

  // Global event handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      updateTextPosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      if (!isDragging || !currentText) return;
      e.preventDefault();
      const touch = e.touches[0];
      updateTextPosition(touch.clientX, touch.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      // Add both mouse and touch events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, currentText]);

  const handleTextContextMenu = (e, el) => {
    e.preventDefault();
    if (window.confirm('Text löschen?')) {
      setTextElements(prev => prev.filter(x => x.id !== el.id));
      if (currentText?.id === el.id) {
        setCurrentText(null);
        setTextInput('');
      }
    }
  };

  const handleTextClick = (el) => {
    setCurrentText(el);
    setTextColor(el.color);
    setFontSize(el.fontSize);
    setFontFamily(el.fontFamily);
    setIsBold(el.fontWeight === 'bold');
    setIsItalic(el.fontStyle === 'italic');
    setIsUnderline(el.textDecoration === 'underline');
    setHasShadow(!!el.textShadow);
  };

  const handleImageClick = (e) => {
    // Nur deselecten wenn auf das Bild selbst geklickt wird, nicht auf Text
    if (e.target === imgContainerRef.current || e.target.tagName === 'IMG') {
      setCurrentText(null);
      setTextInput('');
    }
  };

  const handleImageTouchStart = (e) => {
    // Deselect text when touching the image background
    if (e.target === imgContainerRef.current || e.target.tagName === 'IMG') {
      setCurrentText(null);
      setTextInput('');
    }
  };

  const updateCurrentTextStyle = (property, value) => {
    if (!currentText) return;
    setTextElements(prev => prev.map(el => el.id === currentText.id ? { ...el, [property]: value } : el));
    setCurrentText(prev => prev ? { ...prev, [property]: value } : prev);
  };

  const handleDownloadMeme = async () => {
    if (!selectedTemplate) return alert('Bitte Vorlage auswählen.');
    if (!imgContainerRef.current) return;

    try {
      const canvas = await html2canvas(imgContainerRef.current, { 
        backgroundColor: null, 
        scale: 2, 
        useCORS: true,
        allowTaint: true
      });

      const data = canvas.toDataURL('image/jpeg', 0.9);
      const a = document.createElement('a');
      a.href = data;
      a.download = 'meme.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Fehler beim Erstellen des Bildes');
    }
  };

  const handleCreateMeme = async () => {
    if (!selectedTemplate) {
      alert('Bitte Vorlage auswählen.');
      return;
    }

    setIsUploading(true);

    try {
      // Meme als Bild generieren - KEINE Style-Anpassungen mehr nötig dank CSS-Klasse
      const canvas = await html2canvas(imgContainerRef.current, { 
        backgroundColor: null, 
        scale: 2, 
        useCORS: true,
        allowTaint: true
      });

      // Canvas zu Base64 konvertieren
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      
      // Caption aus Text-Elementen erstellen
      const textElements = imgContainerRef.current.querySelectorAll('.meme-text');
      const caption = textElements.length > 0 
        ? Array.from(textElements).map(el => el.textContent).join(' | ')
        : 'Custom Meme';
      
      // Meme-Daten für Upload vorbereiten
      const memeData = {
        template_id: selectedTemplate.id,
        image: imageData,
        caption: caption,
        created_by: "human",
        topic: "School"
      };

      console.log('Sende Meme an Backend...', {
        template_id: selectedTemplate.id,
        caption: caption,
        image_length: imageData.length
      });

      // Meme an Backend senden
      const response = await fetch('/api/upload_meme/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memeData)
      });

      if (response.ok) {
        const savedMeme = await response.json();
        console.log('Meme erfolgreich hochgeladen:', savedMeme);
        
        // Callback aufrufen
        if (onMemeCreate) {
          onMemeCreate(savedMeme);
        }
        
        alert('Meme erfolgreich erstellt und hochgeladen!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload fehlgeschlagen mit Status: ${response.status}`);
      }

    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
      alert(`Fehler beim Hochladen: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (currentText) {
        updateText();
      } else {
        addText();
      }
    }
  };

  const handleButtonClick = () => {
    if (currentText) {
      updateText();
    } else {
      addText();
    }
  };

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

      {/* Template Auswahl */}
      <div style={{ marginBottom: 12 }}>
        <h4>Choose a template</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {templates.map((template) => (
            <div key={template.id} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div
                onClick={() => handleTemplateSelect(template)}
                style={{
                  width: 120,
                  height: 80,
                  overflow: 'hidden',
                  borderRadius: 6,
                  border: selectedTemplate?.id === template.id ? '3px solid #4f46e5' : '1px solid rgba(0,0,0,0.2)'
                }}
              >
                <img
                  src={template.image}
                  alt={template.description}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => (e.target.src = `https://via.placeholder.com/300x200?text=Template+${template.id}`)}
                />
              </div>
              <div style={{ fontSize: 12, marginTop: 6 }}>{template.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Section */}
      {selectedTemplate && (
        <div style={{ 
          background: 'rgba(0,0,0,0.05)', 
          padding: 16, 
          borderRadius: 8,
          marginBottom: '20px'
        }}>
          <h4>Text Options</h4>
          
          {/* Text Input - Button wechselt zwischen Add Text und Update Text */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: '14px' }}>
              Text:
            </label>
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your text..."
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '6px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', justifyContent: 'center' }}>
              <button 
                onClick={handleButtonClick}
                disabled={!selectedTemplate}
                style={{ 
                  padding: '6px 12px',
                  fontSize: '12px'
                }}
              >
                {currentText ? 'Update Text' : 'Add Text'}
              </button>
            </div>
          </div>

          {/* Style Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: '14px' }}>
                Text Color:
              </label>
              <input 
                type="color" 
                value={textColor} 
                onChange={(e) => { 
                  setTextColor(e.target.value); 
                  updateCurrentTextStyle('color', e.target.value); 
                }} 
                disabled={!currentText}
                style={{ width: '100%', height: '35px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: '14px' }}>
                Font Size: {fontSize}px
              </label>
              <input 
                type="range" 
                value={fontSize} 
                min={8} 
                max={300} 
                onChange={(e) => { 
                  const s = parseInt(e.target.value, 10); 
                  setFontSize(s); 
                  updateCurrentTextStyle('fontSize', s); 
                }} 
                disabled={!currentText}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: '14px' }}>
                Font Family:
              </label>
              <select 
                value={fontFamily} 
                onChange={(e) => { 
                  setFontFamily(e.target.value); 
                  updateCurrentTextStyle('fontFamily', e.target.value); 
                }} 
                disabled={!currentText}
                style={{ width: '100%', padding: '6px', fontSize: '14px' }}
              >
                {fontOptions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12, marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: '14px' }}>
              Text Effects:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '6px', maxWidth: '400px', margin: '0 auto' }}>
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
                  borderRadius: '4px'
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
                  borderRadius: '4px'
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
                  borderRadius: '4px'
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
                  borderRadius: '4px'
                }}
              >
                Outline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section - Now below the controls */}
      {selectedTemplate && (
        <div ref={previewRef} style={{ marginTop: 20 }}>
          <h4>Preview</h4>
          <div
            ref={imgContainerRef}
            id="imgContainer"
            onClick={handleImageClick}
            onTouchStart={handleImageTouchStart}
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
              touchAction: 'none' // Important for touch scrolling prevention
            }}
          >
            <img
              src={selectedTemplate.image}
              alt="Selected"
              style={{ 
                display: 'block', 
                maxWidth: '100%', 
                maxHeight: '100%', 
                height: '100%',
                width: 'auto',
                objectFit: 'contain',
                borderRadius: 6 
              }}
            />

            {textElements.map(el => (
              <div
                key={el.id}
                data-id={el.id}
                className={`meme-text ${currentText?.id === el.id ? 'editing' : ''}`}
                onContextMenu={(e) => handleTextContextMenu(e, el)}
                onClick={() => handleTextClick(el)}
                onDoubleClick={() => handleTextDoubleClick(el)}
                onMouseDown={(e) => handleTextMouseDown(e, el)}
                onTouchStart={(e) => handleTextTouchStart(e, el)}
                onTouchMove={handleTextTouchMove}
                onTouchEnd={handleTextTouchEnd}
                onTouchStartCapture={(e) => {
                  // Use touch start for double tap detection
                  e.preventDefault();
                  handleTextTap(el);
                }}
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
                  // Border und Background werden jetzt über CSS-Klasse gesteuert
                  minWidth: '20px',
                  minHeight: '20px',
                  zIndex: 1000,
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  touchAction: 'none'
                }}
              >
                {el.text}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.9em', color: '#FFF', marginTop: 8 }}>
            {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
              ? 'Touch & drag to move • Tap to select • Double-tap to delete'
              : 'Drag to move • Click to select • Double-click to edit • Right-click to delete'
            }
          </p>
        </div>
      )}

      {/* Download und Submit Buttons mit unterschiedlichen Farben */}
      {selectedTemplate && (
        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          textAlign: 'center', 
          borderTop: '2px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={handleDownloadMeme} 
            disabled={!selectedTemplate || textElements.length === 0}
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
            disabled={!selectedTemplate || isUploading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: isUploading ? '#6b7280' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              minWidth: '140px'
            }}
          >
            {isUploading ? 'Uploading...' : 'Submit Meme'}
          </button>
        </div>
      )}
    </div>
  );
}