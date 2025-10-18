import React, { useState } from 'react'
import PhotoEditor from './PhotoEditor'

const SubmitMeme = () => {
  const [activeTab, setActiveTab] = useState('editor') // Nur noch Editor

  const handleMemeCreate = (memeData) => {
    console.log('Meme erstellt:', memeData)
    // Hier könnten Sie das generierte Meme speichern oder weiterverarbeiten
    alert('Meme erfolgreich erstellt und würde jetzt hochgeladen werden!')
  }

  return (
    <div className="submit-container">
      <h2>Submit Your Meme</h2>
      <p>Create a Meme. Challenge the Machines.</p>
      <p>Use our photo editor to create your meme.</p>
      <p>This week's topic: <strong>School</strong></p>

      {/* Tab Navigation entfernt - nur noch Editor */}
      <PhotoEditor onMemeCreate={handleMemeCreate} />
    </div>
  )
}

export default SubmitMeme
/*import React, { useState } from 'react'

const SubmitMeme = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [fileName, setFileName] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
    }
  }

  const handleGenerateMeme = () => {
    // Hier würde die Logik zur Generierung eines AI-Memes implementiert werden
    if (aiPrompt.trim() === '') {
      alert('Bitte geben Sie einen Prompt ein')
      return
    }
    
    console.log('Generiere Meme mit Prompt:', aiPrompt)
    alert(`Meme wird generiert mit: "${aiPrompt}"`)
  }

  const handleUpload = () => {
    // Hier würde die Upload-Logik implementiert werden
    if (selectedFile) {
      console.log('Datei hochladen:', selectedFile.name)
      alert(`Datei "${selectedFile.name}" wird hochgeladen`)
    } else {
      alert('Bitte wählen Sie eine Datei aus')
    }
  }

  return (
    <div className="submit-container">
      <h2>Submit Your Meme</h2>
      <p>Create a Meme. Challenge the Machines.</p>
      <p>Upload your own or prompt the AI to make one for you.</p>
      <p>This week's topic: <strong>School</strong></p>

      <div className="upload-section">
        <h3>Upload</h3>
        <div className="upload-area">
          <p>Photo-editor / drag&drop / filepicker</p>
          <input 
            type="file" 
            id="file-upload"
            onChange={handleFileChange} 
            accept="image/*" 
          />
          <label htmlFor="file-upload" className="file-label">
            Datei auswählen
          </label>
          {fileName && <p>Ausgewählte Datei: {fileName}</p>}
        </div>
        <button onClick={handleUpload}>Upload</button>
      </div>

      <div className="generate-section">
        <h3>Generate</h3>
        <p>LLM generation</p>
        <textarea 
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Beschreiben Sie Ihr Meme für die KI..."
          rows={4}
          style={{width: '100%', margin: '10px 0', padding: '10px', 
                  backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', 
                  border: '1px solid #444', borderRadius: '4px'}}
        />
        <button onClick={handleGenerateMeme}>Generate</button>
      </div>
    </div>
  )
}

export default SubmitMeme*/