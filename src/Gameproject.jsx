import React, { useState, useEffect, useRef, useCallback } from 'react';

const FlappyBirdGame = () => {
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 500;
  const BIRD_WIDTH = 30;
  const BIRD_HEIGHT = 30;
  const PIPE_WIDTH = 60;
  const GRAVITY = 0.5;
  const JUMP_FORCE = -10;
  const DROP_FORCE = 5; // Force for pressing down key
  const PIPE_GAP = 150;
  const PIPE_SPEED = 2;
  const PIPE_DISTANCE = 250; // Distance between pipes
  
  const [birdPosition, setBirdPosition] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  
  // Custom tasks that user can toggle manually
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Avoid hitting any pipes', completed: false },
    { id: 2, text: 'Play for at least 1 minute', completed: false },
    { id: 3, text: 'Score at least 10 points', completed: false },
    { id: 4, text: 'Use down arrow 5 times', completed: false }
  ]);
  
  const gameLoopRef = useRef(null);
  const timeCounterRef = useRef(null);
  const gameRunningRef = useRef(false);
  const gameContainerRef = useRef(null);
  const lastPipeRef = useRef(null);
  
  // Function to toggle task completion manually
  const toggleTaskCompletion = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
  };
  
  // Create a function that returns a new pipe
  const createNewPipe = () => {
    const topHeight = Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP - 150)) + 50;
    const bottomY = topHeight + PIPE_GAP;
    return {
      id: Date.now(), // Add unique id for each pipe
      x: GAME_WIDTH,
      topHeight,
      bottomY,
      passed: false
    };
  };
  
  // Initialize first pipe when game starts
  useEffect(() => {
    if (gameStarted && pipes.length === 0) {
      setPipes([createNewPipe()]);
      lastPipeRef.current = GAME_WIDTH;
    }
  }, [gameStarted, pipes.length]);
  
  const startGame = () => {
    // Clear any existing intervals first
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (timeCounterRef.current) clearInterval(timeCounterRef.current);
    
    setGameStarted(true);
    setGameOver(false);
    setBirdPosition(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    
    // Initialize with one pipe
    setPipes([createNewPipe()]);
    lastPipeRef.current = GAME_WIDTH;
    
    setScore(0);
    setGameTime(0);
    
    // Reset tasks (but keep completed status since user manages them manually)
    
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
      
      // Check for pipe passed (scoring)
      updatedPipes.forEach(pipe => {
        if (!pipe.passed && pipe.x < 100 - PIPE_WIDTH) {
          pipe.passed = true;
          setScore(prev => prev + 1);
        }
      });
      
      // Remove pipes that are off screen
      const visiblePipes = updatedPipes.filter(pipe => pipe.x > -PIPE_WIDTH);
      
      // Add new pipe when needed
      const lastPipe = visiblePipes[visiblePipes.length - 1];
      if (lastPipe && GAME_WIDTH - lastPipe.x >= PIPE_DISTANCE) {
        visiblePipes.push(createNewPipe());
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
  
  const handleJump = useCallback(() => {
    if (!gameStarted) {
      startGame();
    } else if (gameOver) {
      startGame();
    } else {
      // Just make the bird jump if the game is already running
      setBirdVelocity(JUMP_FORCE);
    }
  }, [gameStarted, gameOver]);

  const handleDropFaster = useCallback(() => {
    if (gameStarted && !gameOver) {
      setBirdVelocity(prev => prev + DROP_FORCE);
    }
  }, [gameStarted, gameOver]);
  
  // Handle keyboard controls separately from the game container focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent scrolling with arrow keys and space
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
      }
      
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleJump();
      } else if (e.code === 'ArrowDown') {
        handleDropFaster();
      }
    };
    
    // Add global event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, gameOver, handleJump, handleDropFaster]);
  
  // Cleanup intervals on component unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (timeCounterRef.current) clearInterval(timeCounterRef.current);
      gameRunningRef.current = false;
    };
  }, []);
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: 'flex-start', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      gap: '20px',
      padding: '20px',
      backgroundImage: `url("/pictures/background.jpg")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
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

          {/* Pipes - Explicitly rendered with fixed positions for visibility */}
          {pipes.map((pipe) => (
            <React.Fragment key={pipe.id}>
              {/* Top pipe */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${pipe.x}px`,
                  width: `${PIPE_WIDTH}px`,
                  height: `${pipe.topHeight}px`,
                  backgroundColor: '#3AC14A',
                  borderRight: '3px solid #2C9939',
                  borderLeft: '3px solid #2C9939',
                  borderBottom: '3px solid #2C9939',
                  boxSizing: 'border-box',
                  zIndex: 5
                }}
              >
                {/* Pipe cap */}
                <div style={{
                  position: 'absolute',
                  bottom: '-15px',
                  left: '-5px',
                  width: `${PIPE_WIDTH + 10}px`,
                  height: '15px',
                  backgroundColor: '#3AC14A',
                  borderRadius: '0 0 5px 5px',
                  border: '3px solid #2C9939',
                  boxSizing: 'border-box'
                }} />
              </div>
              
              {/* Bottom pipe */}
              <div
                style={{
                  position: 'absolute',
                  top: `${pipe.bottomY}px`,
                  left: `${pipe.x}px`,
                  width: `${PIPE_WIDTH}px`,
                  height: `${GAME_HEIGHT - pipe.bottomY}px`,
                  backgroundColor: '#3AC14A',
                  borderRight: '3px solid #2C9939',
                  borderLeft: '3px solid #2C9939',
                  borderTop: '3px solid #2C9939',
                  boxSizing: 'border-box',
                  zIndex: 5
                }}
              >
                {/* Pipe cap */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '-5px',
                  width: `${PIPE_WIDTH + 10}px`,
                  height: '15px',
                  backgroundColor: '#3AC14A',
                  borderRadius: '5px 5px 0 0',
                  border: '3px solid #2C9939',
                  boxSizing: 'border-box'
                }} />
              </div>
            </React.Fragment>
          ))}

          {/* Ground */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              width: '100%',
              height: '50px',
              backgroundColor: '#8B4513',
              borderTop: '2px solid #5D4037',
              zIndex: 6
            }}
          />

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
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                zIndex: 20
              }}
            >
              <h2>Flappy Bird</h2>
              <p>Press Space/Up Arrow or Click to Start</p>
              <p>Use Down Arrow to drop faster</p>
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
              <p>Press Space/Up Arrow or Click to Restart</p>
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

      {/* Task Tracker - Modified for manual toggling */}
      <div style={{
        width: '250px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        zIndex: 2,
        margin: '90px 20px 0 20px',
      }}>
        <h2 style={{ 
          borderBottom: '2px solid #3AC14A', 
          paddingBottom: '8px',
          marginTop: 0,
          color: '#333'
        }}>
          My Tasks
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
              border: '1px solid #ddd',
              cursor: 'pointer',
            }}
            onClick={() => toggleTaskCompletion(task.id)}
            >
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
        
        {/* Add Task Button */}
        <button
          onClick={() => {
            const newTaskText = prompt("Enter a new task:");
            if (newTaskText && newTaskText.trim() !== "") {
              setTasks(prevTasks => [
                ...prevTasks, 
                { 
                  id: Date.now(), 
                  text: newTaskText.trim(), 
                  completed: false 
                }
              ]);
            }
          }}
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '15px',
            backgroundColor: '#3AC14A',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Add New Task
        </button>
        
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
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Controls</h3>
          <p style={{ margin: '5px 0' }}><strong>Space/Up Arrow:</strong> Jump</p>
          <p style={{ margin: '5px 0' }}><strong>Down Arrow:</strong> Drop faster</p>
          <p style={{ margin: '5px 0' }}><strong>Click:</strong> Jump</p>
          <p style={{ margin: '5px 0' }}><strong>Task Click:</strong> Toggle completion</p>
        </div>
      </div>
    </div>
  );
};

export default FlappyBirdGame;