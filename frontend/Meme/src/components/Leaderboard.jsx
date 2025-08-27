import React, { useState } from 'react'

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState('daily')
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'human', 'ai'

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

  // Filtered data based on type selection
  const filteredData = leaderboardData.filter(entry => {
    if (typeFilter === 'all') return true
    if (typeFilter === 'human') return entry.type === 'Human'
    if (typeFilter === 'ai') return entry.type === 'AI'
    return true
  })

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
      
      {/* Time Filters */}
      <div className="time-filters">
        <button 
          className={timeFilter === 'daily' ? 'active' : ''}
          onClick={() => setTimeFilter('daily')}
        >
          Daily
        </button>
        <button 
          className={timeFilter === 'weekly' ? 'active' : ''}
          onClick={() => setTimeFilter('weekly')}
        >
          Weekly
        </button>
        <button 
          className={timeFilter === 'allTime' ? 'active' : ''}
          onClick={() => setTimeFilter('allTime')}
        >
          All Time
        </button>
      </div>

      {/* Type Filters */}
      <div className="type-filters">
        <h4>Filter by Type:</h4>
        <div className="filter-buttons">
          <button 
            className={typeFilter === 'all' ? 'active' : ''}
            onClick={() => setTypeFilter('all')}
          >
            All
          </button>
          <button 
            className={typeFilter === 'human' ? 'active' : ''}
            onClick={() => setTypeFilter('human')}
          >
            Human
          </button>
          <button 
            className={typeFilter === 'ai' ? 'active' : ''}
            onClick={() => setTypeFilter('ai')}
          >
            AI
          </button>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="main-leaderboard">
        <h3>Individual Rankings</h3>
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
            {filteredData.map((entry) => (
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

      {/* Summary Leaderboard (Human vs AI) */}
      <div className="summary-leaderboard">
        <h3>Human vs AI - Total Score</h3>
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

      

      {/* Top Memes Gallery */}
      <div className="top-memes-gallery">
        <h3>Top 10 Memes of the Week</h3>
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

      {/*<div style={{marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap'}}>
        <span>Topic</span>
        <span>Topic</span>
        <span>Topic</span>
        <span>Page</span>
        <span>Page</span>
        <span>Page</span>
      </div>*/}
    </div>
  )
}

export default Leaderboard