// import React, { useEffect, useState } from 'react'
// import { getRandomMemes, voteMeme, getCurrentTopic  } from '../api'
// import CookieBanner from "./CookieBanner";
//
// const Voting = () => {
//   const [memes, setMemes] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [message, setMessage] = useState('')
//   const [activeIndex, setActiveIndex] = useState(0)   //  mobile slider
//   const [cookieConsent, setCookieConsent] = useState(
//     localStorage.getItem("cookieConsent")
//   );
//   const [currentTopic, setCurrentTopic] = useState(null)
//
//   // Debug log
//   useEffect(() => {
//     console.log("MEMES FROM API:", memes)
//   }, [memes])
//
//   const handleAcceptCookies = () => {
//     localStorage.setItem("cookieConsent", "all");
//     setCookieConsent("all");
//   };
//
//   const handleRejectCookies = () => {
//     localStorage.setItem("cookieConsent", "necessary");
//     setCookieConsent("necessary");
//   };
//
//   const fetchCurrentTopic = async () => {
//   try {
//     const res = await getCurrentTopic()
//     if (res.data && res.data.name) {
//       setCurrentTopic(res.data)
//     } else {
//       setCurrentTopic(null)
//     }
//   } catch (err) {
//     console.error("CURRENT TOPIC ERROR:", err.response?.data || err.message)
//     setCurrentTopic(null)
//   }
// }
//
//   useEffect(() => {
//       fetchCurrentTopic()
//     fetchMemes()
//   }, [])
//
//   const fetchMemes = async () => {
//     try {
//       setLoading(true)
//       const res = await getRandomMemes()
//       let memesData = res.data
//
//       //  AI/Human randomly
//       if (memesData.length === 2) {
//         const [m1, m2] = memesData
//         if (m1.created_by !== m2.created_by && Math.random() < 0.5) {
//           memesData = [m2, m1]
//         }
//       }
//
//       setMemes(memesData)
//       setActiveIndex(0)
//     } catch (err) {
//       console.error("FETCH ERROR:", err.response?.data || err.message)
//       setMessage("Not enough Memes now! 😢")
//     } finally {
//       setLoading(false)
//     }
//   }
//
//   const handleVote = async (memeId) => {
//     try {
//       await voteMeme(memeId)
//       setMessage("Thanks! Your vote was counted.")
//     } catch (err) {
//       console.error("Vote error:", err)
//       setMessage("Vote failed 😢")
//     } finally {
//       setTimeout(() => {
//         setMessage('')
//         fetchMemes()
//       }, 800)
//     }
//   }
//
//   const reportMeme = (memeId) => {
//     alert("Thanks for reporting! We will check it.")
//   }
//
//   if (loading) return <p>Loading memes...</p>
//   if (memes.length < 2) return <p>{message || "Not enough Memes now! 😢"}</p>
//
//   const lastIndex = memes.length - 1
//
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         width: "100%",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         background: "linear-gradient(135deg, #667eea, #764ba2)",
//         color: "white",
//         paddingBottom: "60px",
//         overflowX: "hidden",
//         textAlign: "center",
//       }}
//     >
//       {/* TOPIC */}
// <p className="topic-text">
//   This week's topic:{" "}
//   <span style={{ color: "#fff176" }}>
//     {currentTopic?.name || "No active topic"}
//   </span>
// </p>
//
//       {/* ⭐ DESKTOP VERSION — ORIGINAL 2 memes side-by-side */}
//       <div className="desktop-meme-comparison meme-comparison">
//         {memes.slice(0, 2).map((meme, index) => (
//           <React.Fragment key={meme.id}>
//             <div className="meme-card" onClick={() => handleVote(meme.id)}>
//               <img
//                 src={meme.image_url}
//                 alt={"Meme " + index}
//                 style={{ maxWidth: 350, borderRadius: 12 }}
//               />
//               <button
//                 className="report-button"
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   reportMeme(meme.id)
//                 }}
//               >
//                 🚫 Melden
//               </button>
//             </div>
//
//             {index === 0 && <div className="vs-text">VS</div>}
//           </React.Fragment>
//         ))}
//       </div>
//
//       {/* ⭐ MOBILE VERSION — SLIDER (from your test code) */}
//       <div className="mobile-meme-slider">
//         {/* LEFT ARROW */}
//         <button
//           className="slider-arrow slider-arrow-left"
//           onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
//           style={{
//             opacity: activeIndex === 0 ? 0 : 1,
//             visibility: activeIndex === 0 ? "hidden" : "visible",
//           }}
//         >
//           ‹
//         </button>
//
//         <div className="slider-viewport">
//           <div className="slider-track" style={{
//                         width: `${memes.length * 50}%`,
//                         transform: `translateX(-${activeIndex * 80}%)`
//                   }}>
//   {memes.map((meme, index) => {
//     return (
//       <React.Fragment key={meme.id}>
//         <div
//           className="meme-card slider-card"
//           onClick={() => handleVote(meme.id)}
//         >
//           <img src={meme.image_url} className="slider-image" />
//
//           <button
//             className="report-button"
//             onClick={(e) => {
//               e.stopPropagation();
//               reportMeme(meme.id);
//             }}
//           >
//             🚫 Melden
//           </button>
//         </div>
//
//         {index === 0 && <div className="vs-text">VS</div>}
//       </React.Fragment>
//     )
//   })}
// </div>
//         </div>
//
//         {/* RIGHT ARROW */}
//         <button
//           className="slider-arrow slider-arrow-right"
//           onClick={() => setActiveIndex(prev => Math.min(lastIndex, prev + 1))}
//           style={{
//             opacity: activeIndex === lastIndex ? 0 : 1,
//             visibility: activeIndex === lastIndex ? "hidden" : "visible",
//           }}
//         >
//           ›
//         </button>
//       </div>
//
//       {/* FEEDBACK */}
//       {message && (
//         <div className="vote-feedback" style={{ marginTop: 16 }}>
//           {message}
//         </div>
//       )}
//
//       {/* FOOTER */}
//       <footer className="site-footer">
//         <div className="footer-links">
//           <a href="https://www.tu-darmstadt.de/impressum/index.de.jsp" target="_blank">Impressum</a>
//           <span className="footer-separator">|</span>
//           <a href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp" target="_blank">
//             Privacy
//           </a>
//         </div>
//       </footer>
//
//       {/* COOKIE BANNER */}
//       {!cookieConsent && (
//         <CookieBanner
//           onAccept={handleAcceptCookies}
//           onReject={handleRejectCookies}
//         />
//       )}
//     </div>
//   )
// }
//
// export default Voting


import React, { useEffect, useState } from 'react'
import { getRandomMemes, voteMeme, getCurrentTopic  } from '../api'
import CookieBanner from "./CookieBanner";

const Voting = () => {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [cookieConsent, setCookieConsent] = useState(null)
  const [currentTopic, setCurrentTopic] = useState(null)
  const [seenMemes, setSeenMemes] = useState(new Set())
  const [showCookieBanner, setShowCookieBanner] = useState(false)

  // Debug log
  useEffect(() => {
    console.log("MEMES FROM API:", memes)
  }, [memes])

  // Initialize cookie consent state
  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent")
    setCookieConsent(consent)
    if (!consent) {
      setShowCookieBanner(true)
    }
  }, [])

  const handleAcceptCookies = () => {
    localStorage.setItem("cookieConsent", "all");
    setCookieConsent("all");
    setShowCookieBanner(false);
  };

  const handleRejectCookies = () => {
    localStorage.setItem("cookieConsent", "necessary");
    setCookieConsent("necessary");
    setShowCookieBanner(false);
  };

  const handleCookieSettings = () => {
    setShowCookieBanner(true);
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

  // Meme als gesehen markieren
  const markMemeAsSeen = (memeId) => {
    setSeenMemes(prev => {
      const newSet = new Set(prev)
      newSet.add(memeId)
      return newSet
    })
  }

  // Bei Slider-Änderung aktuelles Meme als gesehen markieren
  useEffect(() => {
    if (memes[activeIndex]) {
      markMemeAsSeen(memes[activeIndex].id)
    }
  }, [activeIndex, memes])

  const fetchMemes = async () => {
    try {
      setLoading(true)
      setSeenMemes(new Set()) // Seen-Memes zurücksetzen
      const res = await getRandomMemes()
      let memesData = res.data

      // AI/Human randomly
      if (memesData.length === 2) {
        const [m1, m2] = memesData
        if (m1.created_by !== m2.created_by && Math.random() < 0.5) {
          memesData = [m2, m1]
        }
      }

      setMemes(memesData)
      setActiveIndex(0)

      // Erstes Meme direkt als gesehen markieren
      if (memesData[0]) {
        markMemeAsSeen(memesData[0].id)
      }
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message)
      setMessage("Not enough Memes now! 😢")
    } finally {
      setLoading(false)
    }
  }

  // 🔥 여기서부터 ELO + 쿠키 체크 포함 투표 로직
  const handleVote = async (winnerId) => {
    // 0) 쿠키 동의 안 했으면 투표 막기
    if (!cookieConsent) {
      setMessage("Please accept cookies first to vote! 🍪")
      setTimeout(() => setMessage(''), 2000)
      return
    }

    if (memes.length < 2) {
      setMessage("Not enough Memes now! 😢")
      return
    }

    // 1) 모바일이면 두 밈 다 봤는지 체크
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768
    if (isMobile && memes.length >= 2) {
      const allSeen = memes.every(meme => seenMemes.has(meme.id))
      if (!allSeen) {
        setMessage("Swipe through both memes first! 👆")
        return
      }
    }

    // 2) winner / loser 계산
    const [m0, m1] = memes
    const loserId = winnerId === m0.id ? m1.id : m0.id

    console.log("SENDING VOTE:", { winnerId, loserId })

    try {
      // ✅ 백엔드: winner_id, loser_id 기대
      await voteMeme(winnerId, loserId)
      setMessage("Thanks! Your vote was counted.")
    } catch (err) {
      console.error("Vote error:", err.response?.data || err.message)
      setMessage("Vote failed 😢")
    } finally {
      setTimeout(() => {
        setMessage('')
        fetchMemes()
      }, 800)
    }
  }

  const reportMeme = (memeId) => {
    // Block reporting if no cookie consent
    if (!cookieConsent) {
      alert("Please accept cookies first to report memes! 🍪")
      return
    }
    alert("Thanks for reporting! We will check it.")
  }

  // Block interaction overlay if no cookie consent
  const renderBlockOverlay = () => {
    if (cookieConsent || !showCookieBanner) return null

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '4vh 6vw'
      }}>
        <div style={{
          backgroundColor: '#2d3748',
          padding: '5vh 5vw',
          borderRadius: '2vh',
          maxWidth: '60vw',
          width: '90%'
        }}>
          <h2 style={{ marginBottom: '3vh' }}>🍪 Cookie Consent Required</h2>
          <p style={{ marginBottom: '4vh' }}>
            To use this voting platform, please accept cookies first.
            This ensures your voting experience is properly tracked and secure.
          </p>
          <button
            onClick={() => setShowCookieBanner(true)}
            style={{
              padding: '2vh 4vw',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '1.5vh',
              fontSize: '2vh',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a67d8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            Open Cookie Settings
          </button>
        </div>
      </div>
    )
  }

  if (loading) return <p>Loading memes...</p>
  if (memes.length < 2) return <p>{message || "Not enough Memes now! 😢"}</p>

  const lastIndex = memes.length - 1
  const isMobileView = typeof window !== "undefined" && window.innerWidth <= 768

  // Prüfen, ob auf Mobile alle Memes gesehen wurden
  const allMemesSeen = isMobileView ? memes.every(meme => seenMemes.has(meme.id)) : true

  return (
    <>
      {/* Block overlay if no cookie consent */}
      {renderBlockOverlay()}

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          color: "white",
          paddingBottom: "5vh",
          overflowX: "hidden",
          textAlign: "center",
          // Add blur and pointer-events blocking when no cookie consent
          filter: !cookieConsent ? 'blur(0.4vh)' : 'none',
          pointerEvents: !cookieConsent ? 'none' : 'auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* TOPIC */}
        <p className="topic-text">
          This week's topic:{" "}
          <span style={{ color: "#fff176" }}>
            {currentTopic?.name || "No active topic"}
          </span>
        </p>

        {/* Mobile Hinweis */}
        {isMobileView && !allMemesSeen && (
          <div className="mobile-vote-hint" style={{
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            border: '1px solid #ffc107',
            borderRadius: '1.5vh',
            padding: '1.8vh 3vw',
            margin: '1.8vh 0',
            color: '#fff',
            fontSize: '0.9rem',
            maxWidth: '90%'
          }}>
            👈 Swipe to see both memes before voting!
          </div>
        )}

        {/* DESKTOP VERSION — 2 memes side-by-side */}
        <div className="desktop-meme-comparison meme-comparison">
          {memes.slice(0, 2).map((meme, index) => (
            <React.Fragment key={meme.id}>
              <div className="meme-card" onClick={() => handleVote(meme.id)}>
                <img
                  src={meme.image_url}
                  alt={"Meme " + index}
                  style={{ maxWidth: "60vw", borderRadius: "2vw" }}
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

        {/* MOBILE VERSION — SLIDER */}
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
                const isSeen = seenMemes.has(meme.id)
                return (
                  <React.Fragment key={meme.id}>
                    <div
                      className="meme-card slider-card"
                      onClick={() => handleVote(meme.id)}
                      style={{
                        opacity: allMemesSeen ? 1 : (isSeen ? 1 : 0.8),
                        filter: allMemesSeen ? 'none' : (isSeen ? 'none' : 'grayscale(20%)'),
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <img src={meme.image_url} className="slider-image" alt={`Meme ${index}`} />

                      {/* Vote-/Hinweis-Message direkt auf dem aktuellen Meme */}
                      {isMobileView && message && index === activeIndex && (
                        <div
                          className={`mobile-vote-message ${
                            message.includes("Swipe") ? "hint" : "success"
                          }`}
                        >
                          {message}
                        </div>
                      )}

                      {/* Sichtbarkeits-Indikator */}
                      {!isSeen && (
                        <div style={{
                          position: 'absolute',
                          top: '1.5vh',
                          right: '2vw',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '0.8vh 2vw',
                          borderRadius: '2vh',
                          fontSize: '0.8rem'
                        }}>
                          👀 Not seen
                        </div>
                      )}

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

        {/* Progress Anzeige für Mobile */}
        {isMobileView && memes.length >= 2 && (
          <div className="mobile-progress" style={{
            margin: '2vh 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2vw'
          }}>
            {memes.map((meme, index) => (
              <div
                key={meme.id}
                style={{
                  width: '2vh',
                  height: '2vh',
                  borderRadius: '50%',
                  backgroundColor: seenMemes.has(meme.id) ? '#4CAF50' : '#ccc',
                  transition: 'background-color 0.3s ease'
                }}
                title={seenMemes.has(meme.id) ? 'Seen' : 'Not seen yet'}
              />
            ))}
            <span style={{ marginLeft: '2vw', fontSize: '0.9rem' }}>
              {Array.from(seenMemes).length}/{memes.length} seen
            </span>
          </div>
        )}

        {/* FEEDBACK */}
        {message && (
          <div className="vote-feedback" style={{ marginTop: '2vh' }}>
            {message}
          </div>
        )}

        {/* FOOTER */}
        <footer className="site-footer">
          <div className="footer-links">
            <a
              href="https://www.tu-darmstadt.de/impressum/index.de.jsp"
              target="_blank"
              rel="noreferrer"
            >
              Impressum
            </a>

            <span className="footer-separator">|</span>

            <a
              href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp"
              target="_blank"
              rel="noreferrer"
            >
              Privacy
            </a>

            <span className="footer-separator">|</span>

            <button onClick={handleCookieSettings}>
              Cookie Settings
            </button>
          </div>
        </footer>
      </div>

      {/* COOKIE BANNER - Immer außerhalb des geblurten Bereichs */}
      {showCookieBanner && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          zIndex: 9999
        }}>
          <CookieBanner
            onAccept={handleAcceptCookies}
            onReject={handleRejectCookies}
          />
        </div>
      )}
    </>
  )
}

export default Voting
