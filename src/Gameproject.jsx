import { useState, useEffect, useCallback, useRef } from "react";
import { Card, Typography, LinearProgress, Box, Button, Checkbox, List, ListItem, ListItemText } from "@mui/material";

const gridWidth = 10;
const gridHeight = 20;
const initialBoard = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

const shapes = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]]
];

const tasks = ["Start Game", "Reach Level 2", "Score 100 Points", "Complete a Full Line"];

export default function TetrisGame() {
  const [board, setBoard] = useState(initialBoard);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentShape, setCurrentShape] = useState(null);
  const [position, setPosition] = useState({ x: 4, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [taskCompletion, setTaskCompletion] = useState(Array(tasks.length).fill(false));
  const [gameStarted, setGameStarted] = useState(false);
  
  // Using ref for the interval to avoid dependency issues
  const gameIntervalRef = useRef(null);
  // Refs for current state values to use in interval callback
  const positionRef = useRef(position);
  const currentShapeRef = useRef(currentShape);
  const gameStartedRef = useRef(gameStarted);
  const gameOverRef = useRef(gameOver);
  const boardRef = useRef(board);
  
  // Update refs when state changes
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  
  useEffect(() => {
    currentShapeRef.current = currentShape;
  }, [currentShape]);
  
  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);
  
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);
  
  useEffect(() => {
    boardRef.current = board;
  }, [board]);
  
  const randomShape = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * shapes.length);
    // Deep clone the shape to avoid reference issues
    return JSON.parse(JSON.stringify(shapes[randomIndex]));
  }, []);

  const checkCollision = useCallback((shape, pos) => {
    if (!shape) return true;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = pos.x + x;
          const boardY = pos.y + y;
          
          // Check boundaries
          if (boardX < 0 || boardX >= gridWidth || boardY >= gridHeight) {
            return true;
          }
          
          // Check collision with existing pieces
          if (boardY >= 0 && boardRef.current[boardY] && boardRef.current[boardY][boardX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const mergeShapeWithBoard = useCallback(() => {
    const shape = currentShapeRef.current;
    const pos = positionRef.current;
    
    if (!shape) return boardRef.current;
    
    const newBoard = boardRef.current.map(row => [...row]);
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = pos.y + y;
          const boardX = pos.x + x;
          
          if (boardY >= 0 && boardY < gridHeight && boardX >= 0 && boardX < gridWidth) {
            newBoard[boardY][boardX] = 1;
          }
        }
      }
    }
    
    setBoard(newBoard);
    return newBoard;
  }, []);

  const clearLines = useCallback((boardToCheck) => {
    if (!boardToCheck) return false;
    
    const newBoard = [...boardToCheck];
    let linesCleared = 0;
    
    for (let y = gridHeight - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell === 1)) {
        // Remove the line
        newBoard.splice(y, 1);
        // Add a new empty line at the top
        newBoard.unshift(Array(gridWidth).fill(0));
        linesCleared++;
        y++; // Check the same row again
      }
    }
    
    if (linesCleared > 0) {
      const newScore = score + linesCleared * 10 * level;
      setScore(newScore);
      
      const newProgress = progress + linesCleared * 5;
      if (newProgress >= 100) {
        const newLevel = level + 1;
        setLevel(newLevel);
        setProgress(0);
        
        // Update level completion task
        const newTaskCompletion = [...taskCompletion];
        if (newLevel >= 2) {
          newTaskCompletion[1] = true; // "Reach Level 2" task
        }
        setTaskCompletion(newTaskCompletion);
        
        // Adjust game speed
        restartGameInterval(newLevel);
      } else {
        setProgress(newProgress);
      }
      
      // Update task completion
      const newTaskCompletion = [...taskCompletion];
      newTaskCompletion[3] = true; // "Complete a Full Line" task
      if (newScore >= 100) {
        newTaskCompletion[2] = true; // "Score 100 Points" task
      }
      setTaskCompletion(newTaskCompletion);
      
      setBoard(newBoard);
      return true;
    }
    
    return false;
  }, [level, score, progress, taskCompletion]);

  const moveDown = useCallback(() => {
    if (!currentShapeRef.current || !gameStartedRef.current || gameOverRef.current) return;
    
    const newPos = { ...positionRef.current, y: positionRef.current.y + 1 };
    
    if (checkCollision(currentShapeRef.current, newPos)) {
     
      const newBoard = mergeShapeWithBoard();
      
     
      clearLines(newBoard);
      
     
      const newShape = randomShape();
      const newPosition = { x: 4, y: 0 };
      
     
      if (checkCollision(newShape, newPosition)) {
        stopGameInterval();
        setGameOver(true);
        setGameStarted(false);
        return;
      }
      
      setCurrentShape(newShape);
      setPosition(newPosition);
    } else {
      setPosition(newPos);
    }
  }, [checkCollision, clearLines, mergeShapeWithBoard, randomShape]);

  const moveLeft = useCallback(() => {
    if (!currentShapeRef.current || !gameStartedRef.current || gameOverRef.current) return;
    
    const newPos = { ...positionRef.current, x: positionRef.current.x - 1 };
    if (!checkCollision(currentShapeRef.current, newPos)) {
      setPosition(newPos);
    }
  }, [checkCollision]);

  const moveRight = useCallback(() => {
    if (!currentShapeRef.current || !gameStartedRef.current || gameOverRef.current) return;
    
    const newPos = { ...positionRef.current, x: positionRef.current.x + 1 };
    if (!checkCollision(currentShapeRef.current, newPos)) {
      setPosition(newPos);
    }
  }, [checkCollision]);

  const rotateShape = useCallback(() => {
    if (!currentShapeRef.current || !gameStartedRef.current || gameOverRef.current) return;
    const shape = currentShapeRef.current;
    
    if (!shape || !shape[0]) return;
    
    try {
     
      const height = shape[0].length;
      const width = shape.length;
      const rotated = Array(height).fill().map(() => Array(width).fill(0));
      
     
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          rotated[x][width - 1 - y] = shape[y][x];
        }
      }
      
      if (!checkCollision(rotated, positionRef.current)) {
        setCurrentShape(rotated);
      }
    } catch (error) {
      console.error("Rotation error:", error);
    }
  }, [checkCollision]);

  
  const startGameInterval = useCallback((level = 1) => {
    stopGameInterval();
    
    const speed = Math.max(100, 1000 - (level - 1) * 100); 
    
    gameIntervalRef.current = setInterval(() => {
      moveDown();
    }, speed);
  }, [moveDown]);
  
  const restartGameInterval = useCallback((level = 1) => {
    stopGameInterval();
    startGameInterval(level);
  }, [startGameInterval]);
  
  const stopGameInterval = useCallback(() => {
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
  }, []);

  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStartedRef.current || gameOverRef.current) return;
      
      switch(e.key) {
        case "ArrowLeft":
          moveLeft();
          break;
        case "ArrowRight":
          moveRight();
          break;
        case "ArrowDown":
          moveDown();
          break;
        case "ArrowUp":
          rotateShape();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [moveDown, moveLeft, moveRight, rotateShape]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopGameInterval();
    };
  }, [stopGameInterval]);

  const handleTaskCheck = (index) => {
    setTaskCompletion((prev) => {
      const newTasks = [...prev];
      newTasks[index] = !newTasks[index];
      return newTasks;
    });
  };

  const startGame = () => {
    // Clear previous game state
    stopGameInterval();
    
    // Reset game state
    const freshBoard = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));
    setBoard(freshBoard);
    setScore(0);
    setLevel(1);
    setProgress(0);
    
    // Get initial shape and position
    const initialShape = randomShape();
    setCurrentShape(initialShape);
    setPosition({ x: 4, y: 0 });
    
    setGameOver(false);
    setGameStarted(true);
    
    // Mark first task as complete
    const newTaskCompletion = Array(tasks.length).fill(false);
    newTaskCompletion[0] = true;
    setTaskCompletion(newTaskCompletion);
    
    // Start game loop
    startGameInterval(1);
  };

  const restartGame = () => {
    startGame();
  };

  // Render current shape on top of the board
  const renderBoard = () => {
    // Create a temporary board for rendering
    const tempBoard = boardRef.current.map(row => [...row]);
    
    // Add current shape to the board
    if (currentShapeRef.current && gameStartedRef.current && !gameOverRef.current) {
      const shape = currentShapeRef.current;
      const pos = positionRef.current;
      
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = pos.y + y;
            const boardX = pos.x + x;
            
            if (boardY >= 0 && boardY < gridHeight && boardX >= 0 && boardX < gridWidth) {
              tempBoard[boardY][boardX] = 2; // Use 2 to differentiate the active shape
            }
          }
        }
      }
    }
    
    return tempBoard;
  };
  
  return (
    <Box id="tetris-game" sx={{  display: "flex", justifyContent: "space-between", padding: 3, backgroundColor: "#16213e", minHeight: "100vh" }}>
      <Card sx={{ p: 3, backgroundColor: "#0d1b2a", color: "white", width: "30%",height:"300px" }}>
        <Typography variant="h5">Task Tracker</Typography>
        <List>
          {tasks.map((task, index) => (
            <ListItem key={index}>
              <Checkbox checked={taskCompletion[index]} onChange={() => handleTaskCheck(index)} />
              <ListItemText primary={task} sx={{ color: "white" }} />
            </ListItem>
          ))}
        </List>
      </Card>
      
      <Box sx={{ textAlign: "center", width: "60%" }}>
        <Card sx={{ p: 3, backgroundColor: "#0d1b2a", color: "white", textAlign: "center" }}>
          <Typography variant="h4">Level {level}</Typography>
          <Typography variant="h6" color="gold">Score: {score}</Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ my: 2, height: 10 }} />
          {gameOver && <Typography variant="h5" color="error">Game Over!</Typography>}
        </Card>
        <Box
          sx={{ 
            display: "grid", 
            gridTemplateColumns: `repeat(${gridWidth}, 20px)`, 
            gridGap: "1px", 
            background: "black", 
            padding: 2, 
            margin: "auto",
            marginTop: 2
          }}
        >
          {renderBoard().map((row, y) =>
            row.map((cell, x) => (
              <Box 
                key={`${x}-${y}`} 
                sx={{ 
                  width: "20px", 
                  height: "20px", 
                  backgroundColor: cell === 0 ? "#1a1a2e" : cell === 1 ? "cyan" : "#00ffaa" 
                }} 
              />
            ))
          )}
        </Box>
        <Box sx={{ marginTop: 2, display: "flex", justifyContent: "center", gap: 2 }}>
          <Button 
            onClick={startGame} 
            disabled={gameStarted && !gameOver} 
            variant="contained" 
            sx={{ bgcolor: "#4CAF50", color: "white", "&:hover": { bgcolor: "#45a049" } }}
          >
            Start
          </Button>
          <Button 
            onClick={restartGame} 
            variant="contained" 
            sx={{ bgcolor: "#f44336", color: "white", "&:hover": { bgcolor: "#d32f2f" } }}
          >
            Restart
          </Button>
        </Box>
        
        {gameStarted && !gameOver && (
          <Box sx={{ marginTop: 2, display: "flex", justifyContent: "center", gap: 2 }}>
            <Button 
              onClick={moveLeft} 
              variant="contained" 
              sx={{ bgcolor: "#2196F3", color: "white" }}
            >
              ←
            </Button>
            <Button 
              onClick={moveDown} 
              variant="contained" 
              sx={{ bgcolor: "#2196F3", color: "white" }}
            >
              ↓
            </Button>
            <Button 
              onClick={moveRight} 
              variant="contained" 
              sx={{ bgcolor: "#2196F3", color: "white" }}
            >
              →
            </Button>
            <Button 
              onClick={rotateShape} 
              variant="contained" 
              sx={{ bgcolor: "#2196F3", color: "white" }}
            >
              Rotate
            </Button>
          </Box>
        )}
        
        {gameStarted && (
          <Typography variant="body2" sx={{ mt: 2, color: "white" }}>
            Use arrow keys to control: ← → ↓ and ↑ to rotate
          </Typography>
        )}
      </Box>
    </Box>
  );
}