import React, { useEffect, useState } from 'react'
import { getRandomMemes, voteMeme, getCurrentTopic  } from '../api'
import CookieBanner from "./CookieBanner";

const Voting = () => {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)   //  mobile slider
  const [cookieConsent, setCookieConsent] = useState(
    localStorage.getItem("cookieConsent")
  );
  const [currentTopic, setCurrentTopic] = useState(null)

  const handleAcceptCookies = () => {
    localStorage.setItem("cookieConsent", "all");
    setCookieConsent("all");
  };

  const handleRejectCookies = () => {
    localStorage.setItem("cookieConsent", "necessary");
    setCookieConsent("necessary");
  };

  const fetchCurrentTopic = async () => {
  try {
    const res = await getCurrentTopic()
    if (res.data && res.data.name) {
      setCurrentTopic(res.data)
    } else {
      setCurrentTopic(null)
    }
  } catch (err) {
    console.error("CURRENT TOPIC ERROR:", err.response?.data || err.message)
    setCurrentTopic(null)
  }
}

  useEffect(() => {
      fetchCurrentTopic()
    fetchMemes()
  }, [])

  const fetchMemes = async () => {
    try {
      setLoading(true)
      const res = await getRandomMemes()
      let memesData = res.data

      //  AI/Human randomly
      if (memesData.length === 2) {
        const [m1, m2] = memesData
        if (m1.created_by !== m2.created_by && Math.random() < 0.5) {
          memesData = [m2, m1]
        }
      }

      setMemes(memesData)
      setActiveIndex(0)
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message)
      setMessage("Not enough Memes now! 😢")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (memeId) => {
    try {
      await voteMeme(memeId)
      setMessage("Thanks! Your vote was counted.")
    } catch (err) {
      console.error("Vote error:", err)
      setMessage("Vote failed 😢")
    } finally {
      setTimeout(() => {
        setMessage('')
        fetchMemes()
      }, 800)
    }
  }

  const reportMeme = (memeId) => {
    alert("Thanks for reporting! We will check it.")
  }

  if (loading) return <p>Loading memes...</p>
  if (memes.length < 2) return <p>{message || "Not enough Memes now! 😢"}</p>

  const lastIndex = memes.length - 1

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "white",
        paddingBottom: "60px",
        overflowX: "hidden",
        textAlign: "center",
      }}
    >
      {/* TOPIC */}
<p className="topic-text">
  This week's topic:{" "}
  <span style={{ color: "#fff176" }}>
    {currentTopic?.name || "No active topic"}
  </span>
</p>

      {/* ⭐ DESKTOP VERSION — ORIGINAL 2 memes side-by-side */}
      <div className="desktop-meme-comparison meme-comparison">
        {memes.slice(0, 2).map((meme, index) => (
          <React.Fragment key={meme.id}>
            <div className="meme-card" onClick={() => handleVote(meme.id)}>
              <img
                src={meme.image_url}
                alt={"Meme " + index}
                style={{ maxWidth: 350, borderRadius: 12 }}
              />
              <button
                className="report-button"
                onClick={(e) => {
                  e.stopPropagation()
                  reportMeme(meme.id)
                }}
              >
                🚫 Melden
              </button>
            </div>

            {index === 0 && <div className="vs-text">VS</div>}
          </React.Fragment>
        ))}
      </div>

      {/* ⭐ MOBILE VERSION — SLIDER (from your test code) */}
      <div className="mobile-meme-slider">
        {/* LEFT ARROW */}
        <button
          className="slider-arrow slider-arrow-left"
          onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
          style={{
            opacity: activeIndex === 0 ? 0 : 1,
            visibility: activeIndex === 0 ? "hidden" : "visible",
          }}
        >
          ‹
        </button>

        <div className="slider-viewport">
          <div className="slider-track" style={{
                        width: `${memes.length * 50}%`,
                        transform: `translateX(-${activeIndex * 80}%)`
                  }}>
  {memes.map((meme, index) => {
    return (
      <React.Fragment key={meme.id}>
        <div
          className="meme-card slider-card"
          onClick={() => handleVote(meme.id)}
        >
          <img src={meme.image_url} className="slider-image" />

          <button
            className="report-button"
            onClick={(e) => {
              e.stopPropagation();
              reportMeme(meme.id);
            }}
          >
            🚫 Melden
          </button>
        </div>

        {index === 0 && <div className="vs-text">VS</div>}
      </React.Fragment>
    )
  })}
</div>
        </div>

        {/* RIGHT ARROW */}
        <button
          className="slider-arrow slider-arrow-right"
          onClick={() => setActiveIndex(prev => Math.min(lastIndex, prev + 1))}
          style={{
            opacity: activeIndex === lastIndex ? 0 : 1,
            visibility: activeIndex === lastIndex ? "hidden" : "visible",
          }}
        >
          ›
        </button>
      </div>

      {/* FEEDBACK */}
      {message && (
        <div className="vote-feedback" style={{ marginTop: 16 }}>
          {message}
        </div>
      )}

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-links">
          <a href="https://www.tu-darmstadt.de/impressum/index.de.jsp" target="_blank">Impressum</a>
          <span className="footer-separator">|</span>
          <a href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp" target="_blank">
            Privacy
          </a>
        </div>
      </footer>

      {/* COOKIE BANNER */}
      {!cookieConsent && (
        <CookieBanner
          onAccept={handleAcceptCookies}
          onReject={handleRejectCookies}
        />
      )}
    </div>
  )
}

export default Voting
