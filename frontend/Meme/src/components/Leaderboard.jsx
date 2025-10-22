import React, { useState } from 'react'

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('individual')
  const [selectedMeme, setSelectedMeme] = useState(null) // Für vergrößerte Meme-Ansicht

  const leaderboardData = [
    { rank: 1, username: 'MemeMaker260', type: 'Human', score: 1412, avatar: 'frontend/Meme/public/templates/template1.jpg' },
    { rank: 2, username: 'OpenAI', type: 'AI', score: 1378, avatar: 'frontend/Meme/public/templates/template2.jpg' },
    { rank: 3, username: 'MemeMaker7', type: 'Human', score: 1110, avatar: 'frontend/Meme/public/templates/template3.jpg' },
    { rank: 4, username: 'Grok', type: 'AI', score: 999, avatar: 'frontend/Meme/public/templates/template4.jpg' },
    { rank: 5, username: 'MemeMaker127', type: 'Human', score: 912, avatar: 'frontend/Meme/public/templates/template5.jpg' },
    { rank: 6, username: 'Claude', type: 'AI', score: 893, avatar: 'frontend/Meme/public/templates/template6.jpg' },
    { rank: 7, username: 'Deepseek', type: 'AI', score: 707, avatar: 'frontend/Meme/public/templates/template7.jpg' },
    { rank: 8, username: 'MemeKing42', type: 'Human', score: 645, avatar: 'frontend/Meme/public/templates/template8.jpg' },
    { rank: 9, username: 'GPT-Memer', type: 'AI', score: 598, avatar: 'frontend/Meme/public/templates/template9.jpg' },
    { rank: 10, username: 'LaughMaster', type: 'Human', score: 532, avatar: 'frontend/Meme/public/templates/template10.jpg' }
  ]

  const summaryData = [
    {
      type: 'Human',
      score: leaderboardData.filter(e => e.type === 'Human').reduce((s, e) => s + e.score, 0),
      count: leaderboardData.filter(e => e.type === 'Human').length,
      avgScore: Math.round(
        leaderboardData.filter(e => e.type === 'Human').reduce((s, e) => s + e.score, 0) /
        leaderboardData.filter(e => e.type === 'Human').length
      )
    },
    {
      type: 'AI',
      score: leaderboardData.filter(e => e.type === 'AI').reduce((s, e) => s + e.score, 0),
      count: leaderboardData.filter(e => e.type === 'AI').length,
      avgScore: Math.round(
        leaderboardData.filter(e => e.type === 'AI').reduce((s, e) => s + e.score, 0) /
        leaderboardData.filter(e => e.type === 'AI').length
      )
    }
  ]

  const topMemes = [
    { id: 1, image: 'frontend/Meme/public/meme1.jpg', points: 324, author: 'MemeMaker260', type: 'Human' },
    { id: 2, image: 'frontend/Meme/public/meme2.jpg', points: 298, author: 'OpenAI', type: 'AI' },
    { id: 3, image: 'frontend/Meme/public/templates/template1.jpg', points: 267, author: 'MemeMaker7', type: 'Human' },
    { id: 4, image: 'frontend/Meme/public/templates/template2.jpg', points: 245, author: 'Grok', type: 'AI' },
    { id: 5, image: 'frontend/Meme/public/templates/template3.jpg', points: 223, author: 'MemeMaker127', type: 'Human' },
    { id: 6, image: 'frontend/Meme/public/templates/template4.jpg', points: 198, author: 'Claude', type: 'AI' },
    { id: 7, image: 'frontend/Meme/public/templates/template5.jpg', points: 176, author: 'Deepseek', type: 'AI' },
    { id: 8, image: 'frontend/Meme/public/templates/template6.jpg', points: 154, author: 'MemeKing42', type: 'Human' },
    { id: 9, image: 'frontend/Meme/public/templates/template7.jpg', points: 143, author: 'GPT-Memer', type: 'AI' },
    { id: 10, image: 'frontend/Meme/public/templates/template8.jpg', points: 132, author: 'LaughMaster', type: 'Human' }
  ]

  return (
    <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
      <h2>Leaderboard</h2>
      <p>Who Reigns Supreme in the Meme Arena?</p>

      <div className="tab-navigation">
        <button className={activeTab === 'individual' ? 'active' : ''} onClick={() => setActiveTab('individual')}>Individual Rankings</button>
        <button className={activeTab === 'humansVsAi' ? 'active' : ''} onClick={() => setActiveTab('humansVsAi')}>Humans vs AI</button>
        <button className={activeTab === 'topMemes' ? 'active' : ''} onClick={() => setActiveTab('topMemes')}>Top 10 Memes</button>
      </div>

      {/* Individual Rankings */}
      {activeTab === 'individual' && (
        <div className="tab-content">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Type</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry) => (
                <tr key={entry.rank}>
                  <td>{entry.rank}</td>
                  <td className="user-cell">
                    <img 
                      src={entry.avatar} 
                      alt={entry.username}
                      className="user-avatar"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/40/333/fff?text=U'}
                    />
                    {entry.username}
                  </td>
                  <td><span className={`type-badge ${entry.type.toLowerCase()}`}>{entry.type}</span></td>
                  <td>{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Humans vs AI */}
      {activeTab === 'humansVsAi' && (
        <div className="tab-content">
          <div className="summary-cards">
            {summaryData.map((item, index) => (
              <div key={item.type} className="summary-card">
                <h4>{item.type}</h4>
                <div className="summary-stats">
                  <p>Total Score: <strong>{item.score}</strong></p>
                  <p>Top Creators: <strong>{item.count}</strong></p>
                  <p>Avg Score: <strong>{item.avgScore}</strong></p>
                </div>
                <div className={`rank-badge ${index === 0 ? 'first' : 'second'}`}>#{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Memes */}
      {activeTab === 'topMemes' && (
        <div className="tab-content">
          <div className="meme-grid">
            {topMemes.map((meme) => (
              <div 
                key={meme.id} 
                className="meme-gallery-item"
                onClick={() => setSelectedMeme(meme)} // Klick öffnet vergrößerte Ansicht
              >
                <img 
                  src={meme.image} 
                  alt={`Top meme ${meme.id}`}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150/333/fff?text=Meme'}
                />
                <div className="meme-info">
                  <div className="meme-rank">#{meme.id}</div>
                  <div className="meme-likes">🏆 {meme.points} Points</div>
                  <div className="meme-author">
                    by {meme.author}
                    <span className={`author-type ${meme.type.toLowerCase()}`}>{meme.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meme Modal */}
      {selectedMeme && (
        <div className="meme-modal" onClick={() => setSelectedMeme(null)}>
          <div className="meme-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedMeme.image} alt="Meme full view" />
            <p>
              <strong>{selectedMeme.author}</strong> ({selectedMeme.type}) – {selectedMeme.points} Punkte
            </p>
            <button className="close-btn" onClick={() => setSelectedMeme(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
