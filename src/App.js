import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homescreen from './Homescreen';
import FlappyBird from "./Gameproject";


const SplashScreen = ({ isLoading }) => {
  return (
    <div className={`splash-screen ${isLoading ? 'active' : ''}`}>
      <div className="splash-content">
        <div className="game-title">Flappy Bird</div>
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
        <div className="loading-text">Loading Game...</div>
      </div>
      
      <style jsx>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s, visibility 0.3s;
        }
        
        .splash-screen.active {
          opacity: 1;
          visibility: visible;
        }
        
        .splash-content {
          text-align: center;
          width: 80%;
          max-width: 500px;
        }
        
        .game-title {
          font-size: 48px;
          font-weight: bold;
          color: #fff;
          text-shadow: 0 0 10px #39ff14, 0 0 20px #39ff14;
          margin-bottom: 30px;
          letter-spacing: 8px;
          animation: pulse 1.5s infinite alternate;
        }
        
        @keyframes pulse {
          from { opacity: 0.7; text-shadow: 0 0 5px #39ff14, 0 0 10px #39ff14; }
          to { opacity: 1; text-shadow: 0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14; }
        }
        
        .loading-bar-container {
          width: 100%;
          height: 20px;
          background-color: #333;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 15px;
        }
        
        .loading-bar {
          height: 100%;
          width: 10%;
          background: linear-gradient(to right, #39ff14, #00b3ff);
          border-radius: 10px;
          animation: loading 2s forwards;
        }
        
        @keyframes loading {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .loading-text {
          color: #ccc;
          font-size: 16px;
          letter-spacing: 2px;
        }
      `}</style>
    </div>
  );
};

// Game loader wrapper component
const GameLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Hide splash screen after a delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 second loading screen to match animation duration
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <SplashScreen isLoading={isLoading} />
      {!isLoading && <FlappyBird/>}
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homescreen />} />
        <Route path="/game" element={<GameLoader />} />
      </Routes>
    </Router>
  );
}

export default App;