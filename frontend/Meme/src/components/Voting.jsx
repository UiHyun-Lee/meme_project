import React, { useState } from 'react'

const Voting = () => {
  const [selectedMeme, setSelectedMeme] = useState(null)
  const [voted, setVoted] = useState(false)

  const handleVote = (meme) => {
    setSelectedMeme(meme)
    // Direktes Absenden der Stimme
    console.log('Abgestimmt für:', meme)
    setVoted(true)
    
    // Nach 2 Sekunden zurücksetzen
    setTimeout(() => {
      setSelectedMeme(null)
      setVoted(false)
    }, 2000)
  }

  const reportMeme = (memeId) => {
    // Logik zum Melden eines Memes
    console.log('Meme reported:', memeId)
    alert('Thanks for reporting it! We will investigate the meme.')
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
      {/*<h2>Voting</h2>
      <p>Two memes enter. One meme leaves.</p>*/}
      <p className="topic-text">This week's topic: <strong>School</strong></p>
      
      <div className="meme-comparison">
        <div className={`meme-card ${selectedMeme === 'A' ? 'selected' : ''}`}>
          <div className="meme-image-container" onClick={() => handleVote('A')}>
            <img src="frontend/Meme/public/meme1.jpg" alt="Meme A" className="meme-image-natural"/>
            <div className="vote-overlay">
              <span>VOTE FOR THIS MEME</span>
            </div>
          </div>
          <button 
            className="report-button"
            onClick={() => reportMeme('memeA')}
          >
            🚫 Report
          </button>
        </div>
        
        <div className="vs-text">VS</div>
        
        <div className={`meme-card ${selectedMeme === 'B' ? 'selected' : ''}`}>
          <div className="meme-image-container" onClick={() => handleVote('B')}>
            <img src="frontend/Meme/public/meme2.jpg" alt="Meme B" className="meme-image-natural"/>
            <div className="vote-overlay">
              <span>VOTE FOR THIS MEME</span>
            </div>
          </div>
          <button 
            className="report-button"
            onClick={() => reportMeme('memeB')}
          >
            🚫 Report
          </button>
        </div>
      </div>

      {voted && (
        <div className="vote-feedback">
          <p>Thank you for your vote! 🎉</p>
        </div>
      )}
    </div>
  )
}

export default Voting