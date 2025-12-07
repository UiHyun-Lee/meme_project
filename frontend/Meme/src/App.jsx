import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Voting from './components/Voting'
import Leaderboard from './components/Leaderboard'
import SubmitMeme from './components/SubmitMeme'
import About from './components/About'
import Impressum from './components/Impressum'
import LoginModal from './components/LoginModal'
import Header from "./components/Header";
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  useEffect(() => {
    const openModal = () => setShowLogin(true)
    window.addEventListener("openGoogleLogin", openModal)
    return () => window.removeEventListener("openGoogleLogin", openModal)
  }, [])

  return (
    <Router>
      <div className="App">
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSuccess={() => setShowLogin(false)}
          />
        )}

        <Header />

        <button className="menu-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>

        <div
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={closeSidebar}
        ></div>

        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-nav">
            <Link to="/" onClick={closeSidebar}>Voting</Link>
            <Link to="/leaderboard" onClick={closeSidebar}>Leaderboard</Link>
            <Link to="/submit" onClick={closeSidebar}>Submit Meme</Link>
            <Link to="/about" onClick={closeSidebar}>About</Link>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Voting />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/submit" element={<SubmitMeme />} />
          <Route path="/about" element={<About />} />
          <Route path="/impressum" element={<Impressum />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
