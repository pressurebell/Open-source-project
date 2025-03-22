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
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 4, minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🚀 Productivity Gamification Tracker
      </Typography>

      {/* Level Card */}
      <Card sx={{ width: 360, mb: 4, p: 2 }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h5">Level {level}</Typography>
          <Box sx={{ my: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
          <Typography>{100 - progress} points to next level</Typography>
        </CardContent>
      </Card>

      {/* Task List */}
      <Box sx={{ display: "grid", gap: 2, width: 360 }}>
        {tasks.map((task) => (
          <Card key={task.id} sx={{ p: 2, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <Typography>{task.name}</Typography>
            <Button
              variant="contained"
              color={completedTasks.includes(task) ? "success" : "primary"}
              onClick={() => completeTask(task)}
              disabled={completedTasks.includes(task)}
              startIcon={completedTasks.includes(task) ? <CheckCircle size={20} /> : null}
            >
              {completedTasks.includes(task) ? "Completed" : "Complete"}
            </Button>
          </Card>
        ))}
      </Box>

      {/* Level Up Animation */}
      {progress === 0 && completedTasks.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginTop: "24px", fontSize: "24px", color: "#ffcc00" }}
        >
          <Trophy size={32} /> Level Up!
        </motion.div>
      )}
    </Box>
  );
}
