import React, { useState } from 'react';

const Voting = () => {
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [voted, setVoted] = useState(false);

  const handleVote = (meme) => {
    setSelectedMeme(meme);
    console.log('Abgestimmt für:', meme);
    setVoted(true);

    setTimeout(() => {
      setSelectedMeme(null);
      setVoted(false);
    }, 2000);
  };

  const reportMeme = (memeId) => {
    console.log('Meme reported:', memeId);
    alert('Thanks for reporting it! We will investigate the meme.');
  };

  return (
    <div className="voting-container">
      <p className="topic-text">
        This week's topic: <strong>School</strong>
      </p>

      <div className="meme-comparison">

        {/* Meme A */}
        <div className={`meme-card ${selectedMeme === 'A' ? 'selected' : ''}`}>
          <div className="meme-image-container" onClick={() => handleVote('A')}>
            <img
              src="frontend/Meme/public/meme1.jpg"
              alt="Meme A"
              className="meme-image-natural"
            />

            <div className="vote-overlay">
              <span>VOTE FOR THIS MEME</span>
            </div>

            <button
              className="report-button-overlay"
              onClick={(e) => {
                e.stopPropagation();
                reportMeme('memeA');
              }}
            >
              🚫
            </button>
          </div>
        </div>

        <div className="vs-text">VS</div>

        {/* Meme B */}
        <div className={`meme-card ${selectedMeme === 'B' ? 'selected' : ''}`}>
          <div className="meme-image-container" onClick={() => handleVote('B')}>
            <img
              src="frontend/Meme/public/meme2.jpg"
              alt="Meme B"
              className="meme-image-natural"
            />

            <div className="vote-overlay">
              <span>VOTE FOR THIS MEME</span>
            </div>

            <button
              className="report-button-overlay"
              onClick={(e) => {
                e.stopPropagation();
                reportMeme('memeB');
              }}
            >
              🚫
            </button>
          </div>
        </div>

      </div>

      {voted && (
        <div className="vote-feedback">
          <p>Thank you for your vote! 🎉</p>
        </div>
      )}

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
  );
};

export default Voting;
