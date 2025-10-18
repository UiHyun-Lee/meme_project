import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Voting from './components/Voting'
import Leaderboard from './components/Leaderboard'
import SubmitMeme from './components/SubmitMeme'
import About from './components/About'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <Router>
      <div className="App">
        {/* Sidebar Menu Toggle */}
        <button className="menu-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>

        {/* Sidebar Overlay */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={closeSidebar}
        ></div>

        {/* Sidebar Navigation */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-nav">
            <a href="/" onClick={closeSidebar}>
              <i className="fas fa-vote-yea"></i> Voting
            </a>
            <a href="/leaderboard" onClick={closeSidebar}>
              <i className="fas fa-trophy"></i> Leaderboard
            </a>
            <a href="/submit" onClick={closeSidebar}>
              <i className="fas fa-upload"></i> Submit Meme
            </a>
            <a href="/about" onClick={closeSidebar}>
              <i className="fas fa-info-circle"></i> About
            </a>
          </div>
        </div>

        {/* Main Content */}
        <Routes>
          <Route path="/" element={<Voting />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/submit" element={<SubmitMeme />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App