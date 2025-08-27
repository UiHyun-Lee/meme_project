import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Header from './components/Header'
import Voting from './components/Voting'
import Leaderboard from './components/Leaderboard'
import SubmitMeme from './components/SubmitMeme'
import About from './components/About'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="App">
        <Header />
        
        <nav className="main-nav">
          <Link to="/">Voting</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/submit">Submit Meme</Link>
          <Link to="/about">About</Link>
        </nav>

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