import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
        {/* Google Login Modal */}
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
            <a href="/" onClick={closeSidebar}>Voting</a>
            <a href="/leaderboard" onClick={closeSidebar}>Leaderboard</a>
            <a href="/submit" onClick={closeSidebar}>Submit Meme</a>
            <a href="/about" onClick={closeSidebar}>About</a>
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
