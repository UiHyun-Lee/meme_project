// import React, { useEffect, useState } from 'react'
// import { getLeaderboard } from '../api'
// import Typewriter from "./Typewriter";
// import FadeInSection from "./FadeInSection";
//
// const Leaderboard = () => {
//   const [activeTab, setActiveTab] = useState('individual')
//   const [selectedMeme, setSelectedMeme] = useState(null)
//   const [leaderboardData, setLeaderboardData] = useState([])
//   const [loading, setLoading] = useState(true)
//
//   useEffect(() => {
//     fetchLeaderboard()
//   }, [])
//
//   const fetchLeaderboard = async () => {
//     try {
//       setLoading(true)
//       const res = await getLeaderboard()
//       setLeaderboardData(res.data)
//     } catch (err) {
//       console.error('Leaderboard fetch error:', err)
//     } finally {
//       setLoading(false)
//     }
//   }
//
//   // avgScore (Human vs AI)
//   const summaryData = ['human', 'ai'].map(type => {
//     const filtered = leaderboardData.filter(e => e.created_by === type)
//     const totalScore = filtered.reduce((sum, e) => sum + e.total_votes, 0)
//     const avgScore = filtered.length ? (totalScore / filtered.length).toFixed(1) : 0
//     return {
//       type: type.toUpperCase(),
//       score: totalScore,
//       count: filtered.length,
//       avgScore
//     }
//   })
//
//   // loading
//   if (loading) return <p style={{ color: 'white', textAlign: 'center' }}>Loading leaderboard...</p>
//
//   return (
//     <div style={{
//       textAlign: 'center',
//       marginBottom: '30px',
//       padding: '20px',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       borderRadius: '12px',
//       color: 'white'
//     }}>
//
//       <h2>
//           <Typewriter text="Leaderboard" speed={50} delayBeforeStart={0} />
//       </h2>
//       <p>
//            <Typewriter text="Who Reigns Supreme in the Meme Arena?" speed={50} delayBeforeStart={1000}/><span className="cursor">|</span>
//       </p>
//
//       <div className="tab-navigation">
//         <button className={activeTab === 'individual' ? 'active' : ''} onClick={() => setActiveTab('individual')}>Individual Rankings</button>
//         <button className={activeTab === 'humansVsAi' ? 'active' : ''} onClick={() => setActiveTab('humansVsAi')}>Humans vs AI</button>
//         <button className={activeTab === 'topMemes' ? 'active' : ''} onClick={() => setActiveTab('topMemes')}>Top 10 Memes</button>
//       </div>
//
//       {/* Individual Rankings */}
//       {activeTab === 'individual' && (
//         <div className="tab-content">
//           <table className="leaderboard-table">
//             <thead>
//               <tr>
//                 <th>Rank</th>
//                 <th>Meme</th>
//                 <th>Type</th>
//                 <th>Votes</th>
// {/*                 <th>Avg Humor</th> */}
//               </tr>
//             </thead>
//             <tbody>
//               {leaderboardData.map((entry, i) => (
//                 <tr key={entry.id}>
//                   <td>{i + 1}</td>
//                   <td>
//                     <img
//                       src={entry.image}
//                       alt={`meme-${entry.id}`}
//                       className="user-avatar"
//                       style={{ width: '80px', borderRadius: '8px' }}
//                       onError={(e) => e.target.src = 'https://via.placeholder.com/80/333/fff?text=M'}
//                     />
//                   </td>
//                   <td><span className={`type-badge ${entry.created_by.toLowerCase()}`}>{entry.created_by.toUpperCase()}</span></td>
//                   <td>{entry.total_votes}</td>
// {/*                   <td>{entry.humor_avg?.toFixed(1)}</td> */}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//
//       {/* Humans vs AI */}
//       {activeTab === 'humansVsAi' && (
//         <div className="tab-content">
//           <div className="summary-cards">
//             {summaryData.map((item, index) => (
//               <div key={item.type} className="summary-card">
//                 <h4>{item.type}</h4>
//                 <div className="summary-stats">
//                   <p>Total Votes: <strong>{item.score}</strong></p>
//                   <p>Participants: <strong>{item.count}</strong></p>
//                   <p>Avg Votes: <strong>{item.avgScore}</strong></p>
//                 </div>
//                 <div className={`rank-badge ${index === 0 ? 'first' : 'second'}`}>#{index + 1}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//
//       {/* Top Memes */}
//       {activeTab === 'topMemes' && (
//         <div className="tab-content">
//           <div className="meme-grid">
//             {leaderboardData.map((meme, i) => (
//               <div
//                 key={meme.id}
//                 className="meme-gallery-item"
//                 onClick={() => setSelectedMeme(meme)}
//               >
//                 <img
//                   src={meme.image_url}
//                   alt={`Top meme ${meme.id}`}
//                   onError={(e) => e.target.src = 'https://via.placeholder.com/150/333/fff?text=Meme'}
//                 />
//                 <div className="meme-info">
//                   <div className="meme-rank">#{i + 1}</div>
//                   <div className="meme-likes">🏆 {meme.total_votes} Votes</div>
//                   <div className="meme-author">
//                     by {meme.created_by.toUpperCase()}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//
//       {/* Meme Modal */}
//       {selectedMeme && (
//         <div className="meme-modal" onClick={() => setSelectedMeme(null)}>
//           <div className="meme-modal-content" onClick={(e) => e.stopPropagation()}>
//             <img src={selectedMeme.image} alt="Meme full view" />
//             <p>
//               <strong>{selectedMeme.created_by.toUpperCase()}</strong> – {selectedMeme.total_votes} votes
//             </p>
//             <button className="close-btn" onClick={() => setSelectedMeme(null)}>Close</button>
//           </div>
//         </div>
//       )}
//
//         {/* Footer */}
//     <footer className="site-footer">
//         <div className="footer-links">
//           <a
//             href="https://www.tu-darmstadt.de/impressum/index.de.jsp"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Impressum
//           </a>
//           <span className="footer-separator">|</span>
//           <a
//             href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Privacy Policy
//           </a>
//         </div>
//       </footer>
//
//     </div>
//   )
// }
//
// export default Leaderboard

import React, { useEffect, useState } from "react";
import {
  getLeaderboardMemes,
  getLeaderboardHumansVsAI,
  getLeaderboardTopMemes,
  getCurrentTopic,
} from "../api";
import Typewriter from "./Typewriter";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("individual");

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicList, setTopicList] = useState([]);

  const [individualData, setIndividualData] = useState([]);

  const [summary, setSummary] = useState({ human: {}, ai: {} });
  const [humanTop10, setHumanTop10] = useState([]);
  const [aiTop10, setAiTop10] = useState([]);

  const [galleryTop10, setGalleryTop10] = useState([]);

  const [loading, setLoading] = useState(true);

  // INITIAL LOAD
  useEffect(() => {
    initLeaderboard();
  }, []);

  const initLeaderboard = async () => {
    try {
      const res = await getCurrentTopic();
      const currentTopic = res?.data?.name || null;

      setSelectedTopic(currentTopic);
      setTopicList([currentTopic]);

      await loadIndividual(currentTopic);
      await loadHumansVsAI();
      await loadTopMemes();
    } catch (e) {
      console.error("Leaderboard init error:", e);
    } finally {
      setLoading(false);
    }
  };

  // INDIVIDUAL RANKINGS
  const loadIndividual = async (topic) => {
    try {
      const res = await getLeaderboardMemes(topic);
      setIndividualData(res.data);
    } catch (e) {
      console.error("Individual fetch error:", e);
    }
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    loadIndividual(topic);
  };

  // HUMANS VS AI
  const loadHumansVsAI = async () => {
    try {
      const res = await getLeaderboardHumansVsAI();
      setSummary(res.data.summary);
      setHumanTop10(res.data.human_top10);
      setAiTop10(res.data.ai_top10);
    } catch (e) {
      console.error("Humans vs AI fetch error:", e);
    }
  };

  // TOP MEMES GALLERY
  const loadTopMemes = async () => {
    try {
      const res = await getLeaderboardTopMemes();
      setGalleryTop10(res.data.top10);
    } catch (e) {
      console.error("Top Memes fetch error:", e);
    }
  };

  if (loading)
    return <p style={{ color: "white", textAlign: "center" }}>Loading…</p>;

  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: "30px",
        padding: "20px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        color: "white",
      }}
    >
      <h2>
        <Typewriter text="Leaderboard" speed={50} />
      </h2>

      <p>
        <Typewriter
          text="Who Reigns Supreme in the Meme Arena?"
          speed={50}
          delayBeforeStart={1000}
        />
        <span className="cursor">|</span>
      </p>

      {/* TAB NAVIGATION */}
      <div className="tab-navigation">
        <button
          className={activeTab === "individual" ? "active" : ""}
          onClick={() => setActiveTab("individual")}
        >
          Individual Rankings
        </button>

        <button
          className={activeTab === "humansVsAi" ? "active" : ""}
          onClick={() => setActiveTab("humansVsAi")}
        >
          Humans vs AI
        </button>

        <button
          className={activeTab === "topMemes" ? "active" : ""}
          onClick={() => setActiveTab("topMemes")}
        >
          Top 10 Memes
        </button>
      </div>

      {/* ===================================================== */}
      {/* 1) INDIVIDUAL RANKINGS */}
      {/* ===================================================== */}
      {activeTab === "individual" && (
        <div className="tab-content">

          <div style={{ marginBottom: "10px" }}>
            {topicList.map((t) => (
              <button
                key={t}
                onClick={() => handleTopicChange(t)}
                className={selectedTopic === t ? "active" : ""}
                style={{ margin: "0 5px" }}
              >
                {t}
              </button>
            ))}
          </div>

          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Meme</th>
                <th>Type</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {individualData.map((entry, i) => (
                <tr key={entry.id}>
                  <td>{i + 1}</td>
                  <td>
                    <img
                      src={entry.image_url}
                      className="user-avatar"
                      style={{ width: "80px", borderRadius: "8px" }}
                    />
                  </td>
                  <td>
                    <span
                      className={`type-badge ${entry.created_by.toLowerCase()}`}
                    >
                      {entry.created_by.toUpperCase()}
                    </span>
                  </td>
                  <td>{entry.rating.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================================================== */}
      {/* 2) HUMANS VS AI — summary + Human/AI top 10 */}
      {/* ===================================================== */}
      {activeTab === "humansVsAi" && (
        <div className="tab-content">

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <h4>HUMAN</h4>
              <div className="summary-stats">
                <p>Total Votes: <strong>{summary?.human?.total_votes ?? 0}</strong></p>
                <p>Memes: <strong>{summary?.human?.count ?? 0}</strong></p>
              </div>
            </div>

            <div className="summary-card">
              <h4>AI</h4>
              <div className="summary-stats">
                <p>Total Votes: <strong>{summary?.ai?.total_votes ?? 0}</strong></p>
                <p>Memes: <strong>{summary?.ai?.count ?? 0}</strong></p>
              </div>
            </div>
          </div>

          {/* HUMAN TOP 10 TABLE */}
          <h3>Top Human Memes</h3>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Meme</th>
                <th>Type</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {humanTop10.map((meme, i) => (
                <tr key={meme.id}>
                  <td>{i + 1}</td>
                  <td>
                    <img
                      src={meme.image_url}
                      style={{ width: "80px", borderRadius: "8px" }}
                    />
                  </td>
                  <td>
                    <span className={`type-badge ${meme.created_by.toLowerCase()}`}>
                      {meme.created_by.toUpperCase()}
                    </span>
                  </td>
                  <td>{entry.rating.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* AI TOP 10 TABLE */}
          <h3>Top AI Memes</h3>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Meme</th>
                <th>Type</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {aiTop10.map((meme, i) => (
                <tr key={meme.id}>
                  <td>{i + 1}</td>
                  <td>
                    <img
                      src={meme.image_url}
                      style={{ width: "80px", borderRadius: "8px" }}
                    />
                  </td>
                  <td>
                    <span className={`type-badge ${meme.created_by.toLowerCase()}`}>
                      {meme.created_by.toUpperCase()}
                    </span>
                  </td>
                  <td>{entry.rating.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================================================== */}
      {/* 3) TOP 10 MEMES — unified gallery */}
      {/* ===================================================== */}
      {activeTab === "topMemes" && (
        <div className="tab-content">
          <h3>Top 10 Memes</h3>

          <div className="meme-grid">
            {galleryTop10.map((meme, i) => (
              <div key={meme.id} className="meme-gallery-item">
                <img
                  src={meme.image_url}
                  alt={`meme-${meme.id}`}
                />

                <div className="meme-info">
                  <div className="meme-rank">#{i + 1}</div>

                  <div className="meme-likes">
                    🏆 {meme.total_votes} votes
                  </div>

                  <span
                    className={`type-badge ${meme.created_by.toLowerCase()}`}
                    style={{ marginTop: "6px", display: "inline-block" }}
                  >
                    {meme.created_by.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
