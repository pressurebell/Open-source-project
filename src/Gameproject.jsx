import { useState, useEffect } from "react";
import { Card, Typography, Button, LinearProgress, Container } from "@mui/material";
import { AddCircle, CheckCircle } from "@mui/icons-material";

export default function ProductivityTracker() {
  const [tasks, setTasks] = useState([]);

  // Populate tasks to ensure they exist
  useEffect(() => {
    setTasks([
      { id: 1, text: "Complete an open-source contribution", completed: false },
      { id: 2, text: "Read 10 pages of a book", completed: false },
      { id: 3, text: "Exercise for 30 minutes", completed: false },
    ]);
  }, []);

  const [progress, setProgress] = useState(0);

  const completeTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks);
    updateProgress(updatedTasks);
  };

  const updateProgress = (updatedTasks) => {
    const completedTasks = updatedTasks.filter((task) => task.completed).length;
    const totalTasks = updatedTasks.length;
    setProgress((completedTasks / totalTasks) * 100);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop:'20px',
      }}
    >
      <Card
        sx={{
          width: "100%",
          p: 3,
          bgcolor: "#1E1E1E",
          color: "white",
          borderRadius: 5,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.6)",
        }}
      >
        <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 2 }}>
          Gamified Productivity Tracker
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 5,
            bgcolor: "#2D2D2D",
            mb: 3,
            "& .MuiLinearProgress-bar": { backgroundColor: "#008f39" },
          }}
        />

        {tasks.length === 0 ? (
          <Typography variant="body1" sx={{ color: "white", textAlign: "center", mt: 3 }}>
            No tasks found.
          </Typography>
        ) : (
          tasks.map((task) => (
            <Card
              key={task.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                mb: 2,
                borderRadius: 5,
                bgcolor: "white",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Typography variant="body1" sx={{ color: "black", fontWeight: "bold" }}>
                {task.text}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "green",
                  color: "black",
                  fontWeight: "bold",
                  borderRadius: "50px",
                  px: 3,
                  py: 1,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#f0f0f0" },
                }}
                onClick={() => completeTask(task.id)}
                disabled={task.completed}
                startIcon={task.completed ? <CheckCircle sx={{ color: "black" }} /> : <AddCircle sx={{ color: "black" }} />}
              >
                {task.completed ? "Completed" : "Complete"}
              </Button>
            </Card>
          ))
        )}
      </Card>
    </Container>
  );
}
