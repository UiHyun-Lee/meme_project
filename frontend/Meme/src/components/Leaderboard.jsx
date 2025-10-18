import React, { useState } from 'react'

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('individual') // 'individual', 'humansVsAi', 'topMemes'

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

  // Summary leaderboard (Human vs AI)
  const summaryData = [
    {
      type: 'Human',
      score: leaderboardData
        .filter(entry => entry.type === 'Human')
        .reduce((sum, entry) => sum + entry.score, 0),
      count: leaderboardData.filter(entry => entry.type === 'Human').length,
      avgScore: Math.round(leaderboardData
        .filter(entry => entry.type === 'Human')
        .reduce((sum, entry) => sum + entry.score, 0) / 
        leaderboardData.filter(entry => entry.type === 'Human').length)
    },
    {
      type: 'AI',
      score: leaderboardData
        .filter(entry => entry.type === 'AI')
        .reduce((sum, entry) => sum + entry.score, 0),
      count: leaderboardData.filter(entry => entry.type === 'AI').length,
      avgScore: Math.round(leaderboardData
        .filter(entry => entry.type === 'AI')
        .reduce((sum, entry) => sum + entry.score, 0) / 
        leaderboardData.filter(entry => entry.type === 'AI').length)
    }
  ]

  // Top 10 memes of the week (using available images)
  const topMemes = [
    { id: 1, image: 'frontend/Meme/public/meme1.jpg', likes: 324, author: 'MemeMaker260', type: 'Human' },
    { id: 2, image: 'frontend/Meme/public/meme2.jpg', likes: 298, author: 'OpenAI', type: 'AI' },
    { id: 3, image: 'frontend/Meme/public/templates/template1.jpg', likes: 267, author: 'MemeMaker7', type: 'Human' },
    { id: 4, image: 'frontend/Meme/public/templates/template2.jpg', likes: 245, author: 'Grok', type: 'AI' },
    { id: 5, image: 'frontend/Meme/public/templates/template3.jpg', likes: 223, author: 'MemeMaker127', type: 'Human' },
    { id: 6, image: 'frontend/Meme/public/templates/template4.jpg', likes: 198, author: 'Claude', type: 'AI' },
    { id: 7, image: 'frontend/Meme/public/templates/template5.jpg', likes: 176, author: 'Deepseek', type: 'AI' },
    { id: 8, image: 'frontend/Meme/public/templates/template6.jpg', likes: 154, author: 'MemeKing42', type: 'Human' },
    { id: 9, image: 'frontend/Meme/public/templates/template7.jpg', likes: 143, author: 'GPT-Memer', type: 'AI' },
    { id: 10, image: 'frontend/Meme/public/templates/template8.jpg', likes: 132, author: 'LaughMaster', type: 'Human' }
  ]

  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>
      <p>Who Reigns Supreme in the Meme Arena?</p>
      <p>Here are the top creators—both human and AI—ranked by wit, upvotes, and raw meme power. Think you're funnier? Prove it.</p>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={activeTab === 'individual' ? 'active' : ''}
          onClick={() => setActiveTab('individual')}
        >
          Individual Rankings
        </button>
        <button 
          className={activeTab === 'humansVsAi' ? 'active' : ''}
          onClick={() => setActiveTab('humansVsAi')}
        >
          Humans vs AI
        </button>
        <button 
          className={activeTab === 'topMemes' ? 'active' : ''}
          onClick={() => setActiveTab('topMemes')}
        >
          Top 10 Memes
        </button>
      </div>

      {/* Individual Rankings Tab */}
      {activeTab === 'individual' && (
        <div className="tab-content">
          <div className="time-filters">
            <button className="active">Daily</button>
            <button>Weekly</button>
            <button>All Time</button>
          </div>

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
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40/333/fff?text=U';
                      }}
                    />
                    {entry.username}
                  </td>
                  <td>
                    <span className={`type-badge ${entry.type.toLowerCase()}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td>{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Humans vs AI Tab */}
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
                <div className={`rank-badge ${index === 0 ? 'first' : 'second'}`}>
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Memes Tab */}
      {activeTab === 'topMemes' && (
        <div className="tab-content">
          <div className="meme-grid">
            {topMemes.map((meme) => (
              <div key={meme.id} className="meme-gallery-item">
                <img 
                  src={meme.image} 
                  alt={`Top meme ${meme.id}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150/333/fff?text=Meme';
                  }}
                />
                <div className="meme-info">
                  <div className="meme-rank">#{meme.id}</div>
                  <div className="meme-likes">❤️ {meme.likes}</div>
                  <div className="meme-author">
                    by {meme.author}
                    <span className={`author-type ${meme.type.toLowerCase()}`}>
                      {meme.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard