import React, { useState, useEffect, useRef } from 'react';

const FlappyBirdGame = () => {
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 500;
  const BIRD_WIDTH = 30;
  const BIRD_HEIGHT = 30;
  const PIPE_WIDTH = 60;
  const GRAVITY = 0.5;
  const JUMP_FORCE = -10;
  const PIPE_GAP = 150;
  const PIPE_SPEED = 2;
  
  const [birdPosition, setBirdPosition] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Score 5 points', completed: false },
    { id: 2, text: 'Pass through 10 pipes', completed: false },
    { id: 3, text: 'Survive for 30 seconds', completed: false }
  ]);
  
  const gameLoopRef = useRef(null);
  const timeCounterRef = useRef(null);
  const gameRunningRef = useRef(false);
  const gameContainerRef = useRef(null);
  
  // Update tasks based on game progress
  useEffect(() => {
    if (gameStarted && !gameOver) {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === 1) {
            return { ...task, completed: score >= 5 };
          } else if (task.id === 2) {
            return { ...task, completed: score >= 10 };
          } else if (task.id === 3) {
            return { ...task, completed: gameTime >= 30 };
          }
          return task;
        })
      );
    }
  }, [score, gameTime, gameStarted, gameOver]);
  
  // Initialize first pipe when game starts
  useEffect(() => {
    if (gameStarted && pipes.length === 0) {
      addNewPipe();
    }
  }, [gameStarted, pipes.length]);
  
  const addNewPipe = () => {
    const topHeight = Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP - 100)) + 50;
    const bottomY = topHeight + PIPE_GAP;
    setPipes(prev => [...prev, {
      x: GAME_WIDTH,
      topHeight,
      bottomY,
      passed: false
    }]);
  };
  
  const startGame = () => {
    // Clear any existing intervals first
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (timeCounterRef.current) clearInterval(timeCounterRef.current);
    
    setGameStarted(true);
    setGameOver(false);
    setBirdPosition(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameTime(0);
    
    // Reset tasks
    setTasks(prevTasks => 
      prevTasks.map(task => ({ ...task, completed: false }))
    );
    
    // Use a flag to track if game is running
    gameRunningRef.current = true;
    
    // Start the game loop
    gameLoopRef.current = setInterval(() => {
      if (gameRunningRef.current) {
        updateGameState();
      }
    }, 20);
    
    // Start the timer
    timeCounterRef.current = setInterval(() => {
      if (gameRunningRef.current) {
        setGameTime(prev => prev + 1);
      }
    }, 1000);
    
    // Focus the game container to capture keyboard events
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  };
  
  const updateGameState = () => {
    // Skip update if game is over
    if (gameOver) return;
    
    // Update bird position and apply gravity
    setBirdPosition(prev => {
      const newPosition = prev + birdVelocity;
      return newPosition;
    });
    
    setBirdVelocity(prev => prev + GRAVITY);
    
    // Check if bird hits boundaries
    if (birdPosition <= 0 || birdPosition >= GAME_HEIGHT - 50 - BIRD_HEIGHT) {
      endGame();
      return;
    }
    
    // Update pipes and check collisions
    setPipes(prevPipes => {
      // Move pipes to the left
      const updatedPipes = prevPipes.map(pipe => ({
        ...pipe,
        x: pipe.x - PIPE_SPEED
      }));
      
      // Check for scoring
      updatedPipes.forEach(pipe => {
        if (!pipe.passed && pipe.x < 100 - PIPE_WIDTH) {
          pipe.passed = true;
          setScore(prev => prev + 1);
        }
      });
      
      // Remove pipes that are off screen
      const visiblePipes = updatedPipes.filter(pipe => pipe.x > -PIPE_WIDTH);
      
      // Add new pipe when needed
      if (visiblePipes.length === 0 || visiblePipes[visiblePipes.length - 1].x < GAME_WIDTH - 200) {
        const topHeight = Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP - 100)) + 50;
        const bottomY = topHeight + PIPE_GAP;
        visiblePipes.push({
          x: GAME_WIDTH,
          topHeight,
          bottomY,
          passed: false
        });
      }
      
      // Check for collisions
      for (const pipe of visiblePipes) {
        if (
          100 + BIRD_WIDTH > pipe.x && 
          100 < pipe.x + PIPE_WIDTH && 
          (birdPosition < pipe.topHeight || birdPosition + BIRD_HEIGHT > pipe.bottomY)
        ) {
          endGame();
          break;
        }
      }
      
      return visiblePipes;
    });
  };
  
  const endGame = () => {
    gameRunningRef.current = false;
    setGameOver(true);
  };
  
  const handleJump = () => {
    if (!gameStarted || gameOver) {
      startGame();
    } else {
      // Just make the bird jump if the game is already running
      setBirdVelocity(JUMP_FORCE);
    }
  };
  
  // Set up key listener for space bar
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleJump();
      }
    };
    
    // Add event listener to window
    window.addEventListener('keydown', handleKeyPress);
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (timeCounterRef.current) clearInterval(timeCounterRef.current);
      gameRunningRef.current = false;
    };
  }, []); // Empty dependency array to only add the listener once
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: 'flex-start', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      gap: '20px',
      padding: '20px',
      backgroundColor: '#87CEEB',
      minHeight: '100vh',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 2
      }}>
        <h1 style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Flappy Bird</h1>
        
        <div
          ref={gameContainerRef}
          onClick={handleJump}
          tabIndex="0" // Make the div focusable for keyboard events
          style={{
            position: 'relative',
            width: `${GAME_WIDTH}px`,
            height: `${GAME_HEIGHT}px`,
            border: '5px solid #FFD700',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            background: 'linear-gradient(180deg, #87CEEB 0%, #1E90FF 100%)',
            outline: 'none' // Remove focus outline
          }}
        >
          {/* Bird - Updated to look more like a bird */}
          <div style={{
            position: 'absolute',
            left: '100px',
            top: `${birdPosition}px`,
            width: `${BIRD_WIDTH}px`,
            height: `${BIRD_HEIGHT}px`,
            backgroundColor: '#FFFF00',
            borderRadius: '50% 50% 50% 20%',
            border: '2px solid black',
            transform: `rotate(${birdVelocity * 3}deg)`,
            transition: 'transform 0.1s',
            zIndex: 10,
            boxShadow: '1px 1px 3px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Eye */}
            <div style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '8px',
              height: '8px',
              backgroundColor: 'black',
              borderRadius: '50%'
            }}/>
            {/* Beak */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '-6px',
              width: '12px',
              height: '6px',
              backgroundColor: 'orange',
              borderRadius: '0 50% 50% 0'
            }}/>
          </div>

          {/* Ground */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              width: '100%',
              height: '50px',
              backgroundColor: '#8B4513',
              borderTop: '2px solid #5D4037'
            }}
          />

          {/* Pipes */}
          {pipes.map((pipe, index) => (
            <React.Fragment key={index}>
              {/* Top pipe */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${pipe.x}px`,
                  width: `${PIPE_WIDTH}px`,
                  height: `${pipe.topHeight}px`,
                  backgroundColor: '#3AC14A',
                  borderRight: '2px solid black',
                  borderLeft: '2px solid black',
                  borderBottom: '2px solid black'
                }}
              />
              {/* Bottom pipe */}
              <div
                style={{
                  position: 'absolute',
                  top: `${pipe.bottomY}px`,
                  left: `${pipe.x}px`,
                  width: `${PIPE_WIDTH}px`,
                  height: `${GAME_HEIGHT - pipe.bottomY}px`,
                  backgroundColor: '#3AC14A',
                  borderRight: '2px solid black', 
                  borderLeft: '2px solid black',
                  borderTop: '2px solid black'
                }}
              />
            </React.Fragment>
          ))}

          {/* Score */}
          {gameStarted && (
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                zIndex: 20
              }}
            >
              {score}
            </div>
          )}

          {/* Timer */}
          {gameStarted && (
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                zIndex: 20
              }}
            >
              {gameTime}s
            </div>
          )}

          {/* Start Screen */}
          {!gameStarted && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'felx-start',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                zIndex: 20
              }}
            >
              <h2>Flappy Bird</h2>
              <p>Press Space or Click to Start</p>
            </div>
          )}

          {/* Game Over Screen */}
          {gameOver && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                zIndex: 20
              }}
            >
              <h2>Game Over</h2>
              <p>Score: {score}</p>
              <p>Time: {gameTime}s</p>
              <p>Press Space or Click to Restart</p>
              <button 
                onClick={startGame}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#FFD700',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                Restart Game
              </button>
            </div>
          )}
        </div>

       
      </div>

      {/* Task Tracker */}
      <div style={{
        width: '250px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        zIndex: 2
      }}>
        <h2 style={{ 
          borderBottom: '2px solid #3AC14A', 
          paddingBottom: '8px',
          marginTop: 0,
          color: '#333'
        }}>
          Task Tracker
        </h2>
        <div>
          {tasks.map(task => (
            <div key={task.id} style={{
              display: 'flex',
              alignItems: 'center',
              margin: '10px 0',
              padding: '8px',
              backgroundColor: task.completed ? '#e6ffe6' : 'white',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid #3AC14A',
                backgroundColor: task.completed ? '#3AC14A' : 'transparent',
                marginRight: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                {task.completed && '✓'}
              </div>
              <span style={{
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? '#666' : 'black'
              }}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
        <div style={{ 
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#e9f7ef',
          borderRadius: '4px' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#3AC14A' }}>Game Stats</h3>
          <p style={{ margin: '5px 0' }}><strong>Current Score:</strong> {score}</p>
          <p style={{ margin: '5px 0' }}><strong>Time:</strong> {gameTime} seconds</p>
          <p style={{ margin: '5px 0' }}><strong>Tasks Completed:</strong> {tasks.filter(t => t.completed).length}/{tasks.length}</p>
        </div>
      </div>
    </div>
  );
};

export default FlappyBirdGame;