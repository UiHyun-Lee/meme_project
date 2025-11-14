import React, { useState, useEffect } from 'react';

const CookieBanner = ({ onAccept, onReject }) => {
  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>
          We use cookies to enable essential site functionality, provide secure Google
          login for uploading memes, and analyze usage to improve our platform.
          For details, please see the
          <a 
            href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp"
            target="_blank"
            rel="noopener noreferrer"
          > Privacy Policy</a>.
        </p>

        <div className="cookie-buttons">
          <button onClick={onAccept} className="cookie-accept">Accept all</button>
          <button onClick={onReject} className="cookie-reject">Only necessary</button>
        </div>
      </div>
    </div>
  );
};

const Voting = () => {
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [voted, setVoted] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(null);

  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent");
    if (storedConsent) setCookieConsent(storedConsent);
  }, []);

  const handleVote = (meme) => {
    setSelectedMeme(meme);
    console.log('Voted for:', meme);
    setVoted(true);

    setTimeout(() => {
      setSelectedMeme(null);
      setVoted(false);
    }, 2000);
  };

  const handleAcceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setCookieConsent("accepted");
  };

  const handleRejectCookies = () => 
  {
    localStorage.setItem("cookieConsent", "rejected");
    setCookieConsent("rejected");
  };

  const reportMeme = (memeId) => {
    console.log('Meme reported:', memeId);
    alert('Thanks for reporting it! We will investigate the meme.');
  };

  return (
    <>
      <div className="voting-container">

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
                <span>VOTE FOR THIS MEME?</span>
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

          <div className="vs-text" style={{ marginTop: '-40px' }}>VS</div>

          {/* Meme B */}
          <div className={`meme-card ${selectedMeme === 'B' ? 'selected' : ''}`} style={{ marginTop: '-40px' }}>
            <div className="meme-image-container" onClick={() => handleVote('B')}>
              <img
                src="frontend/Meme/public/meme2.jpg"
                alt="Meme B"
                className="meme-image-natural"
              />

              <div className="vote-overlay">
                <span>VOTE FOR THIS MEME?</span>
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

        <p className="topic-text">
          This week's topic: <strong>School</strong>
        </p>

      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-links">
          <a
            href="https://www.tu-darmstadt.de/impressum/index.de.jsp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Impressum
          </a>
          <span className="footer-separator">|</span>
          <a
            href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </div>
      </footer>

      {/* Cookie Banner (only if no consent yet) */}
      {!cookieConsent && (
        <CookieBanner 
          onAccept={handleAcceptCookies} 
          onReject={handleRejectCookies} 
        />
      )}

    </>
  );
};

export default Voting;
