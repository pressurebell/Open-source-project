import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import './App.css';
import TetrisGame from './Gameproject';
import Homescreen from './Homescreen';

function App() {
  return (
  
   <Router>
      <Routes>
        <Route path="/" element={<Homescreen/>} />
        <Route path="/game" element={<TetrisGame/>} />
      </Routes>
    </Router>
  
  );
}

export default App;
