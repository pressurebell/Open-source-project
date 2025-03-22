import React, { useState, useEffect } from "react";
import { Button, Card, CardContent, Typography, LinearProgress, Box } from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle, Trophy } from "lucide-react";

const tasks = [
  { id: 1, name: "Complete project proposal", points: 50 },
  { id: 2, name: "Daily stand-up meeting", points: 20 },
  { id: 3, name: "Fix UI bug on dashboard", points: 30 },
  { id: 4, name: "Review pull request", points: 40 },
  { id: 5, name: "Write documentation", points: 25 },
];

export default function ProductivityTracker() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const totalPoints = completedTasks.reduce((acc, task) => acc + task.points, 0);
    setProgress(totalPoints % 100);
    setLevel(Math.floor(totalPoints / 100) + 1);
  }, [completedTasks]);

  const completeTask = (task) => {
    if (!completedTasks.includes(task)) {
      setCompletedTasks([...completedTasks, task]);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        backgroundImage: "url('/Minimalist.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 4,
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.24)",
          padding: 4,
          borderRadius: 4,
        }}
      >
        {/* Level Card on Left */}
        <Card sx={{ width: 360, p: 2, backgroundColor: "rgba(0, 0, 0, 0.46)", color: "white" }}>
          <CardContent>
            <Typography variant="h5">Level {level}</Typography>
            <Box sx={{ my: 2 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, backgroundColor: "white" }} />
            </Box>
            <Typography>{100 - progress} points to next level</Typography>
          </CardContent>
        </Card>

        {/* Task List on Right */}
        <Box sx={{ display: "grid", gap: 2, width: 360 }}>
          {tasks.map((task) => (
            <Card key={task.id} sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)", color: "white" }}>
              <Typography>{task.name}</Typography>
              <Button
              variant="contained"
              color={completedTasks.includes(task) ? "success" : "primary"}
              onClick={() => completeTask(task)}
              disabled={completedTasks.includes(task)}
              startIcon={completedTasks.includes(task) ? <CheckCircle size={20} /> : null}
              sx={{
                backgroundColor: completedTasks.includes(task) ? "#2E7D32" : "#1976D2",
                color: "white",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  backgroundColor: completedTasks.includes(task) ? "#45A049" : "#42A5F5",
                  color: "white",
                },
              }}
            >
              {completedTasks.includes(task) ? "Completed" : "Complete"}
            </Button>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Level Up Animation */}
      {progress === 0 && completedTasks.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            top: "8%",
            fontSize: "24px",
            color: "#ffcc00",
            backgroundColor: "rgba(0, 0, 0, 0.43)",
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          <Trophy size={32} /> Level Up!
        </motion.div>
      )}
    </Box>
  );
}
