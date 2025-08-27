import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const PhotoEditor = ({ onMemeCreate }) => {
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
  const [textHistory, setTextHistory] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(24);
  const [isAddingText, setIsAddingText] = useState(false);
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const memeContainerRef = useRef(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTextElements([]);
    setTextHistory([]);
  };

  const handleCanvasClick = (e) => {
    if (!isAddingText || !selectedTemplate) return;

    const rect = memeContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentText.trim()) {
      addTextElement(x, y, currentText);
      setCurrentText('');
      setIsAddingText(false);
    }
  };

  const addTextElement = (x, y, text) => {
    setTextHistory(prev => [...prev, textElements]);
    
    const newTextElement = {
      id: Date.now(),
      x,
      y,
      text,
      color: textColor,
      fontSize
    };

    setTextElements(prev => [...prev, newTextElement]);
  };

  const handleTextMouseDown = (e, textElement) => {
    e.stopPropagation();
    const rect = memeContainerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - textElement.x;
    const offsetY = e.clientY - rect.top - textElement.y;
    
    setDraggingElement(textElement);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e) => {
    if (!draggingElement || !memeContainerRef.current) return;

    const rect = memeContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setTextElements(prev => 
      prev.map(element => 
        element.id === draggingElement.id 
          ? { ...element, x, y }
          : element
      )
    );
  };

  const handleMouseUp = () => {
    if (draggingElement) {
      setTextHistory(prev => [...prev, textElements]);
      setDraggingElement(null);
    }
  };

  const handleUndo = () => {
    if (textHistory.length > 0) {
      const previousState = textHistory[textHistory.length - 1];
      setTextElements(previousState);
      setTextHistory(prev => prev.slice(0, -1));
    }
  };

  const handleTextDoubleClick = (id) => {
    setTextHistory(prev => [...prev, textElements]);
    setTextElements(prev => prev.filter(text => text.id !== id));
  };

  const handleCreateMeme = () => {
    if (!selectedTemplate) {
      alert('Please select a template first!');
      return;
    }

    const memeData = {
      template: selectedTemplate,
      textElements,
      settings: { textColor, fontSize }
    };

    console.log('Meme created:', memeData);
    alert('Meme created successfully!');
    
    if (onMemeCreate) {
      onMemeCreate(memeData);
    }
  };

  const handleDownloadMeme = async () => {
    if (!selectedTemplate || textElements.length === 0) {
      alert('Please create a meme with text first!');
      return;
    }
  
    try {
      const canvas = await html2canvas(memeContainerRef.current, {
        backgroundColor: null,
        scale: 2, // Höhere Qualität
        logging: false
      });
  
      // Konvertiere Canvas zu JPG
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      
      // Erstelle Download-Link
      const link = document.createElement('a');
      link.href = imageData;
      link.download = 'meme.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading meme:', error);
      alert('Error downloading meme. Please try again.');
    }
  };

  const startAddingText = () => {
    if (!selectedTemplate) {
      alert('Please select a template first!');
      return;
    }
    setIsAddingText(true);
  };

  const cancelAddingText = () => {
    setIsAddingText(false);
    setCurrentText('');
  };

  return (
    <div className="photo-editor">
      <h3>Photo Editor</h3>
      
      {/* Template Selection */}
      <div className="templates-section">
        <h4>Choose a template:</h4>
        <div className="template-grid">
          {templateImages.map((template, index) => (
            <div 
              key={index} 
              className={`template-item ${selectedTemplate === template ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect(template)}
            >
              <img 
                src={template} 
                alt={`Template ${index + 1}`} 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150/333/fff?text=Template+' + (index + 1);
                }}
              />
              <span>Template {index + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Meme Preview with Text Placement */}
      {selectedTemplate && (
        <div className="meme-preview">
          <h4>Preview: {isAddingText && 'Click to place text'}</h4>
          <div 
            ref={memeContainerRef}
            className={`meme-container ${isAddingText ? 'adding-text' : ''} ${draggingElement ? 'dragging' : ''}`}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isAddingText ? 'crosshair' : draggingElement ? 'grabbing' : 'default' }}
          >
            <img src={selectedTemplate} alt="Selected template" />
            {textElements.map((textElement) => (
              <div
                key={textElement.id}
                className="meme-text"
                style={{
                  position: 'absolute',
                  left: `${textElement.x}px`,
                  top: `${textElement.y}px`,
                  color: textElement.color,
                  fontSize: `${textElement.fontSize}px`,
                  transform: 'translate(-50%, -50%)',
                  cursor: draggingElement?.id === textElement.id ? 'grabbing' : 'grab',
                  zIndex: draggingElement?.id === textElement.id ? 1000 : 1,
                  opacity: draggingElement?.id === textElement.id ? 0.9 : 1
                }}
                onMouseDown={(e) => handleTextMouseDown(e, textElement)}
                onDoubleClick={() => handleTextDoubleClick(textElement.id)}
              >
                {textElement.text}
              </div>
            ))}
          </div>
          <p className="drag-instruction">
            {textElements.length > 0 && "Drag to move | Double-click to delete"}
          </p>
        </div>
      )}

      {/* Text Input and Controls */}
      <div className="text-controls">
        <h2>Add Text</h2>
        
        {isAddingText ? (
          <div className="adding-text-mode">
            <div className="input-group">
              <label>Enter text:</label>
              <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Enter your text..."
                rows={3}
                autoFocus
              />
            </div>
            <div className="button-group">
              <button onClick={cancelAddingText}>Cancel</button>
              <span>Click on the image to place the text</span>
            </div>
          </div>
        ) : (
          <div className="normal-mode">
            <div className="input-group">
              <label>Text Color:</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Font Size: {fontSize}px</label>
              <input
                type="range"
                min="16"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
              />
            </div>

            <div className="button-group">
              <button onClick={startAddingText} className="add-text-btn">
                Add Text
              </button>
              
              <button 
                onClick={handleUndo} 
                disabled={textHistory.length === 0}
                className="undo-btn"
              >
                Undo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          onClick={handleCreateMeme} 
          disabled={!selectedTemplate}
          className="create-meme-btn"
        >
          Submit Meme
        </button>
        
        <button 
          onClick={handleDownloadMeme}
          disabled={!selectedTemplate || textElements.length === 0}
          className="download-meme-btn"
        >
          Download as JPG
        </button>
      </div>
    </div>
  );
};

export default PhotoEditor;