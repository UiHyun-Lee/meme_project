import React, { useState } from 'react'
import PhotoEditor from './PhotoEditor'

const SubmitMeme = () => {
  const [activeTab, setActiveTab] = useState('editor')
  const [recentUploads, setRecentUploads] = useState([])

  const handleMemeCreate = (memeData) => {
    console.log('Meme erfolgreich hochgeladen:', memeData)
    
    // Erfolgsmeldung mit mehr Details
    const successMessage = `
Meme erfolgreich hochgeladen!
      
ID: ${memeData.id}
Template: ${memeData.template}
Caption: ${memeData.caption}
Erstellt am: ${new Date(memeData.created_at).toLocaleString()}
    `.trim();
    
    alert(successMessage)
    
    // Zu den neuesten Uploads hinzufügen
    setRecentUploads(prev => [memeData, ...prev.slice(0, 4)]);
    
    // Optional: Editor zurücksetzen oder zu einer anderen Seite navigieren
    // window.location.href = '/memes'; // Umleitung zur Meme-Liste
  }

  return (
    <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
    }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '10px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Submit Your Meme
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '8px', opacity: 0.9 }}>
          Create a Meme. Challenge the Machines.
        </p>
        <p style={{ fontSize: '1.1rem', marginBottom: '8px', opacity: 0.9 }}>
          Use our photo editor to create your meme and join the competition!
        </p>
        <div className="submit-container">
          <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', textAlign: 'center'}}>
            This week's topic: <strong style={{ color: '#ffeb3b' }}>School</strong>
          </p>
        </div>
      </div>

      {/* Editor Section */}
      <div>
        <PhotoEditor onMemeCreate={handleMemeCreate} />
      </div>

      {/* Recent Uploads Section */}
      {recentUploads.length > 0 && (
        <div style={{ 
          marginTop: '40px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            textAlign: 'center',
            marginBottom: '20px',
            color: '#333',
            borderBottom: '2px solid #4f46e5',
            paddingBottom: '10px'
          }}>
            Recently Uploaded Memes
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {recentUploads.map((meme, index) => (
              <div key={meme.id || index} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center'
              }}>
                <img 
                  src={meme.image} 
                  alt={meme.caption}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}
                />
                <p style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {meme.caption}
                </p>
                <small style={{ color: '#999' }}>
                  {new Date(meme.created_at).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions Section */}
      <div style={{  
        textAlign: 'left',
        marginBottom: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
  <h4 style={{ color: '#1a1a1a', marginBottom: '15px' }}>How to create your meme:</h4>
  <ol style={{ 
    color: '#0d1b2a', 
    lineHeight: '1.8', 
    paddingLeft: '22px',
    fontSize: '1.05rem',
    fontWeight: 500
  }}>
    <li>Choose a template from the selection above</li>
    <li>Add text elements and customize their style</li>
    <li>Drag text elements to position them perfectly</li>
    <li>Double-click text to edit, right-click to delete</li>
    <li>Download your meme or submit it to the database</li>
  </ol>
  <p style={{ 
    color: '#ff8c00',  // kräftigeres, dunkles Blau
    fontWeight: 'bold',
    marginTop: '20px',
    fontStyle: 'italic',
    fontSize: '1.05rem',
    textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'
  }}>
    Your submitted memes will be visible to other users and can be rated in the competition!
  </p>
  </div>  
  {/* Footer */}
      <footer
        style={{
          marginTop: "40px",
          padding: "20px",
          textAlign: "center"
        }}
      >
        <button
          onClick={() => (window.location.href = '/impressum')}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            backgroundColor: "#ffd700",
            cursor: "pointer"
          }}
        >
          Impressum
        </button>
      </footer>  
  </div>
  )
}

export default SubmitMeme