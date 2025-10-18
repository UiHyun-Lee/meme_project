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
    console.log('Meme gemeldet:', memeId)
    alert('Danke für deine Meldung! Wir werden das Meme überprüfen.')
  }

  return (
    <div className="voting-container">
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
            🚫 Melden
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
            🚫 Melden
          </button>
        </div>
      </div>

      {voted && (
        <div className="vote-feedback">
          <p>Danke für deine Stimme! 🎉</p>
        </div>
      )}
    </div>
  )
}

export default Voting