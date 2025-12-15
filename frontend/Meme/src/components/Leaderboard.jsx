import React, { useEffect, useState } from "react";
import {
  getLeaderboardMemes,
  getLeaderboardHumansVsAI,
  getLeaderboardTopMemes,
  getCurrentTopic,
  getTopics,
} from "../api";
import Typewriter from "./Typewriter";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("individual");
  const [topicsFromBackend, setTopicsFromBackend] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicList, setTopicList] = useState([]);
  const [individualData, setIndividualData] = useState([]);
  const [summary, setSummary] = useState({ human: {}, ai: {} });
  const [humanTop10, setHumanTop10] = useState([]);
  const [aiTop10, setAiTop10] = useState([]);
  const [galleryTop10, setGalleryTop10] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const closePreview = () => setPreviewImage(null);

  // INITIAL LOAD
  useEffect(() => {
    initLeaderboard();
  }, []);

const initLeaderboard = async () => {
  try {
    const topicsRes = await getTopics();
    const topicNames = topicsRes.data.map(t => t.name);

    setTopicList(topicNames);
    setTopicsFromBackend(topicNames);

    const currentRes = await getCurrentTopic();
    const weeklyTopic = currentRes?.data?.name;

    let selected = null;

    if (weeklyTopic && topicNames.includes(weeklyTopic)) {
      selected = weeklyTopic;
    } else if (topicNames.length > 0) {
      selected = topicNames[0];
    }

    setSelectedTopic(selected);

    if (selected) {
      await loadIndividual(selected);
      await loadHumansVsAI();
      await loadTopMemes();
    }

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

      {/* INDIVIDUAL RANKINGS */}
      {activeTab === "individual" && (
        <div className="tab-content">

          {/* Topic-Auswahl als Dropdown */}
    <div className="topic-dropdown-wrapper">
      <label htmlFor="topic-select" className="topic-dropdown-label">
        Topic:
      </label>

<select
  id="topic-select"
  className="topic-dropdown"
  value={selectedTopic || ""}
  onChange={(e) => handleTopicChange(e.target.value)}
>
  {topicList.map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ))}
</select>
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
                      style={{ width: "80px", borderRadius: "8px", cursor: "pointer" }}
                      onClick={() => setPreviewImage(entry.image_url)}
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

      {/* HUMANS VS AI — summary + Human/AI top 10 */}
      {activeTab === "humansVsAi" && (
        <div className="tab-content">

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

            {/* HUMAN TOP 10 */}
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
                        className="user-avatar"
                        style={{ width: "80px", borderRadius: "8px", cursor: "pointer" }}
                        onClick={() => setPreviewImage(meme.image_url)}
                      />
                    </td>
                    <td>
                      <span className={`type-badge ${meme.created_by.toLowerCase()}`}>
                        {meme.created_by.toUpperCase()}
                      </span>
                    </td>
                    <td>{meme.rating.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* AI TOP 10 */}
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
                        className="user-avatar"
                        style={{ width: "80px", borderRadius: "8px", cursor: "pointer" }}
                        onClick={() => setPreviewImage(meme.image_url)}
                      />
                    </td>
                    <td>
                      <span className={`type-badge ${meme.created_by.toLowerCase()}`}>
                        {meme.created_by.toUpperCase()}
                      </span>
                    </td>
                    <td>{meme.rating.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

        </div>
      )}

      {/* TOP 10 MEMES — unified gallery */}
      {activeTab === "topMemes" && (
        <div className="tab-content">
          <h3>Top 10 Memes</h3>

          <div className="meme-grid">
            {galleryTop10.map((meme, i) => (
              <div key={meme.id} className="meme-gallery-item">
                <img
                  src={meme.image_url}
                  alt={`meme-${meme.id}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setPreviewImage(meme.image_url)}
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

      {previewImage && (
        <div className="image-modal" onClick={closePreview}>
          <div
            className="image-modal-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="image-modal-close"
              onClick={closePreview}
              aria-label="Close preview"
            >
              ×
            </button>
            <img
              src={previewImage}
              className="image-modal-content"
              alt="Preview"
            />
          </div>
        </div>
      )}

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

            </div>
          </footer>


    </div>
  );
};

export default Leaderboard;