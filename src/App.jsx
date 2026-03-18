import { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import CheckIn from './pages/CheckIn';
import Progress from './pages/Progress';
import AdminDatabase from './pages/AdminDatabase';
import Breathing from './pages/Breathing';
import Journal from './pages/Journal';
import Education from './pages/Education';
import Profile from './pages/Profile';
import MiniGame from './pages/MiniGame';
import ZenGame from './pages/ZenGame';
import JoyGame from './pages/JoyGame';
import Community from './pages/Community';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import SoundscapeMenu from './components/SoundscapeMenu';
import SOSButton from './components/SOSButton';
import './index.css';

function App() {


  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    // Initial theme load
    const storedUser = localStorage.getItem('moodify_currentUser');
    if (storedUser) {
      const userKey = `moodify_data_${storedUser}`;
      const savedData = localStorage.getItem(userKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.theme) {
          document.documentElement.setAttribute('data-theme', parsed.theme);
        }
      }
    }
  }, []);

  const handleGlobalClick = (e) => {
    // Only play sound if clicking a button, link, or interactive element
    const isInteractive = e.target.closest('button, a, input[type="range"], .mood-btn, .suggestion-chip, .checkin-save-btn, .admin-stat-card');
    if (isInteractive) {
      playClickSound();
    }
  };

  return (
    <Router>
      <div className="app-container" onClick={handleGlobalClick}>
        <SoundscapeMenu />
        <SOSButton />

        {/* Main Content Area */}
        <div className="content-area" style={{ paddingBottom: '70px' }}>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/admin" element={<AdminDatabase />} />
            <Route path="/breathing" element={<Breathing />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/education" element={<Education />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/game" element={<MiniGame />} />
            <Route path="/zen" element={<ZenGame />} />
            <Route path="/joy" element={<JoyGame />} />
            <Route path="/community" element={<Community />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>

        {/* Fixed Bottom Navigation conditionally hidden */}
        <Routes>
          <Route path="/admin" element={null} />
          <Route path="/profile" element={null} />
          <Route path="/game" element={null} />
          <Route path="/zen" element={null} />
          <Route path="/joy" element={null} />
          <Route path="/community" element={null} />
          <Route path="*" element={<BottomNav />} />
        </Routes>
        
        {/* Desktop Footer (Hidden on mobile via CSS) */}
        <Routes>
          <Route path="/admin" element={null} />
          <Route path="/chat" element={null} />
          <Route path="/profile" element={null} />
          <Route path="/game" element={null} />
          <Route path="/zen" element={null} />
          <Route path="/joy" element={null} />
          <Route path="/community" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
