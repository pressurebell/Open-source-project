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
  const PIPE_GAP = 170;
  const PIPE_SPEED = 2;
  const PIPE_DISTANCE = 250; // Distance between pipes
  
  const [birdPosition, setBirdPosition] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [downKeyCount, setDownKeyCount] = useState(0); // Track down key presses
  const [hasHitPipe, setHasHitPipe] = useState(false); // Track if bird has hit a pipe
  
  // Tasks that update automatically based on game events
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Read a Book', completed: false },
    { id: 2, text: 'Went For Run', completed: false },
    { id: 3, text: 'Reduced Screen time by 1 Hour', completed: false },
  ]);
  
  const gameLoopRef = useRef(null);
  const timeCounterRef = useRef(null);
  const gameRunningRef = useRef(false);
  const gameContainerRef = useRef(null);
  const lastPipeRef = useRef(null);
  const birdPositionRef = useRef(birdPosition);
  const birdVelocityRef = useRef(birdVelocity);
  const pipeHitCheckedRef = useRef(false);
  
  // Keep refs updated with latest state
  useEffect(() => {
    birdPositionRef.current = birdPosition;
    birdVelocityRef.current = birdVelocity;
  }, [birdPosition, birdVelocity]);
  
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
  
  // Check for task completion - runs on every relevant state change
  useEffect(() => {
    if (gameStarted) {
      // Update tasks based on game state
      setTasks(prevTasks => 
        prevTasks.map(task => {
          switch (task.id) {
            case 1: // Avoid hitting pipes task
              // Will be marked as complete when the game ends without hitting a pipe
              return { ...task, completed: gameOver && !hasHitPipe };
            case 2: // Play for 1 minute task
              return { ...task, completed: gameTime >= 60 };
            case 3: // Score 10 points task
              return { ...task, completed: score >= 10 };
            case 4: // Use down arrow 5 times
              return { ...task, completed: downKeyCount >= 5 };
            default:
              return task;
          }
        })
      );
    }
  }, [gameTime, score, downKeyCount, gameOver, hasHitPipe, gameStarted]);
  
  // Reset tasks when game restarts
  const resetTasks = () => {
    setTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        completed: false
      }))
    );
  };
  
  const startGame = () => {
    // Clear any existing intervals first
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (timeCounterRef.current) clearInterval(timeCounterRef.current);
    
    setGameStarted(true);
    setGameOver(false);
    setBirdPosition(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setHasHitPipe(false);
    pipeHitCheckedRef.current = false;
    
    // Initialize with one pipe
    setPipes([createNewPipe()]);
    lastPipeRef.current = GAME_WIDTH;
    
    setScore(0);
    setGameTime(0);
    setDownKeyCount(0);
    
    // Reset tasks for new game
    resetTasks();
    
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
    const newPosition = birdPositionRef.current + birdVelocityRef.current;
    const newVelocity = birdVelocityRef.current + GRAVITY;
    
    setBirdPosition(newPosition);
    setBirdVelocity(newVelocity);
    
    // Update refs immediately for keyboard response
    birdPositionRef.current = newPosition;
    birdVelocityRef.current = newVelocity;
    
    // Check if bird hits boundaries
    if (newPosition <= 0 || newPosition >= GAME_HEIGHT - 50 - BIRD_HEIGHT) {
      endGame(false); // Bird hit top/bottom boundary, not a pipe
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
          (newPosition < pipe.topHeight || newPosition + BIRD_HEIGHT > pipe.bottomY)
        ) {
          endGame(true); // Bird hit a pipe
          break;
        }
      }
      
      return visiblePipes;
    });
  };
  
  const endGame = (hitPipe) => {
    gameRunningRef.current = false;
    setGameOver(true);
    
    // Only set hasHitPipe if it's true and hasn't been checked before
    if (hitPipe && !pipeHitCheckedRef.current) {
      setHasHitPipe(true);
      pipeHitCheckedRef.current = true;
    }
    
    // If game ends without hitting a pipe and lasted more than a few seconds,
    // mark the "avoid hitting pipes" task as complete
    if (!hitPipe && gameTime > 5) {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === 1) {
            return { ...task, completed: true };
          }
          return task;
        })
      );
    }
  };
  
  const handleJump = useCallback(() => {
    if (!gameStarted) {
      startGame();
    } else if (gameOver) {
      startGame();
    } else {
      // Set velocity directly for immediate effect
      const jumpVelocity = JUMP_FORCE;
      setBirdVelocity(jumpVelocity);
      birdVelocityRef.current = jumpVelocity; // Update ref immediately
    }
  }, [gameStarted, gameOver]);

  const handleDropFaster = useCallback(() => {
    if (gameStarted && !gameOver) {
      // Set velocity directly for immediate effect
      const dropVelocity = birdVelocityRef.current + DROP_FORCE;
      setBirdVelocity(dropVelocity);
      birdVelocityRef.current = dropVelocity; // Update ref immediately
      
      // Increment down key counter
      setDownKeyCount(prev => prev + 1);
    }
  }, [gameStarted, gameOver]);
  
  // Function to add a custom task
  const addCustomTask = (taskText) => {
    if (taskText && taskText.trim() !== "") {
      setTasks(prevTasks => [
        ...prevTasks, 
        { 
          id: Date.now(), 
          text: taskText.trim(), 
          completed: false,
          isCustom: true // Flag to identify custom tasks
        }
      ]);
    }
  };
  
  // Handle keyboard controls
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
  }, [handleJump, handleDropFaster]);
  
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
      backgroundImage: `url("/pictures/wallpaper.jpg")`,
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

          {/* Pipes */}
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
     {/* Task Tracker - Now fully automated */}
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
          Game Challenges
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
              transition: 'all 0.3s ease'
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
                fontSize: '12px',
                transition: 'background-color 0.3s ease'
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
            const newTaskText = prompt("Enter a new challenge:");
            if (newTaskText) {
              addCustomTask(newTaskText);
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
          Add Custom Challenge
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
          <p style={{ margin: '5px 0' }}><strong>Down Key Count:</strong> {downKeyCount}/5</p>
          <p style={{ margin: '5px 0' }}><strong>Challenges Completed:</strong> {tasks.filter(t => t.completed).length}/{tasks.length}</p>
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
        </div>
      </div>
    </div>
  );
};

export default FlappyBirdGame;
