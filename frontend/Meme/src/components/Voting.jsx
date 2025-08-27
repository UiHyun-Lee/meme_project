import React, { useState } from 'react'

const Voting = () => {
  const [selectedOptions, setSelectedOptions] = useState({
    funnier: '',
    shareable: '',
    relatable: ''
  })

  const handleVote = (type, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const handleSubmitVote = () => {
    // Hier würde die Logik zum Absenden der Stimme implementiert werden
    console.log('Abgestimmt:', selectedOptions)
    alert('Danke für deine Stimme!')
    
    // Zurücksetzen der Auswahl
    setSelectedOptions({
      funnier: '',
      shareable: '',
      relatable: ''
    })
  }

  return (
    <div className="voting-container">
      <h2>Voting</h2>
      <p>Two memes enter. One meme leaves.</p>
      <p className="mb-2">This week's topic: <strong>School</strong></p>
      
      <div className="meme-comparison">
        <div className="meme-card">
          <h3>MEME A</h3>
          <img src="frontend\Meme\public\meme1.jpg" alt="Meme A" className="meme-image"/>
        </div>
        
        <div className="meme-card">
          <h3>MEME B</h3>
          <img src="frontend\Meme\public\meme2.jpg" alt="Meme B" className="meme-image"/>
        </div>
      </div>

      <div className="voting-options">
        <h3>WHICH MEME IS FUNNIER?</h3>
        <div className="voting-buttons">
          <button 
            className={selectedOptions.funnier === 'A' ? 'selected' : ''}
            onClick={() => handleVote('funnier', 'A')}
          >
            A
          </button>
          <button 
            className={selectedOptions.funnier === 'B' ? 'selected' : ''}
            onClick={() => handleVote('funnier', 'B')}
          >
            B
          </button>
        </div>

        <h3>WHICH MEME IS MORE SHAREABLE?</h3>
        <div className="voting-buttons">
          <button 
            className={selectedOptions.shareable === 'A' ? 'selected' : ''}
            onClick={() => handleVote('shareable', 'A')}
          >
            A
          </button>
          <button 
            className={selectedOptions.shareable === 'B' ? 'selected' : ''}
            onClick={() => handleVote('shareable', 'B')}
          >
            B
          </button>
        </div>

        <h3>WHICH MEME IS MORE RELATABLE?</h3>
        <div className="voting-buttons">
          <button 
            className={selectedOptions.relatable === 'A' ? 'selected' : ''}
            onClick={() => handleVote('relatable', 'A')}
          >
            A
          </button>
          <button 
            className={selectedOptions.relatable === 'B' ? 'selected' : ''}
            onClick={() => handleVote('relatable', 'B')}
          >
            B
          </button>
        </div>
      </div>

      <button 
        onClick={handleSubmitVote}
        disabled={!selectedOptions.funnier || !selectedOptions.shareable || !selectedOptions.relatable}
        style={{marginTop: '20px', padding: '15px 30px', fontSize: '1.2rem'}}
      >
        Submit Vote
      </button>
    </div>
  )
}

export default Voting