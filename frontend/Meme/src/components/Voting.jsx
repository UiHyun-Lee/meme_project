// import React, { useEffect, useState } from 'react'
// import { getRandomMemes, voteMeme } from '../api'
//
// const Voting = () => {
//   const [memes, setMemes] = useState([])
//   const [selectedMeme, setSelectedMeme] = useState(null) // 클릭된 밈
//   const [loading, setLoading] = useState(true)
//   const [message, setMessage] = useState('')
//   const [scores, setScores] = useState({
//     humor_score: 3,
//     creativity_score: 3,
//     cultural_score: 3
//   })
//
//   useEffect(() => {
//     fetchMemes()
//   }, [])
//
//   const fetchMemes = async () => {
//     try {
//       setLoading(true)
//       const res = await getRandomMemes()
//       let memesData = res.data
//
//       // AI/Human 순서 무작위
//       if (memesData.length === 2) {
//         const [m1, m2] = memesData
//         if (m1.created_by !== m2.created_by && Math.random() < 0.5) {
//           memesData = [m2, m1]
//         }
//       }
//       setMemes(memesData)
//     } catch (err) {
//       console.error('Voting fetch error:', err.response?.data || err.message)
//       setMessage('Not enough Memes now! 😢')
//     } finally {
//       setLoading(false)
//     }
//   }
//
//   const submitVote = async () => {
//     if (!selectedMeme) return
//     try {
//       await voteMeme(selectedMeme.id, scores)
//       setMessage('Thank you for your vote! 🎉')
//     } catch (err) {
//       console.error('Vote error:', err)
//       setMessage('Vote failed 😢')
//     }
//     setSelectedMeme(null)
//     setTimeout(() => {
//       setMessage('')
//       fetchMemes()
//     }, 1500)
//   }
//
//   const reportMeme = (memeId) => {
//     console.log('Meme reported:', memeId)
//     alert('Thanks for reporting it! We will investigate the meme.')
//   }
//
//   if (loading) return <p>Loading memes...</p>
//   if (memes.length < 2) return <p>{message || 'Not enough Memes now! 😢'}</p>
//
//   return (
//     <div
//       style={{
//         minHeight: '100vh',
//         width: '100vw',
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         color: 'white',
//         overflow: 'auto',
//         textAlign: 'center',
//         paddingBottom: '50px'
//       }}
//     >
//       <p className="topic-text">
//         This week's topic: <span style={{ color: '#fff176' }}>{memes[0]?.topic || 'unknown'}</span>
//       </p>
//
//       {/* 밈 비교 */}
//       <div
//         className="meme-comparison"
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           gap: '60px',
//           flexWrap: 'wrap',
//           width: '100%',
//           maxWidth: '1300px'
//         }}
//       >
//         {memes.slice(0, 2).map((meme, index) => (
//           <React.Fragment key={meme.id}>
//             <div
//               className="meme-card"
//               style={{
//                 backgroundColor: 'rgba(255,255,255,0.1)',
//                 borderRadius: '15px',
//                 padding: '15px',
//                 transition: 'transform 0.25s ease, box-shadow 0.25s ease',
//                 cursor: 'pointer',
//               }}
//               onClick={() => setSelectedMeme(meme)} // 클릭 시 모달 열기
//             >
//               <img
//                 src={meme.image}
//                 alt={`Meme ${index}`}
//                 style={{
//                   maxWidth: '350px',
//                   maxHeight: '350px',
//                   objectFit: 'cover',
//                   borderRadius: '10px'
//                 }}
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
//       {message && <div className="vote-feedback">{message}</div>}
//
//       {/* 점수 모달 */}
//       {selectedMeme && (
//         <div
//           className="meme-modal"
//           style={{
//             position: 'fixed',
//             top: 0, left: 0,
//             width: '100%',
//             height: '100%',
//             background: 'rgba(0,0,0,0.7)',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             zIndex: 1000
//           }}
//           onClick={() => setSelectedMeme(null)}
//         >
//           <div
//             className="meme-modal-content"
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               background: '#fff',
//               padding: '20px',
//               borderRadius: '15px',
//               maxWidth: '400px',
//               width: '90%',
//               textAlign: 'center',
//               color: '#333'
//             }}
//           >
//             <img
//               src={selectedMeme.image}
//               alt="Selected meme"
//               style={{ width: '100%', borderRadius: '10px', marginBottom: '10px' }}
//             />
//             <h3>Rate this Meme</h3>
//
//             <div style={{ marginTop: '10px' }}>
//               <label>😂 Humor: {scores.humor_score}</label>
//               <input
//                 type="range"
//                 min="1"
//                 max="5"
//                 value={scores.humor_score}
//                 onChange={(e) => setScores({ ...scores, humor_score: parseInt(e.target.value) })}
//               />
//             </div>
//
//             <div style={{ marginTop: '10px' }}>
//               <label>🎨 Creativity: {scores.creativity_score}</label>
//               <input
//                 type="range"
//                 min="1"
//                 max="5"
//                 value={scores.creativity_score}
//                 onChange={(e) => setScores({ ...scores, creativity_score: parseInt(e.target.value) })}
//               />
//             </div>
//
//             <div style={{ marginTop: '10px' }}>
//               <label>🌍 Cultural Relevance: {scores.cultural_score}</label>
//               <input
//                 type="range"
//                 min="1"
//                 max="5"
//                 value={scores.cultural_score}
//                 onChange={(e) => setScores({ ...scores, cultural_score: parseInt(e.target.value) })}
//               />
//             </div>
//
//             <button
//               onClick={submitVote}
//               style={{
//                 marginTop: '15px',
//                 padding: '10px 20px',
//                 borderRadius: '8px',
//                 background: 'linear-gradient(135deg, #667eea, #764ba2)',
//                 color: 'white',
//                 fontWeight: 'bold',
//                 cursor: 'pointer'
//               }}
//             >
//               Submit Vote
//             </button>
//             <button
//               onClick={() => setSelectedMeme(null)}
//               style={{
//                 marginTop: '15px',
//                 padding: '10px 20px',
//                 borderRadius: '8px',
//                 background: 'red',
//                 color: 'white',
//                 fontWeight: 'bold',
//                 cursor: 'pointer'
//               }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
//
// export default Voting


import React, { useEffect, useState } from 'react'
import {  getRandomMemes, voteMeme  } from '../api'  // backend bleibt auskommentiert
import CookieBanner from "./CookieBanner";

import meme1 from '../assets/meme1.jpg'
import meme2 from '../assets/meme2.jpg'

const Voting = () => {
  // Lokale Memes für das Testing
  const [memes, setMemes] = useState([
    { id: 1, image_url: meme1, topic: 'damn', created_by: 'local1', total_votes: 0 },
    { id: 2, image_url: meme2, topic: 'damn', created_by: 'local2', total_votes: 0 }
  ])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeIndex, setActiveIndex] = useState(0) // für mobile Slider

  const [cookieConsent, setCookieConsent] = useState(
    localStorage.getItem("cookieConsent")
  );

  /*
  // ORIGINAL BACKEND CODE !
  useEffect(() => {
    fetchMemes()
  }, [])

  const fetchMemes = async () => {
    try {
      setLoading(true)
      const res = await getRandomMemes()
      let memesData = res.data

      if (memesData.length === 2) {
        const [m1, m2] = memesData
        if (m1.created_by !== m2.created_by && Math.random() < 0.5) {
          memesData = [m2, m1]
        }
      }
      setMemes(memesData)
    } catch (err) {
      console.error('Voting fetch error:', err.response?.data || err.message)
      setMessage('Not enough Memes now! 😢')
    } finally {
      setLoading(false)
    }
  }
  */

  const handleAcceptCookies = () => {
    localStorage.setItem("cookieConsent", "all");
    setCookieConsent("all");
  };

  const handleRejectCookies = () => {
    localStorage.setItem("cookieConsent", "necessary");
    setCookieConsent("necessary");
  };

  const handleVote = async (memeId) => {
    /*
    try {
      await voteMeme(memeId)
      setMessage('Thanks! Your vote was counted.')
    } catch (err) {
      console.error('Vote error:', err.response?.data || err.message)
      setMessage('Vote failed 😢')
    } finally {
      setTimeout(() => {
        setMessage('')
        fetchMemes()
      }, 800)
    }
    */

    // lokale Simulation
    console.log("Voted locally:", memeId)
    setMessage("Thanks! Your vote was counted (local).")

    setTimeout(() => setMessage(""), 800)
  }

  const reportMeme = (memeId) => {
    console.log("Reported meme:", memeId)
    alert("Thanks, we will check the meme.")
  }

  if (loading) return <p>Loading memes...</p>
  if (memes.length < 2) return <p>{message || "Not enough memes! 😢"}</p>

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        overflowX: 'hidden',
        paddingBottom: '60px',
      }}
    >
      <p className="topic-text">
        This week's topic: <span style={{ color: '#fff176' }}>{memes[0]?.topic}</span>
      </p>

      {/* DESKTOP VERSION – 2 Memes nebeneinander */}
      <div className="desktop-meme-comparison meme-comparison">
        {memes.map((meme, index) => (
          <React.Fragment key={meme.id}>
            <div
              className="meme-card"
              onClick={() => handleVote(meme.id)}
            >
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

      {/* MOBILE VERSION – Slider mit sichtbarem Rand des nächsten Memes */}
      <div className="mobile-meme-slider">
        {/* LEFT ARROW */}
        <button
                className="slider-arrow slider-arrow-left"
                onClick={() => setActiveIndex(0)}
                style={{
                  opacity: activeIndex === 0 ? 0 : 1,
                  visibility: activeIndex === 0 ? 'hidden' : 'visible',
                  pointerEvents: activeIndex === 0 ? 'none' : 'auto',
                }}
        >
          ‹
        </button>


        <div className="slider-viewport">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${activeIndex * 70}%)` }}
          >
            {memes.map((meme, index) => (
              <div
                key={meme.id}
                className="meme-card slider-card"
                onClick={() => handleVote(meme.id)}
              >
                <img src={meme.image_url} className="slider-image" />

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
            ))}
          </div>
        </div>

        {/* RIGHT ARROW */}
        <button
          className="slider-arrow slider-arrow-right"
          onClick={() => setActiveIndex(1)}
          style={{
            opacity: activeIndex === 1 ? 0 : 1,
            visibility: activeIndex === 1 ? 'hidden' : 'visible',
            pointerEvents: activeIndex === 1 ? 'none' : 'auto',
          }}
        >
          ›
        </button>

      </div>

      {message && <div className="vote-feedback">{message}</div>}

      <footer className="site-footer">
        <div className="footer-links">
          <a href="https://www.tu-darmstadt.de/impressum/index.de.jsp" target="_blank">Impressum</a>
          <span className="footer-separator">|</span>
          <a href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp" target="_blank">Privacy</a>
        </div>
      </footer>

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