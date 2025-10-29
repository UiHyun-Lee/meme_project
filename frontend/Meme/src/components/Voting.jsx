// import React, { useEffect, useState } from 'react'
// import { getRandomMemes, voteMeme } from '../api'
//
// const Voting = () => {
//   const [memes, setMemes] = useState([])
//   const [selected, setSelected] = useState(null)
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
// const fetchMemes = async () => {
//   try {
//     setLoading(true)
//     const res = await getRandomMemes()
//     let memesData = res.data
//
//     // pick human and ai randomly
//     if (memesData.length === 2) {
//       const [m1, m2] = memesData
//       if (m1.created_by !== m2.created_by) {
//         // 50% wharscheinlichkeit
//         if (Math.random() < 0.5) {
//           memesData = [m2, m1]
//         }
//       }
//     }
//
//     setMemes(memesData)
//   } catch (err) {
//     console.error('Voting fetch error:', err.response?.data || err.message)
//     setMessage('Not enough Memes now! 😢')
//   } finally {
//     setLoading(false)
//   }
// }
//
//   const handleVote = async (memeId) => {
//     setSelected(memeId)
//     try {
//       await voteMeme(memeId)
//       setMessage('Thank you for your vote! 🎉')
//     } catch (err) {
//       console.error('Vote error:', err)
//     }
//     setTimeout(() => {
//       setMessage('')
//       setSelected(null)
//       fetchMemes()
//     }, 2000)
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
//         height: '100vh',
//         width: '100vw',
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         color: 'white',
//         overflow: 'hidden',
//         textAlign: 'center',
//       }}>
//
//       <p className="topic-text">This week's topic: <span style={{ color: '#fff176' }}>{memes[0]?.topic || 'unknown'}</span></p>
//       <div
//         className="meme-comparison"
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           gap: '60px',
//           flexWrap: 'wrap',
//           width: '100%',
//           maxWidth: '1300px',
//         }}>
//
//       {/* 점수 선택 UI */}
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'center',
//           gap: '30px',
//           backgroundColor: 'rgba(255,255,255,0.15)',
//           borderRadius: '10px',
//           padding: '10px 20px',
//           marginBottom: '25px'
//         }}
//       >
//         <div>
//           <label>😂 Humor: </label>
//           <input
//             type="range"
//             min="1"
//             max="5"
//             value={scores.humor_score}
//             onChange={(e) => setScores({ ...scores, humor_score: parseInt(e.target.value) })}
//           />
//           <span> {scores.humor_score}</span>
//         </div>
//
//         <div>
//           <label>🎨 Creativity: </label>
//           <input
//             type="range"
//             min="1"
//             max="5"
//             value={scores.creativity_score}
//             onChange={(e) => setScores({ ...scores, creativity_score: parseInt(e.target.value) })}
//           />
//           <span> {scores.creativity_score}</span>
//         </div>
//
//         <div>
//           <label>🌍 Cultural Relevance: </label>
//           <input
//             type="range"
//             min="1"
//             max="5"
//             value={scores.cultural_score}
//             onChange={(e) => setScores({ ...scores, cultural_score: parseInt(e.target.value) })}
//           />
//           <span> {scores.cultural_score}</span>
//         </div>
//       </div>
//         {memes.slice(0, 2).map((meme, index) => (
//           <React.Fragment key={meme.id}>
//             <div
//               className={`meme-card ${selected === meme.id ? 'selected' : ''}`}
//               style={{
//                 backgroundColor: 'rgba(255,255,255,0.1)',
//                 borderRadius: '15px',
//                 padding: '15px',
//                 transition: 'transform 0.25s ease, box-shadow 0.25s ease',
//                 transform: selected === meme.id ? 'scale(1.05)' : 'scale(1)',
//                 boxShadow:
//                   selected === meme.id
//                     ? '0 8px 20px rgba(0,0,0,0.3)'
//                     : '0 4px 10px rgba(0,0,0,0.2)',
//               }}>
//
//               <div
//                 className="meme-image-container"
//                 onClick={() => handleVote(meme.id)}>
//                 <img
//                   src={meme.image}
//                   alt={`Meme ${index}`}
//                   style={{
//                     maxWidth: '100%',
//                     maxHeight: '100%',
//                     objectFit: 'cover',
//                     borderRadius: '10px',
//                   }}/>
//
//                 <div
//                   className="vote-overlay"
//                   onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
//                   onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}>
//                   VOTE FOR THIS MEME
//                 </div>
//               </div>
//
//               <button
//                 className="report-button"
//                 onClick={() => reportMeme(meme.id)}>
//                 🚫 Melden
//               </button>
//             </div>
//
//             {index === 0 && (
//         <div className="vs-text">VS</div>
//             )}
//           </React.Fragment>
//         ))}
//       </div>
//
//       {message && (
//         <div
//           className="vote-feedback">
//           {message}
//         </div>
//       )}
//     </div>
//   )
// }
//
// export default Voting


import React, { useEffect, useState } from 'react'
import { getRandomMemes, voteMeme } from '../api'

const Voting = () => {
  const [memes, setMemes] = useState([])
  const [selectedMeme, setSelectedMeme] = useState(null) // 클릭된 밈
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [scores, setScores] = useState({
    humor_score: 3,
    creativity_score: 3,
    cultural_score: 3
  })

  useEffect(() => {
    fetchMemes()
  }, [])

  const fetchMemes = async () => {
    try {
      setLoading(true)
      const res = await getRandomMemes()
      let memesData = res.data

      // AI/Human 순서 무작위
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

  const submitVote = async () => {
    if (!selectedMeme) return
    try {
      await voteMeme(selectedMeme.id, scores)
      setMessage('Thank you for your vote! 🎉')
    } catch (err) {
      console.error('Vote error:', err)
      setMessage('Vote failed 😢')
    }
    setSelectedMeme(null)
    setTimeout(() => {
      setMessage('')
      fetchMemes()
    }, 1500)
  }

  const reportMeme = (memeId) => {
    console.log('Meme reported:', memeId)
    alert('Thanks for reporting it! We will investigate the meme.')
  }

  if (loading) return <p>Loading memes...</p>
  if (memes.length < 2) return <p>{message || 'Not enough Memes now! 😢'}</p>

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        overflow: 'auto',
        textAlign: 'center',
        paddingBottom: '50px'
      }}
    >
      <p className="topic-text">
        This week's topic: <span style={{ color: '#fff176' }}>{memes[0]?.topic || 'unknown'}</span>
      </p>

      {/* 밈 비교 */}
      <div
        className="meme-comparison"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: '1300px'
        }}
      >
        {memes.slice(0, 2).map((meme, index) => (
          <React.Fragment key={meme.id}>
            <div
              className="meme-card"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '15px',
                padding: '15px',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedMeme(meme)} // 클릭 시 모달 열기
            >
              <img
                src={meme.image}
                alt={`Meme ${index}`}
                style={{
                  maxWidth: '350px',
                  maxHeight: '350px',
                  objectFit: 'cover',
                  borderRadius: '10px'
                }}
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

      {message && <div className="vote-feedback">{message}</div>}

      {/* 점수 모달 */}
      {selectedMeme && (
        <div
          className="meme-modal"
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedMeme(null)}
        >
          <div
            className="meme-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '15px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              color: '#333'
            }}
          >
            <img
              src={selectedMeme.image}
              alt="Selected meme"
              style={{ width: '100%', borderRadius: '10px', marginBottom: '10px' }}
            />
            <h3>Rate this Meme</h3>

            <div style={{ marginTop: '10px' }}>
              <label>😂 Humor: {scores.humor_score}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={scores.humor_score}
                onChange={(e) => setScores({ ...scores, humor_score: parseInt(e.target.value) })}
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <label>🎨 Creativity: {scores.creativity_score}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={scores.creativity_score}
                onChange={(e) => setScores({ ...scores, creativity_score: parseInt(e.target.value) })}
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <label>🌍 Cultural Relevance: {scores.cultural_score}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={scores.cultural_score}
                onChange={(e) => setScores({ ...scores, cultural_score: parseInt(e.target.value) })}
              />
            </div>

            <button
              onClick={submitVote}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Submit Vote
            </button>
            <button
              onClick={() => setSelectedMeme(null)}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'red',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Voting
