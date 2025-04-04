import React, { useState, useEffect } from 'react';

const SplashScreen = ({ isLoading }) => {
  return (
    <div className={`splash-screen ${isLoading ? 'active' : ''}`}>
      <div className="splash-logo">
        <div className="splash-logo-text">SAP</div>
      </div>
      <div className="splash-spinner"></div>
      
      <style jsx>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #2563eb;
          display: flex;
          flex-direction: column;
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
        
        .splash-logo {
          width: 100px;
          height: 100px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .splash-logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        
        .splash-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
