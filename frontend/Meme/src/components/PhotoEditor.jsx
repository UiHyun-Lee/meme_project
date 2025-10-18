import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

export default function PhotoEditor({ onMemeCreate }) {
  const templateImages = [
    'frontend/Meme/public/templates/template1.jpg',
    'frontend/Meme/public/templates/template2.jpg',
    'frontend/Meme/public/templates/template3.jpg',
    'frontend/Meme/public/templates/template4.jpg',
    'frontend/Meme/public/templates/template5.jpg',
    'frontend/Meme/public/templates/template6.jpg',
    'frontend/Meme/public/templates/template7.jpg',
    'frontend/Meme/public/templates/template8.jpg',
    'frontend/Meme/public/templates/template9.jpg',
    'frontend/Meme/public/templates/template10.jpg'
  ];

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

  const imgContainerRef = useRef(null);
  const previewRef = useRef(null);
  const textInputRef = useRef(null);

  const fontOptions = [
    'Arial','Impact','Verdana','Times New Roman','Georgia','Helvetica','Courier New','Comic Sans MS'
  ];

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

  // Korrigierte Drag & Drop Funktion
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !currentText) return;

      const container = imgContainerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;

      // Update position in state
      setTextElements(prev => 
        prev.map(el => 
          el.id === currentText.id 
            ? { ...el, position: { x, y } } 
            : el
        )
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, currentText]);

  const handleTextMouseDown = (e, el) => {
    e.preventDefault();
    setCurrentText(el);
    setIsDragging(true);
  };

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

  const updateCurrentTextStyle = (property, value) => {
    if (!currentText) return;
    setTextElements(prev => prev.map(el => el.id === currentText.id ? { ...el, [property]: value } : el));
    setCurrentText(prev => prev ? { ...prev, [property]: value } : prev);
  };

  const handleDownloadMeme = async () => {
    if (!selectedTemplate) return alert('Bitte Vorlage auswählen.');
    if (!imgContainerRef.current) return;

    try {
      // Temporär alle Text-Elemente ohne Border und Hintergrund für den Download
      const textElements = imgContainerRef.current.querySelectorAll('.meme-text');
      const originalStyles = [];
      
      textElements.forEach((el, index) => {
        originalStyles[index] = {
          border: el.style.border,
          backgroundColor: el.style.backgroundColor
        };
        el.style.border = 'none';
        el.style.backgroundColor = 'transparent';
      });

      const canvas = await html2canvas(imgContainerRef.current, { 
        backgroundColor: null, 
        scale: 2, 
        useCORS: true,
        allowTaint: true
      });

      // Original-Stile wiederherstellen
      textElements.forEach((el, index) => {
        el.style.border = originalStyles[index].border;
        el.style.backgroundColor = originalStyles[index].backgroundColor;
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

  const handleCreateMeme = () => {
    if (!selectedTemplate) return alert('Bitte Vorlage auswählen.');
    const memeData = { template: selectedTemplate, textElements };
    if (onMemeCreate) onMemeCreate(memeData);
    alert('Meme erstellt und gespeichert!');
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
    <div className="photo-editor" style={{ padding: 12 }}>
      <h2>Create Your Meme</h2>

      {/* Template Auswahl */}
      <div style={{ marginBottom: 12 }}>
        <h4>Choose a template</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {templateImages.map((t, i) => (
            <div key={t} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div
                onClick={() => handleTemplateSelect(t)}
                style={{
                  width: 120,
                  height: 80,
                  overflow: 'hidden',
                  borderRadius: 6,
                  border: selectedTemplate === t ? '3px solid #4f46e5' : '1px solid rgba(0,0,0,0.2)'
                }}
              >
                <img
                  src={t}
                  alt={`Template ${i+1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => (e.target.src = `https://via.placeholder.com/300x200?text=Template+${i+1}`)}
                />
              </div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Template {i + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview & Controls nebeneinander */}
      {selectedTemplate && (
        <div ref={previewRef} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginTop: 20 }}>
          {/* Preview Container mit ursprünglicher Breite und Zentrierung */}
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
                src={selectedTemplate}
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
                    minWidth: '20px',
                    minHeight: '20px',
                    zIndex: 1000
                  }}
                >
                  {el.text}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: 8 }}>
              Drag to move • Click to select • Double-click to edit • Right-click to delete
            </p>
          </div>

          {/* Controls rechts daneben mit fester Höhe */}
          <div style={{ 
            flex: '1 1 300px', 
            background: 'rgba(0,0,0,0.05)', 
            padding: 16, 
            borderRadius: 8,
            minHeight: '400px',
            height: '400px',
            display: 'flex',
            flexDirection: 'column'
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
                  padding: '6px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button 
                  onClick={handleButtonClick}
                  disabled={!selectedTemplate}
                  style={{ 
                    width: '100%', 
                    padding: '6px 8px',
                    fontSize: '12px'
                  }}
                >
                  {currentText ? 'Update Text' : 'Add Text'}
                </button>
              </div>
            </div>

            {/* Style Controls */}
            <div style={{ marginBottom: 10 }}>
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

            <div style={{ marginBottom: 10 }}>
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

            <div style={{ marginBottom: 10 }}>
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
                  Shadow
                </button>
              </div>
            </div>
          </div>
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
          gap: '20px'
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
              cursor: 'pointer'
            }}
          >
            Download Meme
          </button>
          <button 
            onClick={handleCreateMeme} 
            disabled={!selectedTemplate}
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
  );
}